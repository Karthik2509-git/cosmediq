import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { appointmentId, patientTreatmentId } = await req.json()

    if (!appointmentId || !patientTreatmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Mark appointment as completed
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 })
    }

    // Get current sittings count
    const { data: treatment, error: fetchError } = await supabase
      .from('patient_treatments')
      .select('sittings_completed, sittings_total')
      .eq('id', patientTreatmentId)
      .single()

    if (fetchError || !treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    const newSittings = treatment.sittings_completed + 1
    const isCompleted = newSittings >= treatment.sittings_total

    // Update sittings and status if all done
    const { error: treatmentError } = await supabase
      .from('patient_treatments')
      .update({
        sittings_completed: newSittings,
        status: isCompleted ? 'completed' : 'active',
      })
      .eq('id', patientTreatmentId)

    if (treatmentError) {
      return NextResponse.json({ error: treatmentError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}