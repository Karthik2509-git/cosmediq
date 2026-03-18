import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}