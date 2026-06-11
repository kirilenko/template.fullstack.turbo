import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { getDb } from './db/index.js'
import * as schema from './db/schema/index.js'
import { sendMail } from './lib/mailer.js'

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) ?? []

const appUrls = process.env.PUBLIC_APP_URL?.split(',').map((u) => u.trim()).filter(Boolean) ?? []

const cookieDomain = process.env.COOKIE_DOMAIN
const cookiePrefix = process.env.COOKIE_PREFIX
const appName = process.env.APP_NAME

export const auth = betterAuth({
  advanced: {
    ...(cookiePrefix && { cookiePrefix }),
    ...(cookieDomain && {
      crossSubDomainCookies: { domain: cookieDomain, enabled: true },
    }),
    // In dev ports can shift (Vite/Astro pick next free port), so disable
    // CSRF origin check. In production trustedOrigins enforces strict matching.
    ...(process.env.NODE_ENV !== 'production' && { disableCSRFCheck: true }),
  },
  baseURL: process.env.PUBLIC_API_URL,
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: {
      ...schema,
      account: schema.accounts,
      session: schema.sessions,
      user: schema.users,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase()
          if (email && adminEmails.includes(email)) {
            return { data: { ...user, emailVerified: true, role: 'admin' } }
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ url, user }) => {
      await sendMail({
        html: `<p>Привет, ${user.name}!</p><p>Сбросьте пароль: <a href="${url}">${url}</a></p>`,
        subject: `Сброс пароля — ${appName}`,
        to: user.email,
      })
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ url, user }) => {
      await sendMail({
        html: `<p>Привет, ${user.name}!</p><p>Подтвердите email: <a href="${url}">${url}</a></p>`,
        subject: `Подтверждение email — ${appName}`,
        to: user.email,
      })
    },
  },
  rateLimit: {
    customRules: {
      '/send-verification-email': { max: 2, window: 60 },
      '/sign-in/email': { max: 5, window: 60 },
      '/sign-up/email': { max: 3, window: 60 },
    },
    max: 100,
    window: 60,
  },
  trustedOrigins: appUrls,
  user: {
    additionalFields: {
      role: {
        input: false,
        type: 'string',
      },
    },
  },
})
