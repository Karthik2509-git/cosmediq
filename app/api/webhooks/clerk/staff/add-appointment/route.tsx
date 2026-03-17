import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_email, scheduled_at, notes } = await req.json()

    if (!patient_email || !scheduled_at) {
      return NextResponse.json({ error: 'Patient email and date/time are required' }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', patient_email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Patient not found with that email' }, { status: 404 })
    }

    // Find patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Find active treatment for patient
    const { data: treatment } = await supabase
      .from('patient_treatments')
      .select('id')
      .eq('patient_id', patient.id)
      .eq('status', 'active')
      .single()

    // Find default doctor
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .single()

    // Find default branch
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .single()

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        doctor_id: doctor?.id,
        branch_id: branch?.id,
        patient_treatment_id: treatment?.id || null,
        scheduled_at,
        status: 'scheduled',
        notes: notes || null,
      })

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}