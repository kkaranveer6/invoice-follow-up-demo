import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser) redirect('/sign-in')

  const activeInvoiceCount = await db.invoice.count({
    where: { userId: dbUser.id },
  })

  const pausedInvoiceCount = await db.invoice.count({
    where: { userId: dbUser.id, remindersEnabled: false },
  })

  const allPaused = activeInvoiceCount > 0 && pausedInvoiceCount === activeInvoiceCount

  return <SettingsForm allPaused={allPaused} />
}
