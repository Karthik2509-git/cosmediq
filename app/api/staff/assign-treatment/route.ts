import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, treatment_id, start_date } = await req.json()

    if (!patient_id || !treatment_id || !start_date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Get treatment details for sittings total
    const { data: treatment, error: treatmentError } = await supabase
      .from('treatments')
      .select('total_sittings')
      .eq('id', treatment_id)
      .single()

    if (treatmentError || !treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('patient_treatments')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('treatment_id', treatment_id)
      .eq('status', 'active')
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This treatment is already active for this patient' }, { status: 400 })
    }

    const { error } = await supabase
      .from('patient_treatments')
      .insert({
        patient_id,
        treatment_id,
        start_date,
        sittings_completed: 0,
        sittings_total: treatment.total_sittings,
        status: 'active',
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}