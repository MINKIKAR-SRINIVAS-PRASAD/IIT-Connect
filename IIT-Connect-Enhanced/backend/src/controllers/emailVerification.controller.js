import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import PendingEmailVerification from '../models/PendingEmailVerification.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail } from '../utils/allowedIitDomains.js'
import { getRoleForEmail } from '../utils/seedAdmin.js'

const OTP_TTL_MS = 5 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5
const MAX_RESENDS = 5

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function hashOtp(email, otp) {
  return crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${email}:${otp}`).digest('hex')
}

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN })
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN })
}

async function setAuthCookies(res, { accessToken, refreshToken }) {
  const opts = cookieOptions()
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

async function sendOtpEmail(email, otp) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new ApiError(503, 'Email verification is not configured yet. Please contact the administrator.')
  }

  const recipient = env.OTP_TEST_MODE ? env.OTP_TEST_RECIPIENT : email
  if (!recipient) throw new ApiError(503, 'Temporary OTP test recipient is not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [recipient],
      subject: 'Your IIT Connect verification code',
      text: `Your IIT Connect verification code is ${otp}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#183323"><h2>Verify your IIT Connect email</h2><p>Use this one-time password to finish creating your account:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f1f5ed;border-radius:12px;text-align:center">${otp}</div><p>This code expires in 5 minutes. Do not share it with anyone.</p><p style="color:#718075;font-size:12px">If you did not request this code, you can safely ignore this email.</p></div>`
    })
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('Resend email request failed:', response.status, detail)
    throw new ApiError(502, 'Could not send the verification email. Please try again later.')
  }
}

export const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body

  const isTemporaryTestEmail = env.OTP_TEST_MODE && env.OTP_TEST_EMAIL && email === env.OTP_TEST_EMAIL
  if (!isAllowedIitEmail(email) && !isTemporaryTestEmail) throw new ApiError(400, 'Only approved IIT student email addresses are allowed')
  if (getRoleForEmail(email) === 'admin') throw new ApiError(403, 'Administrator accounts are provisioned separately')
  if (await User.exists({ email })) throw new ApiError(409, 'Email already registered')

  const existingPending = await PendingEmailVerification.findOne({ email })
  const now = Date.now()
  if (existingPending && now - existingPending.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError(429, 'Please wait 60 seconds before requesting another OTP')
  }
  if (existingPending && existingPending.resendCount >= MAX_RESENDS) {
    throw new ApiError(429, 'OTP resend limit reached. Please try again later.')
  }

  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  const passwordHash = await bcrypt.hash(password, 12)
  const pending = await PendingEmailVerification.findOneAndUpdate(
    { email },
    {
      email,
      passwordHash,
      otpHash: hashOtp(email, otp),
      expiresAt: new Date(now + OTP_TTL_MS),
      lastSentAt: new Date(now),
      attempts: 0,
      resendCount: existingPending ? existingPending.resendCount + 1 : 0
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  try {
    await sendOtpEmail(email, otp)
  } catch (error) {
    await PendingEmailVerification.deleteOne({ _id: pending._id })
    throw error
  }

  res.status(200).json({ success: true, message: 'Verification code sent to your institute email', expiresInSeconds: 300 })
})

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const otp = String(req.body.otp || '').trim()
  if (!/^\d{6}$/.test(otp)) throw new ApiError(400, 'Enter the 6-digit verification code')

  const pending = await PendingEmailVerification.findOne({ email })
  if (!pending) throw new ApiError(400, 'No active verification request. Please request a new OTP.')
  if (pending.expiresAt.getTime() <= Date.now()) {
    await PendingEmailVerification.deleteOne({ _id: pending._id })
    throw new ApiError(400, 'OTP expired. Please request a new one.')
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    await PendingEmailVerification.deleteOne({ _id: pending._id })
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.')
  }

  const expected = Buffer.from(pending.otpHash, 'hex')
  const received = Buffer.from(hashOtp(email, otp), 'hex')
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    pending.attempts += 1
    await pending.save()
    throw new ApiError(400, 'Incorrect verification code')
  }

  if (await User.exists({ email })) {
    await PendingEmailVerification.deleteOne({ _id: pending._id })
    throw new ApiError(409, 'Email already registered')
  }

  const user = await User.create({ email, passwordHash: pending.passwordHash, role: 'student' })
  await PendingEmailVerification.deleteOne({ _id: pending._id })

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12)
  await user.save()
  await setAuthCookies(res, { accessToken, refreshToken })

  res.status(201).json({
    success: true,
    message: 'Email verified and account created',
    user: { id: user._id, email: user.email, role: user.role, profile: user.profile }
  })
})
