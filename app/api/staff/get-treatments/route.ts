import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: treatments, error } = await supabase
    .from('treatments')
    .select('id, name, price_per_sitting, total_sittings')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ treatments })
}