import { Resend } from 'resend'

interface SendEmailParams {
  to: string
  subject: string
  body: string
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')

  const from = process.env.RESEND_FROM_EMAIL
  if (!from) throw new Error('RESEND_FROM_EMAIL is not set')
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: body,
  })

  if (error) throw new Error(error.message)
}
