import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const data = await res.json()

    // Filter users with no role or pending role
    const users = data.map((u: any) => ({
      clerk_id: u.id,
      email: u.email_addresses?.[0]?.email_address ?? '',
      full_name: [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown',
      role: u.public_metadata?.role ?? null,
      created_at: u.created_at,
      image_url: u.image_url,
    }))

    return NextResponse.json({ users })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}