import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, full_name, role, specialization, qualification, phone } = await req.json()

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Send invite via Clerk
    const clerkRes = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        public_metadata: { role },
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cosmediq.vercel.app'}/dashboard`,
      }),
    })

    if (!clerkRes.ok) {
      const err = await clerkRes.json()
      return NextResponse.json({ error: err.errors?.[0]?.message ?? 'Invite failed' }, { status: 500 })
    }

    // Create user record in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ full_name, email, phone: phone || null, role })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Create doctor or staff record
    if (role === 'doctor') {
      await supabase.from('doctors').insert({
        user_id: user.id,
        specialization: specialization || null,
        qualification: qualification || null,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}