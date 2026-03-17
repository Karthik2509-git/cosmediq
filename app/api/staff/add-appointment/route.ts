import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, scheduled_at, notes } = await req.json()

    if (!patient_id || !scheduled_at) {
      return NextResponse.json({ error: 'Patient and date/time are required' }, { status: 400 })
    }

    // Find active treatment for patient
    const { data: treatment } = await supabase
      .from('patient_treatments')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('status', 'active')
      .limit(1)
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
        patient_id,
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