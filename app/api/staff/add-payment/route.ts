import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { patient_id, appointment_id, amount, method, status } = await req.json()

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient is required' }, { status: 400 })
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
    if (Number(amount) > 1000000) {
      return NextResponse.json({ error: 'Amount seems too large, please check' }, { status: 400 })
    }
    if (!['cash', 'upi', 'card'].includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }
    if (!['paid', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const { error } = await supabase
      .from('payments')
      .insert({
        patient_id,
        appointment_id: appointment_id || null,
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