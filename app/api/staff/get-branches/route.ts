import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: branches, error } = await supabase
    .from('branches')
    .select('id, name, city')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ branches })
}