import Stripe from 'stripe'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

export async function getStripeClient(userId: string): Promise<Stripe> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
  })

  if (!user.stripeApiKey) {
    throw new Error('No Stripe API key connected for this user')
  }

  const decryptedKey = decrypt(user.stripeApiKey)

  return new Stripe(decryptedKey, {
    typescript: true,
  })
}
