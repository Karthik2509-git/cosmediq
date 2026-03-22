import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notifications: any[] = []

    // Pending payments
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('id, amount, patients ( users ( full_name ) )')
      .eq('status', 'pending')
      .limit(5)

    pendingPayments?.forEach(p => {
      notifications.push({
        id: `payment-${p.id}`,
        type: 'payment',
        title: 'Pending Payment',
        message: `${(p.patients as any)?.users?.full_name} has a pending payment of ₹${Number(p.amount).toLocaleString('en-IN')}`,
        href: '/dashboard/staff/payments',
        color: 'yellow',
      })
    })

    // Today's upcoming appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todayApts } = await supabase
      .from('appointments')
      .select('id, scheduled_at, patients ( users ( full_name ) ), patient_treatments ( treatments ( name ) )')
      .eq('status', 'scheduled')
      .gte('scheduled_at', today.toISOString())
      .lte('scheduled_at', tomorrow.toISOString())
      .limit(5)

    todayApts?.forEach(apt => {
      const time = new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      notifications.push({
        id: `apt-${apt.id}`,
        type: 'appointment',
        title: 'Today\'s Appointment',
        message: `${(apt.patients as any)?.users?.full_name} — ${(apt.patient_treatments as any)?.treatments?.name} at ${time}`,
        href: '/dashboard/doctor/appointments',
        color: 'blue',
      })
    })

    // Pending role assignments
    const clerkRes = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (clerkRes.ok) {
      const users = await clerkRes.json()
      const pendingCount = users.filter((u: any) => !u.public_metadata?.role).length
      if (pendingCount > 0) {
        notifications.push({
          id: 'pending-roles',
          type: 'role',
          title: 'Pending Role Assignments',
          message: `${pendingCount} user${pendingCount > 1 ? 's' : ''} waiting for role assignment`,
          href: '/dashboard/staff/users',
          color: 'red',
        })
      }
    }

    return NextResponse.json({ notifications })
  } catch (err) {
    return NextResponse.json({ notifications: [] })
  }
}
