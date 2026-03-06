import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided.\n\nExpected: FormData with "file" field' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}\n\nAllowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\nMax size: 5MB` },
        { status: 400 }
      )
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `recipes/${user.id}/${timestamp}-${file.name}`
    
    const blob = await put(filename, file, {
      access: 'public',
    })
    
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    const err = error as Error
    return NextResponse.json(
      { error: `Upload failed: ${err.message}\n\nStack: ${err.stack || 'No stack trace'}` },
      { status: 500 }
    )
  }
}
