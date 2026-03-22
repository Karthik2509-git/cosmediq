import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (!type) return NextResponse.json({ error: 'Type is required' }, { status: 400 })

  try {
    let records: any[] = []

    if (type === 'patients') {
      const { data } = await supabase
        .from('patients')
        .select('id, date_of_birth, blood_group, users ( full_name, email, phone ), created_at')
      records = data?.map(p => ({
        ID: p.id,
        Name: (p.users as any)?.full_name ?? '',
        Email: (p.users as any)?.email ?? '',
        Phone: (p.users as any)?.phone ?? '',
        'Date of Birth': p.date_of_birth ?? '',
        'Blood Group': p.blood_group ?? '',
        'Created At': new Date(p.created_at).toLocaleDateString('en-IN'),
      })) ?? []
    }

    else if (type === 'appointments') {
      const { data } = await supabase
        .from('appointments')
        .select(`
          id, scheduled_at, status, notes,
          patients ( users ( full_name ) ),
          doctors ( users ( full_name ) ),
          branches ( name ),
          patient_treatments ( treatments ( name ) )
        `)
      records = data?.map(a => ({
        ID: a.id,
        Patient: (a.patients as any)?.users?.full_name ?? '',
        Doctor: (a.doctors as any)?.users?.full_name ?? '',
        Treatment: (a.patient_treatments as any)?.treatments?.name ?? '',
        Branch: (a.branches as any)?.name ?? '',
        'Scheduled At': new Date(a.scheduled_at).toLocaleString('en-IN'),
        Status: a.status,
        Notes: a.notes ?? '',
      })) ?? []
    }

    else if (type === 'payments') {
      const { data } = await supabase
        .from('payments')
        .select('id, amount, status, method, created_at, patients ( users ( full_name ) )')
      records = data?.map(p => ({
        ID: p.id,
        Patient: (p.patients as any)?.users?.full_name ?? '',
        Amount: `₹${Number(p.amount).toLocaleString('en-IN')}`,
        Method: p.method ?? '',
        Status: p.status,
        Date: new Date(p.created_at).toLocaleDateString('en-IN'),
      })) ?? []
    }

    else if (type === 'audit_logs') {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
      records = data?.map(l => ({
        Action: l.action,
        Entity: l.entity,
        'Entity ID': l.entity_id ?? '',
        Details: JSON.stringify(l.details ?? {}),
        Time: new Date(l.created_at).toLocaleString('en-IN'),
      })) ?? []
    }

    return NextResponse.json({ records })
  } catch (err) {
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}