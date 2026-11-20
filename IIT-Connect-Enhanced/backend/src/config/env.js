import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase(),
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 40)
}

export function assertEnv() {
  const required = [
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ]
  const missing = required.filter((k) => !env[k])

  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }

  if (env.JWT_ACCESS_SECRET.length < 32 || env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each contain at least 32 characters')
  }

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error('JWT access and refresh secrets must be different')
  }

  if (env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
    throw new Error('CLIENT_ORIGIN must be explicitly configured in production')
  }

  if (env.DEFAULT_ADMIN_EMAIL && !env.DEFAULT_ADMIN_PASSWORD) {
    throw new Error('DEFAULT_ADMIN_PASSWORD is required when DEFAULT_ADMIN_EMAIL is configured')
  }

  if (env.DEFAULT_ADMIN_PASSWORD && !env.DEFAULT_ADMIN_EMAIL) {
    throw new Error('DEFAULT_ADMIN_EMAIL is required when DEFAULT_ADMIN_PASSWORD is configured')
  }
}
