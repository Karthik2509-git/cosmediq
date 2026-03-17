import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, users ( full_name, email )')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ patients })
}
