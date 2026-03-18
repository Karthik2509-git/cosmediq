import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, doctor_id, branch_id, treatment_id, scheduled_at, notes } = await req.json()

    if (!patient_id || !scheduled_at) {
      return NextResponse.json({ error: 'Patient and date/time are required' }, { status: 400 })
    }

    // Find patient treatment - use selected treatment or fall back to active one
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

    // Use selected doctor or fall back to first doctor
    let finalDoctorId = doctor_id
    if (!finalDoctorId) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .single()
      finalDoctorId = doctor?.id
    }

    // Use selected branch or fall back to first branch
    let finalBranchId = branch_id
    if (!finalBranchId) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .single()
      finalBranchId = branch?.id
    }

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        doctor_id: finalDoctorId,
        branch_id: finalBranchId,
        patient_treatment_id: patientTreatmentId,
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