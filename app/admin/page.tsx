import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { checkAdminAccess, getAllUsers, getAllRecipesAdmin } from '@/app/actions/admin'
import { Header } from '@/components/header'
import { AdminUsersTable } from './admin-users-table'
import { AdminRecipesTable } from './admin-recipes-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, ChefHat } from 'lucide-react'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { isAdmin, error: adminError } = await checkAdminAccess()

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive font-medium">Access Denied</p>
              <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">
                {adminError || 'You do not have admin privileges to access this page.'}
              </pre>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const [usersResult, recipesResult] = await Promise.all([
    getAllUsers(),
    getAllRecipesAdmin()
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage users and recipes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{usersResult.data?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{recipesResult.data?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {usersResult.data?.filter(u => u.role === 'admin').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="recipes" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersResult.error ? (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive font-medium">Error Loading Users</p>
                    <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{usersResult.error}</pre>
                  </div>
                ) : (
                  <AdminUsersTable users={usersResult.data || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes">
            <Card>
              <CardHeader>
                <CardTitle>All Recipes</CardTitle>
                <CardDescription>View and delete any recipe</CardDescription>
              </CardHeader>
              <CardContent>
                {recipesResult.error ? (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive font-medium">Error Loading Recipes</p>
                    <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap break-words">{recipesResult.error}</pre>
                  </div>
                ) : (
                  <AdminRecipesTable recipes={recipesResult.data || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
