import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { appointmentId, patientTreatmentId, action } = await req.json()

    if (!appointmentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'complete') {
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)

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

      await logAction({
        action: 'APPOINTMENT_COMPLETED',
        entity: 'appointments',
        entity_id: appointmentId,
        details: { patientTreatmentId }
      })
    } else if (action === 'cancel') {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      await logAction({
        action: 'APPOINTMENT_CANCELLED',
        entity: 'appointments',
        entity_id: appointmentId,
      })
    } else if (action === 'noshow') {
      await supabase
        .from('appointments')
        .update({ status: 'noshow' })
        .eq('id', appointmentId)

      await logAction({
        action: 'APPOINTMENT_NOSHOW',
        entity: 'appointments',
        entity_id: appointmentId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}