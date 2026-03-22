import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, treatment_id, preferred_date, notes } = await req.json()

    if (!patient_id || !preferred_date) {
      return NextResponse.json({ error: 'Patient and preferred date are required' }, { status: 400 })
    }

    const scheduledDate = new Date(preferred_date)
    if (scheduledDate < new Date()) {
      return NextResponse.json({ error: 'Please select a future date' }, { status: 400 })
    }

    // Find patient treatment
    let patientTreatmentId = null
    if (treatment_id) {
      const { data: pt } = await supabase
        .from('patient_treatments')
        .select('id')
        .eq('patient_id', patient_id)
        .eq('treatment_id', treatment_id)
        .eq('status', 'active')
        .single()
      patientTreatmentId = pt?.id ?? null
    }

    // Get default doctor and branch
    const { data: doctor } = await supabase.from('doctors').select('id').single()
    const { data: branch } = await supabase.from('branches').select('id').single()

    const { error } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        doctor_id: doctor?.id,
        branch_id: branch?.id,
        patient_treatment_id: patientTreatmentId,
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled',
        notes: notes?.trim() || 'Patient requested appointment',
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}