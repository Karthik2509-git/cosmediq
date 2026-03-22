import { supabase } from './supabase'

export async function logAction({
  action,
  entity,
  entity_id,
  performed_by,
  details,
}: {
  action: string
  entity: string
  entity_id?: string
  performed_by?: string
  details?: Record<string, any>
}) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      entity,
      entity_id: entity_id ?? null,
      performed_by: performed_by ?? 'system',
      details: details ?? null,
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}