export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string
  ingredients: string
  instructions: string
  image_url: string | null
  image_type: 'upload' | 'external' | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    display_name?: string
    role?: string
  }
}
