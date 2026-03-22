import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    })

    if (!res.ok) return NextResponse.json({ count: 0 })

    const data = await res.json()
    const pendingCount = data.filter((u: any) => !u.public_metadata?.role).length

    return NextResponse.json({ count: pendingCount })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}