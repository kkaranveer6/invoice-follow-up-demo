import { NextRequest, NextResponse } from 'next/server'
import { processReminders } from '@/lib/reminders'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authHeader = request.headers.get('Authorization')

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processReminders()
    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
