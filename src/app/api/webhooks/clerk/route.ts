import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const primaryEmail = evt.data.email_addresses.find(
      (e: { id: string }) => e.id === evt.data.primary_email_address_id
    )
    const email = primaryEmail?.email_address ?? evt.data.email_addresses[0]?.email_address ?? ''

    await db.user.upsert({
      where: { clerkId: evt.data.id },
      create: { clerkId: evt.data.id, email },
      update: { email, deletedAt: null },
    })
  }

  if (evt.type === 'user.deleted') {
    await db.user.update({
      where: { clerkId: evt.data.id },
      data: { deletedAt: new Date() },
    })
  }

  return new Response('OK', { status: 200 })
}
