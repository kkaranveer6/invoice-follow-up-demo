import { NextRequest } from 'next/server'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db'

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' }

export async function GET(request: NextRequest): Promise<Response> {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new Response(errorHtml('Missing token.'), {
      status: 400,
      headers: HTML_HEADERS,
    })
  }

  let invoiceId: string
  try {
    invoiceId = decrypt(token)
  } catch {
    return new Response(errorHtml('Invalid or expired token.'), {
      status: 400,
      headers: HTML_HEADERS,
    })
  }

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })

  if (!invoice) {
    return new Response(successHtml('You have been unsubscribed.', ''), {
      status: 200,
      headers: HTML_HEADERS,
    })
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: { remindersEnabled: false },
  })

  return new Response(successHtml('You have been unsubscribed.', invoice.invoiceNumber), {
    status: 200,
    headers: HTML_HEADERS,
  })
}

function successHtml(heading: string, invoiceNumber: string): string {
  const detail = invoiceNumber
    ? `<p>You will no longer receive payment reminders for invoice ${invoiceNumber}.</p>`
    : '<p>You will no longer receive payment reminders.</p>'
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Unsubscribed</title></head><body><h1>${heading}</h1>${detail}</body></html>`
}

function errorHtml(message: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Error</title></head><body><h1>Something went wrong</h1><p>${message}</p></body></html>`
}
