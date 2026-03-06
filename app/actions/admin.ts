'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile, Recipe } from '@/lib/types'

export async function getAllUsers(): Promise<{ data: Profile[] | null; error: string | null }> {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { data: null, error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  // Get current user's profile to check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { data: null, error: 'Unauthorized: Admin access required.\n\nYour role: ' + (profile?.role || 'unknown') }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return { data: null, error: `Failed to fetch users: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nCode: ${error.code}` }
  }
  
  return { data, error: null }
}

export async function getAllRecipesAdmin(): Promise<{ data: Recipe[] | null; error: string | null }> {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { data: null, error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  // Get current user's profile to check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { data: null, error: 'Unauthorized: Admin access required.\n\nYour role: ' + (profile?.role || 'unknown') }
  }
  
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        display_name,
        role
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { data: null, error: `Failed to fetch recipes: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nCode: ${error.code}` }
  }
  
  return { data, error: null }
}

export async function adminDeleteRecipe(recipeId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  // Get current user's profile to check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required.\n\nYour role: ' + (profile?.role || 'unknown') }
  }
  
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
  
  if (error) {
    return { error: `Failed to delete recipe: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nHint: ${error.hint || 'None'}\n\nCode: ${error.code}` }
  }
  
  revalidatePath('/admin', 'layout')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function checkAdminAccess(): Promise<{ isAdmin: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { isAdmin: false, error: `Authentication required: ${authError?.message || 'Not logged in'}` }
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    return { isAdmin: false, error: `Failed to check admin status: ${profileError.message}` }
  }
  
  return { isAdmin: profile?.role === 'admin' }
}
