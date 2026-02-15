import { currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-2 text-gray-600">
        Welcome, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
      </p>
    </div>
  )
}
