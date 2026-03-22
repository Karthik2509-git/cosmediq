import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { full_name, email, phone, date_of_birth, blood_group } = await req.json()

    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        role: 'patient'
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: user.id,
        date_of_birth: date_of_birth || null,
        blood_group: blood_group || null,
      })

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}