import bcrypt from 'bcrypt'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import RegistrationOtp from '../models/RegistrationOtp.js'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import User from '../models/User.js'
import { cookieOptions } from '../utils/cookie.js'
import { isAllowedIitEmail, getIitForEmail } from '../utils/allowedIitDomains.js'
import { getRoleForEmail } from '../utils/seedAdmin.js'

function publicUser(user) {
  return { id: user._id, email: user.email, role: user.role, profile: user.profile, facultyAccessStatus: user.facultyAccessStatus }
}

const REFRESH_SESSION_TTL = '60d'
const REFRESH_COOKIE_MAX_AGE = 60 * 24 * 60 * 60 * 1000

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN })
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_SESSION_TTL })
}

async function setAuthCookies(res, { accessToken, refreshToken }) {
  const opts = cookieOptions()
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: REFRESH_COOKIE_MAX_AGE })
}

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!isAllowedIitEmail(email)) throw new ApiError(400, 'Only IIT emails allowed')
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const role = getRoleForEmail(email)
  const user = await User.create({ email: email.toLowerCase(), passwordHash, role })

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10)
  await user.save()
  await setAuthCookies(res, { accessToken, refreshToken })

  res.json({ success: true, user: { id: user._id, email: user.email, role: user.role, profile: user.profile } })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!isAllowedIitEmail(email)) throw new ApiError(400, 'Only IIT emails allowed')

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) throw new ApiError(401, 'Invalid credentials')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid credentials')

  const desiredRole = getRoleForEmail(user.email)
  if (user.role !== desiredRole) user.role = desiredRole

  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10)
  user.lastSeenAt = new Date()
  await user.save()
  await setAuthCookies(res, { accessToken, refreshToken })

  res.json({ success: true, user: { id: user._id, email: user.email, role: user.role, profile: user.profile } })
})

export const logout = asyncHandler(async (req, res) => {
  const opts = cookieOptions()
  res.clearCookie('accessToken', opts)
  res.clearCookie('refreshToken', opts)
  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'Unauthorized')

  let payload
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)
  } catch {
    throw new ApiError(401, 'Unauthorized')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'Unauthorized')
  if (user.isBanned) throw new ApiError(403, 'User is banned')

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash || '')
  if (!matches) throw new ApiError(401, 'Unauthorized')

  const newAccess = signAccessToken(user._id.toString())
  const newRefresh = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(newRefresh, 10)
  await user.save()
  await setAuthCookies(res, { accessToken: newAccess, refreshToken: newRefresh })

  res.json({ success: true })
})


const otpMailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT || 587,
  secure: Boolean(env.SMTP_SECURE),
  auth: { user: env.SMTP_USER, pass: env.SMTP_APP_PASSWORD }
})

export const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const accountType = req.body.accountType === 'faculty' ? 'faculty' : 'student'
  const facultyProfile = req.body.facultyProfile || {}
  if (!email || password.length < 8) throw new ApiError(400, 'Valid institute email and password (8+ characters) are required')
  if (!isAllowedIitEmail(email)) throw new ApiError(400, 'Only approved IIT emails are allowed')
  if (isConfiguredAdmin(email)) throw new ApiError(403, 'Admin accounts are provisioned separately')
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_APP_PASSWORD) throw new ApiError(503, 'Email verification is not configured. Please contact support.')
  if (accountType === 'faculty' && ['name','institute','department','designation'].some(k => !String(facultyProfile[k] || '').trim())) {
    throw new ApiError(400, 'Please complete all required faculty details')
  }
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered')
  const prior = await RegistrationOtp.findOne({ email })
  if (prior && Date.now() - prior.lastSentAt.getTime() < 60000) throw new ApiError(429, 'Please wait 60 seconds before requesting another code')
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  const passwordHash = await bcrypt.hash(password, 12)
  const otpHash = crypto.createHash('sha256').update(otp + email).digest('hex')
  await RegistrationOtp.findOneAndUpdate({ email }, {
    email, passwordHash, accountType, facultyProfile, otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), lastSentAt: new Date(), attempts: 0
  }, { upsert: true, new: true, setDefaultsOnInsert: true })
  try {
    await otpMailer.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER, to: email,
      subject: 'Your IIT Connect verification code',
      text: `Your IIT Connect registration code is ${otp}. It expires in 5 minutes. If you did not request this, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif"><h2>IIT Connect</h2><p>Your email verification code:</p><div style="font-size:30px;font-weight:bold;letter-spacing:8px">${otp}</div><p>This code expires in 5 minutes.</p></div>`
    })
  } catch (e) {
    await RegistrationOtp.deleteOne({ email })
    console.error('Registration OTP email failed:', e.message)
    throw new ApiError(502, 'Could not send email. Check SMTP settings and try again.')
  }
  res.json({ success: true, message: 'Verification code sent' })
})

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const otp = String(req.body.otp || '').trim()
  const record = await RegistrationOtp.findOne({ email })
  if (!record) throw new ApiError(400, 'No active code. Please request a new one.')
  if (record.expiresAt.getTime() < Date.now()) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(400, 'Code expired. Please request a new one.')
  }
  if (record.attempts >= 5) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(429, 'Too many incorrect attempts. Request a new code.')
  }
  const suppliedHash = crypto.createHash('sha256').update(otp + email).digest('hex')
  if (suppliedHash !== record.otpHash) {
    record.attempts += 1
    await record.save()
    throw new ApiError(400, 'Incorrect verification code')
  }
  if (await User.findOne({ email })) {
    await RegistrationOtp.deleteOne({ email })
    throw new ApiError(409, 'Email already registered')
  }
  const faculty = record.accountType === 'faculty'
  const fp = record.facultyProfile || {}
  const user = await User.create({
    email, passwordHash: record.passwordHash,
    role: faculty ? 'faculty' : getRoleForEmail(email),
    facultyAccessStatus: faculty ? 'pending' : 'not-applicable',
    profile: faculty ? {
      name: fp.name || '', institute: fp.institute || '', department: fp.department || '',
      designation: fp.designation || '', researchInterests: fp.researchInterests || ''
    } : { iit: getIitForEmail(email) }
  })
  await RegistrationOtp.deleteOne({ email })
  const accessToken = signAccessToken(user._id.toString())
  const refreshToken = signRefreshToken(user._id.toString())
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12)
  await user.save()
  setAuthCookies(res, { accessToken, refreshToken })
  res.status(201).json({ success: true, message: 'Email verified; account created', user: publicUser(user) })
})
