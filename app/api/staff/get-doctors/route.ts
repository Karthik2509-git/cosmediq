import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('id, specialization, users ( full_name, email )')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ doctors })
}