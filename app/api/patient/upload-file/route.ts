import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const patient_id = formData.get('patient_id') as string
    const category = formData.get('category') as string || 'general'

    if (!file || !patient_id) {
      return NextResponse.json({ error: 'File and patient ID are required' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP and PDF files are allowed' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${patient_id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('patient-files')
      .upload(fileName, file, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('patient-files')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('patient_files')
      .insert({
        patient_id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        category,
      })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    await logAction({
      action: 'FILE_UPLOADED',
      entity: 'patient_files',
      details: { patient_id, file_name: file.name, category }
    })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}