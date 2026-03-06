'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import { ImageUpload } from '@/components/image-upload'
import { createRecipe, updateRecipe } from '@/app/actions/recipes'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Recipe } from '@/lib/types'

interface RecipeFormProps {
  recipe?: Recipe
  mode: 'create' | 'edit'
}

export function RecipeForm({ recipe, mode }: RecipeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(recipe?.title || '')
  const [description, setDescription] = useState(recipe?.description || '')
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '')
  const [instructions, setInstructions] = useState(recipe?.instructions || '')
  const [imageUrl, setImageUrl] = useState<string | null>(recipe?.image_url || null)
  const [imageType, setImageType] = useState<'upload' | 'external' | null>(recipe?.image_type || null)

  const handleImageChange = (url: string | null, type: 'upload' | 'external' | null) => {
    setImageUrl(url)
    setImageType(type)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('ingredients', ingredients)
    formData.append('instructions', instructions)
    if (imageUrl) formData.append('imageUrl', imageUrl)
    if (imageType) formData.append('imageType', imageType)

    try {
      const result = mode === 'create'
        ? await createRecipe(formData)
        : await updateRecipe(recipe!.id, formData)

      if (result.error) {
        setError(result.error)
        toast.error('Failed to save recipe')
      } else {
        toast.success(mode === 'create' ? 'Recipe created!' : 'Recipe updated!')
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      const error = err as Error
      setError(`Unexpected error: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Delicious Chocolate Cake"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe your recipe..."
            />
            <p className="text-xs text-muted-foreground">
              Use the toolbar for bold, italic, links, and lists
            </p>
          </div>

          <ImageUpload
            value={imageUrl}
            imageType={imageType}
            onChange={handleImageChange}
          />

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="List your ingredients, one per line:&#10;- 2 cups flour&#10;- 1 cup sugar&#10;- 3 eggs"
              rows={6}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions:&#10;1. Preheat oven to 350°F&#10;2. Mix dry ingredients&#10;3. Add wet ingredients"
              rows={8}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive font-medium">Error</p>
              <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{error}</pre>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Create Recipe' : 'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
