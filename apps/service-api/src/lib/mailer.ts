import type { Transporter } from 'nodemailer'
import nodemailer from 'nodemailer'

interface MailOptions {
  to: string
  subject: string
  html: string
}

let transporter: Transporter | undefined

function getTransporter(): Transporter | undefined {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 1127)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return undefined

  transporter = nodemailer.createTransport({ host, port, secure: true, auth: { user, pass } })
  return transporter
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  const appName = process.env.APP_NAME ?? 'App'
  const from = process.env.SMTP_FROM ?? `${appName} <noreply@example.com>`
  const transport = getTransporter()

  if (!transport) {
    const urls = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    console.log(`\n[mailer] To: ${to} | ${subject}`)
    if (urls.length) urls.forEach((url) => console.log(`  → ${url}`))
    else console.log(`  Body:\n${html}`)
    console.log()
    return
  }

  await transport.sendMail({ from, to, subject, html })
}
