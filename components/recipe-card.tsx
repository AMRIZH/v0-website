'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, User, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe
  currentUserId?: string
  onDelete?: (id: string) => void
  isDeleting?: boolean
}

export function RecipeCard({ recipe, currentUserId, onDelete, isDeleting }: RecipeCardProps) {
  const isOwner = currentUserId === recipe.user_id
  const authorName = recipe.profiles?.display_name || recipe.profiles?.email?.split('@')[0] || 'Unknown'
  
  // Strip HTML tags for preview
  const descriptionPreview = recipe.description
    .replace(/<[^>]*>/g, '')
    .slice(0, 120) + (recipe.description.length > 120 ? '...' : '')

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe.id}`} className="block">
        <div className="relative aspect-video bg-muted">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
              unoptimized={recipe.image_type === 'external'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-2">
        <Link href={`/recipes/${recipe.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-2 text-balance">{recipe.title}</h3>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {descriptionPreview}
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{authorName[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{authorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(recipe.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2 w-full">
            <Link href={`/recipes/${recipe.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(recipe.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
