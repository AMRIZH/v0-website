'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeCard } from '@/components/recipe-card'
import { deleteRecipe } from '@/app/actions/recipes'
import { toast } from 'sonner'
import type { Recipe } from '@/lib/types'

interface MyRecipesListProps {
  recipes: Recipe[]
  userId: string
}

export function MyRecipesList({ recipes: initialRecipes, userId }: MyRecipesListProps) {
  const router = useRouter()
  const [recipes, setRecipes] = useState(initialRecipes)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    
    setDeletingId(id)
    const result = await deleteRecipe(id)
    
    if (result.error) {
      toast.error('Failed to delete recipe')
      console.error(result.error)
    } else {
      setRecipes(recipes.filter(r => r.id !== id))
      toast.success('Recipe deleted')
      router.refresh()
    }
    
    setDeletingId(null)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          currentUserId={userId}
          onDelete={handleDelete}
          isDeleting={deletingId === recipe.id}
        />
      ))}
    </div>
  )
}
