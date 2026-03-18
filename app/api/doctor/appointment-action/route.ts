import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { appointmentId, patientTreatmentId, action } = await req.json()

    if (!appointmentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'complete') {
      // Mark appointment as completed
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)

      // Increment sittings
      const { data: treatment } = await supabase
        .from('patient_treatments')
        .select('sittings_completed, sittings_total')
        .eq('id', patientTreatmentId)
        .single()

      if (treatment) {
        const newSittings = treatment.sittings_completed + 1
        const isCompleted = newSittings >= treatment.sittings_total
        await supabase
          .from('patient_treatments')
          .update({
            sittings_completed: newSittings,
            status: isCompleted ? 'completed' : 'active',
          })
          .eq('id', patientTreatmentId)
      }
    } else if (action === 'cancel') {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
    } else if (action === 'noshow') {
      await supabase
        .from('appointments')
        .update({ status: 'noshow' })
        .eq('id', appointmentId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}