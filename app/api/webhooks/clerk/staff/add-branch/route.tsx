import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, city, address } = await req.json()

    if (!name || !city) {
      return NextResponse.json({ error: 'Branch name and city are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('branches')
      .insert({ name, city, address: address || null })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}