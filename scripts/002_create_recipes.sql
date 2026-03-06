-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  image_url TEXT,
  image_type TEXT CHECK (image_type IN ('upload', 'external', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all recipes (public recipes)
CREATE POLICY "recipes_select_all" ON public.recipes 
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own recipes
CREATE POLICY "recipes_insert_own" ON public.recipes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
CREATE POLICY "recipes_update_own" ON public.recipes 
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own recipes OR admins can delete any recipe
CREATE POLICY "recipes_delete_own_or_admin" ON public.recipes 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for search functionality
CREATE INDEX IF NOT EXISTS recipes_title_search_idx ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON public.recipes(created_at DESC);
