import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    // Redirect to error page with error details
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}&stack=${encodeURIComponent(error.stack || 'No stack trace')}`
    )
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('No authentication code provided')}`)
}
