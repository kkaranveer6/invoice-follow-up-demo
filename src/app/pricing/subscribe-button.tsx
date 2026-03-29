'use client'

import { Button } from '@/components/ui/button'

export function SubscribeButton() {
  return (
    <div className="mt-6">
      <Button className="w-full" onClick={() => alert('This is a demo — sign up at the real app to start your free trial!')}>
        Start free trial
      </Button>
    </div>
  )
}
