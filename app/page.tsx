import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getRecipes } from '@/app/actions/recipes'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { RecipeCard } from '@/components/recipe-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChefHat, Plus, Search } from 'lucide-react'

interface HomePageProps {
  searchParams: Promise<{ q?: string }>
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function RecipeGrid({ searchQuery }: { searchQuery?: string }) {
  const [user, { data: recipes, error }] = await Promise.all([
    getCurrentUser(),
    getRecipes(searchQuery)
  ])

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
        <p className="text-sm text-destructive font-medium">Error Loading Recipes</p>
        <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{error}</pre>
      </div>
    )
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-16">
        {searchQuery ? (
          <>
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No recipes found</h2>
            <p className="text-muted-foreground mb-6">
              No recipes match "{searchQuery}". Try a different search term.
            </p>
            <Link href="/">
              <Button variant="outline">Clear Search</Button>
            </Link>
          </>
        ) : (
          <>
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No recipes yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to share a delicious recipe!
            </p>
            {user ? (
              <Link href="/recipes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button>Sign Up to Share Recipes</Button>
              </Link>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          currentUserId={user?.id}
        />
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: searchQuery } = await searchParams
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Discover & Share Amazing Recipes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community of food lovers. Find inspiration, share your culinary creations, and explore dishes from around the world.
          </p>
          
          {/* Search Bar */}
          <div className="mb-8">
            <Suspense fallback={<Skeleton className="h-10 max-w-xl mx-auto" />}>
              <SearchBar />
            </Suspense>
          </div>
        </section>

        {/* Results Info */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        <Suspense fallback={<RecipeGridSkeleton />}>
          <RecipeGrid searchQuery={searchQuery} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <ChefHat className="h-4 w-4" />
            ReciteRecipe - Share your favorite recipes with the world
          </p>
        </div>
      </footer>
    </div>
  )
}
