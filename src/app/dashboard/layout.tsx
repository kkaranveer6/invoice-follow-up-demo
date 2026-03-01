import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } })
  const billingEnabled = process.env.BILLING_ENABLED !== 'false'
  const isSubscribed =
    dbUser?.subscriptionStatus === 'active' ||
    dbUser?.subscriptionStatus === 'trialing'

  if (billingEnabled && !isSubscribed) redirect('/pricing')

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
