import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { Header } from '@/components/header'
import { RecipeForm } from '@/components/recipe-form'

export default async function NewRecipePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <RecipeForm mode="create" />
      </main>
    </div>
  )
}
