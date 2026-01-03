/*
  # Fix Categories & Add User Settings
  1. Add user_id to categories to fix the insert error.
  2. Add store settings columns to app_users.
*/

-- Fix Categories Table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update App Users Table for Store Settings
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SDG';

-- Refresh Cache (Supabase sometimes needs this for schema changes to reflect immediately in client)
NOTIFY pgrst, 'reload schema';
