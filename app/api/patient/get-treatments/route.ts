import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const patient_id = searchParams.get('patient_id')

  if (!patient_id) return NextResponse.json({ error: 'patient_id required' }, { status: 400 })

  const { data: treatments, error } = await supabase
    .from('patient_treatments')
    .select('id, treatment_id, sittings_completed, sittings_total, treatments ( name )')
    .eq('patient_id', patient_id)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ treatments })
}