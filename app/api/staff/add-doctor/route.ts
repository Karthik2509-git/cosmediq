import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { full_name, email, phone, specialization, qualification } = await req.json()

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 })
    }

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ full_name, email, phone, role: 'doctor' })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Create doctor record
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: user.id,
        specialization: specialization || null,
        qualification: qualification || null,
      })

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}