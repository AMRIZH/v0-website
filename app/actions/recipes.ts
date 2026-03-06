'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Recipe } from '@/lib/types'

export async function createRecipe(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const ingredients = formData.get('ingredients') as string
  const instructions = formData.get('instructions') as string
  const imageUrl = formData.get('imageUrl') as string | null
  const imageType = formData.get('imageType') as 'upload' | 'external' | null
  
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      title,
      description,
      ingredients,
      instructions,
      image_url: imageUrl || null,
      image_type: imageType || null,
    })
    .select()
    .single()
  
  if (error) {
    return { error: `Failed to create recipe: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nHint: ${error.hint || 'None'}\n\nCode: ${error.code}` }
  }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const ingredients = formData.get('ingredients') as string
  const instructions = formData.get('instructions') as string
  const imageUrl = formData.get('imageUrl') as string | null
  const imageType = formData.get('imageType') as 'upload' | 'external' | null
  
  const { data, error } = await supabase
    .from('recipes')
    .update({
      title,
      description,
      ingredients,
      instructions,
      image_url: imageUrl || null,
      image_type: imageType || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) {
    return { error: `Failed to update recipe: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nHint: ${error.hint || 'None'}\n\nCode: ${error.code}` }
  }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function deleteRecipe(recipeId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: `Authentication required: ${authError?.message || 'Not logged in'}\n\nStack: ${authError?.stack || 'No stack trace'}` }
  }
  
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
  
  if (error) {
    return { error: `Failed to delete recipe: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nHint: ${error.hint || 'None'}\n\nCode: ${error.code}` }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getRecipes(searchQuery?: string): Promise<{ data: Recipe[] | null; error: string | null }> {
  const supabase = await createClient()
  
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike('title', `%${searchQuery.trim()}%`)
  }
  
  const { data: recipes, error } = await query
  
  if (error) {
    return { data: null, error: `Failed to fetch recipes: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nCode: ${error.code}` }
  }
  
  if (!recipes || recipes.length === 0) {
    return { data: [], error: null }
  }
  
  // Fetch profiles for all unique user_ids
  const userIds = [...new Set(recipes.map(r => r.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)
  
  if (profilesError) {
    // Return recipes without profile data if profiles fetch fails
    return { data: recipes, error: null }
  }
  
  // Merge profiles with recipes
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  const recipesWithProfiles = recipes.map(recipe => ({
    ...recipe,
    profiles: profileMap.get(recipe.user_id) || null
  }))
  
  return { data: recipesWithProfiles, error: null }
}

export async function getRecipeById(recipeId: string): Promise<{ data: Recipe | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()
  
  if (error) {
    return { data: null, error: `Failed to fetch recipe: ${error.message}\n\nDetails: ${error.details || 'None'}\n\nCode: ${error.code}` }
  }
  
  // Fetch profile for the recipe author
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', recipe.user_id)
    .single()
  
  return { data: { ...recipe, profiles: profile }, error: null }
}

export async function getUserRecipes(): Promise<{ data: Recipe[] | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { data: null, error: `Authentication required: ${authError?.message || 'Not logged in'}` }
  }
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { data: null, error: `Failed to fetch user recipes: ${error.message}\n\nCode: ${error.code}` }
  }
  
  return { data, error: null }
}
