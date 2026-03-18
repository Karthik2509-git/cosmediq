import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not set', { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data
    const email = email_addresses[0]?.email_address
    const full_name = [first_name, last_name].filter(Boolean).join(' ') || email
    const role = (public_metadata as any)?.role ?? 'patient'

    // Check if user already exists (invited via staff)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Update clerk_id for existing user
      await supabase
        .from('users')
        .update({ clerk_id: id })
        .eq('email', email)
    } else {
      // Create new user record
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          clerk_id: id,
          email,
          full_name,
          role,
        })
        .select()
        .single()

      if (userError) {
        console.error('Supabase user insert error:', userError)
        return new Response('Database error', { status: 500 })
      }

      // If patient, create patient record too
      if (role === 'patient' && newUser) {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({ user_id: newUser.id })

        if (patientError) {
          console.error('Supabase patient insert error:', patientError)
        }
      }

      // If doctor, create doctor record too
      if (role === 'doctor' && newUser) {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({ user_id: newUser.id })

        if (doctorError) {
          console.error('Supabase doctor insert error:', doctorError)
        }
      }
    }
  }

  return new Response('Webhook received', { status: 200 })
}