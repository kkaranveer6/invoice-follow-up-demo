export type TemplateName = 'friendly' | 'professional' | 'firm'

interface Template {
  name: TemplateName
  subject: string
  body: string
}

interface TemplateVars {
  clientName: string
  invoiceNumber: string
  amount: string
  paymentLink: string
}

const TEMPLATES: Record<TemplateName, Template> = {
  friendly: {
    name: 'friendly',
    subject: 'Friendly reminder: Invoice {{invoiceNumber}} is overdue',
    body: `Hi {{clientName}},

Just a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is now overdue.

You can pay it here: {{paymentLink}}

Please let us know if you have any questions.

Thanks!`,
  },
  professional: {
    name: 'professional',
    subject: 'Invoice {{invoiceNumber}} — Payment Required',
    body: `Dear {{clientName}},

This is a follow-up regarding invoice {{invoiceNumber}} for {{amount}}, which remains unpaid.

Please arrange payment at your earliest convenience: {{paymentLink}}

If you believe this has been sent in error, please contact us.

Regards`,
  },
  firm: {
    name: 'firm',
    subject: 'Action Required: Invoice {{invoiceNumber}} is 14+ days overdue',
    body: `Dear {{clientName}},

Invoice {{invoiceNumber}} for {{amount}} is now over 14 days overdue. This requires immediate attention.

Pay now: {{paymentLink}}

Failure to respond may result in further action.

Regards`,
  },
}

const UNSUBSCRIBE_FOOTER = `

---
To stop receiving these reminders, reply with "unsubscribe" or contact us directly.`

export function getTemplate(reminderCount: number): Template {
  if (reminderCount === 0) return TEMPLATES.friendly
  if (reminderCount === 1) return TEMPLATES.professional
  return TEMPLATES.firm
}

export function interpolateTemplate(
  template: Template,
  vars: TemplateVars,
): { subject: string; body: string } {
  const replace = (str: string) =>
    str
      .replaceAll('{{clientName}}', vars.clientName)
      .replaceAll('{{invoiceNumber}}', vars.invoiceNumber)
      .replaceAll('{{amount}}', vars.amount)
      .replaceAll('{{paymentLink}}', vars.paymentLink)

  return {
    subject: replace(template.subject),
    body: replace(template.body) + UNSUBSCRIBE_FOOTER,
  }
}
