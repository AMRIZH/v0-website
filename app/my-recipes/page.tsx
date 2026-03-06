import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserRecipes } from '@/app/actions/recipes'
import { Header } from '@/components/header'
import { RecipeCard } from '@/components/recipe-card'
import { Button } from '@/components/ui/button'
import { Plus, ChefHat } from 'lucide-react'
import { MyRecipesList } from './my-recipes-list'

export default async function MyRecipesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: recipes, error } = await getUserRecipes()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Recipes</h1>
            <p className="text-muted-foreground mt-1">
              Manage your recipe collection
            </p>
          </div>
          <Link href="/recipes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md mb-8">
            <p className="text-sm text-destructive font-medium">Error</p>
            <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{error}</pre>
          </div>
        )}

        {recipes && recipes.length > 0 ? (
          <MyRecipesList recipes={recipes} userId={user.id} />
        ) : (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No recipes yet</h2>
            <p className="text-muted-foreground mb-6">
              Start sharing your culinary creations with the world!
            </p>
            <Link href="/recipes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Recipe
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
