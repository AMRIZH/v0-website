import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@/app/actions/auth'
import { getRecipeById } from '@/app/actions/recipes'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Edit, ArrowLeft, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { DeleteRecipeButton } from './delete-button'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const [user, { data: recipe, error }] = await Promise.all([
    getCurrentUser(),
    getRecipeById(id)
  ])

  if (error || !recipe) {
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
    notFound()
  }

  const isOwner = user?.id === recipe.user_id
  const authorName = recipe.profiles?.display_name || recipe.profiles?.email?.split('@')[0] || 'Unknown'

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>

          <Card>
            {recipe.image_url && (
              <div className="relative aspect-video">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover rounded-t-lg"
                  unoptimized={recipe.image_type === 'external'}
                  priority
                />
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-4 text-balance">{recipe.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{authorName[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(recipe.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    {recipe.updated_at !== recipe.created_at && (
                      <Badge variant="secondary" className="text-xs">
                        Updated {formatDistanceToNow(new Date(recipe.updated_at), { addSuffix: true })}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <div className="flex gap-2">
                    <Link href={`/recipes/${recipe.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteRecipeButton recipeId={recipe.id} />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <div 
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: recipe.description }}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{recipe.ingredients}</pre>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Instructions</h2>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{recipe.instructions}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
