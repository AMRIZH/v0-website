import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getRecipeById } from '@/app/actions/recipes'
import { Header } from '@/components/header'
import { RecipeForm } from '@/components/recipe-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: recipe, error } = await getRecipeById(id)

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive font-medium">Error Loading Recipe</p>
              <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{error}</pre>
            </div>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!recipe) {
    notFound()
  }

  // Check if user owns this recipe
  if (recipe.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive font-medium">Unauthorized</p>
              <p className="mt-2 text-sm text-destructive">You do not have permission to edit this recipe.</p>
            </div>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <RecipeForm recipe={recipe} mode="edit" />
      </main>
    </div>
  )
}
