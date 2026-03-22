import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, doctor_id, branch_id, treatment_id, scheduled_at, notes } = await req.json()

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient is required' }, { status: 400 })
    }
    if (!scheduled_at) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
    }

    // Prevent scheduling in the past
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate < new Date()) {
      return NextResponse.json({ error: 'Cannot schedule appointments in the past' }, { status: 400 })
    }

    // Check for duplicate appointment same patient same time
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('scheduled_at', scheduledDate.toISOString())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Patient already has an appointment at this time' }, { status: 400 })
    }

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
    } else {
      const { data: pt } = await supabase
        .from('patient_treatments')
        .select('id')
        .eq('patient_id', patient_id)
        .eq('status', 'active')
        .limit(1)
        .single()
      patientTreatmentId = pt?.id ?? null
    }

    let finalDoctorId = doctor_id
    if (!finalDoctorId) {
      const { data: doctor } = await supabase.from('doctors').select('id').single()
      finalDoctorId = doctor?.id
    }

    let finalBranchId = branch_id
    if (!finalBranchId) {
      const { data: branch } = await supabase.from('branches').select('id').single()
      finalBranchId = branch?.id
    }

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        doctor_id: finalDoctorId,
        branch_id: finalBranchId,
        patient_treatment_id: patientTreatmentId,
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled',
        notes: notes?.trim() || null,
      })

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
