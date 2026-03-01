'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckoutSessionAction } from '@/app/actions/billing'
import { Button } from '@/components/ui/button'

export function SubscribeButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await createCheckoutSessionAction()
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.url) {
      router.push(result.url)
    }
  }

  return (
    <div className="mt-6">
      <Button className="w-full" onClick={handleClick} disabled={loading}>
        {loading ? 'Redirecting to Stripe...' : 'Start free trial'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
