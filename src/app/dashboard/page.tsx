import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser || !dbUser.stripeConnected) {
    redirect('/dashboard/settings')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-2 text-gray-600">
        Welcome, {user.firstName ?? dbUser.email}
      </p>
    </div>
  )
}
