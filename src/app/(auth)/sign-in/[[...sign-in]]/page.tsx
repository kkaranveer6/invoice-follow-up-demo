import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="flex flex-col items-center">
        <Link href="/" className="mb-8 font-heading text-xl font-bold text-indigo-600">
          Invoice Follow-Up
        </Link>
        <SignIn />
      </div>
    </div>
  )
}
