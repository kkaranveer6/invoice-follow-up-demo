'use server'

import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/crypto'

export async function connectStripeAccount(
  apiKey: string,
): Promise<{ success?: boolean; error?: string }> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({
    where: { clerkId: user.id },
  })

  if (!apiKey.startsWith('sk_')) {
    return {
      error:
        'Invalid API key format. Must be a Stripe secret key (starts with sk_).',
    }
  }

  const testClient = new Stripe(apiKey, { typescript: true })
  try {
    await testClient.accounts.retrieve()
  } catch {
    return {
      error:
        'Invalid Stripe API key. Could not connect to your Stripe account.',
    }
  }

  const encryptedKey = encrypt(apiKey)

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      stripeApiKey: encryptedKey,
      stripeConnected: true,
    },
  })

  return { success: true }
}

export async function disconnectStripeAccount(): Promise<{
  success?: boolean
  error?: string
}> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }

  const dbUser = await db.user.findUniqueOrThrow({
    where: { clerkId: user.id },
  })

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      stripeApiKey: null,
      stripeConnected: false,
    },
  })

  return { success: true }
}
