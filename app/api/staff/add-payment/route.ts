import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, amount, method, status } = await req.json()

    if (!patient_id || !amount) {
      return NextResponse.json({ error: 'Patient and amount are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('payments')
      .insert({
        patient_id,
        amount: Number(amount),
        method,
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}