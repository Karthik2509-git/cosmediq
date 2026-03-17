import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { id, name, category, description, total_sittings, price_per_sitting } = await req.json()

    if (!id || !name || !total_sittings) {
      return NextResponse.json({ error: 'ID, name and total sittings are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('treatments')
      .update({
        name,
        category,
        description: description || null,
        total_sittings: Number(total_sittings),
        price_per_sitting: price_per_sitting ? Number(price_per_sitting) : null,
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}