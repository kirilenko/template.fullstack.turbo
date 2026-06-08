import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { getDb } from './db/index.js'
import * as schema from './db/schema/index.js'
import { sendMail } from './lib/mailer.js'

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const appUrls = (process.env.PUBLIC_APP_URL ?? '').split(',').map((u) => u.trim()).filter(Boolean)

const cookieDomain = process.env.COOKIE_DOMAIN
const cookiePrefix = process.env.COOKIE_PREFIX ?? 'better-auth'
const appName = process.env.APP_NAME ?? 'App'

export const auth = betterAuth({
  baseURL: process.env.PUBLIC_API_URL ?? 'http://localhost:3001',
  user: {
    additionalFields: {
      role: {
        type: 'string',
        input: false,
      },
    },
  },
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Подтверждение email — ${appName}`,
        html: `<p>Привет, ${user.name}!</p><p>Подтвердите email: <a href="${url}">${url}</a></p>`,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Сброс пароля — ${appName}`,
        html: `<p>Привет, ${user.name}!</p><p>Сбросьте пароль: <a href="${url}">${url}</a></p>`,
      })
    },
  },
  advanced: {
    ...(cookiePrefix !== 'better-auth' && { cookiePrefix }),
    ...(cookieDomain && {
      crossSubDomainCookies: { enabled: true, domain: cookieDomain },
    }),
    // In dev ports can shift (Vite/Astro pick next free port), so disable
    // CSRF origin check. In production trustedOrigins enforces strict matching.
    ...(process.env.NODE_ENV !== 'production' && { disableCSRFCheck: true }),
  },
  trustedOrigins: appUrls,
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/send-verification-email': { window: 60, max: 2 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase()
          if (email && adminEmails.includes(email)) {
            return { data: { ...user, role: 'admin', emailVerified: true } }
          }
        },
      },
    },
  },
})
