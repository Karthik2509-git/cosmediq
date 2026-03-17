import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { full_name, email, phone, date_of_birth, blood_group } = await req.json()

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 })
    }

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ full_name, email, phone, role: 'patient' })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Create patient record
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