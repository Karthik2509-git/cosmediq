import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { clerk_id, role } = await req.json()

    if (!clerk_id || !role) {
      return NextResponse.json({ error: 'clerk_id and role are required' }, { status: 400 })
    }

    // Update role in Clerk metadata
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerk_id}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: { role }
      }),
    })

    if (!clerkRes.ok) {
      const err = await clerkRes.json()
      return NextResponse.json({ error: err.message ?? 'Clerk update failed' }, { status: 500 })
    }

    // Update role in Supabase
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ role })
      .eq('clerk_id', clerk_id)

    if (supabaseError) {
      return NextResponse.json({ error: supabaseError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}