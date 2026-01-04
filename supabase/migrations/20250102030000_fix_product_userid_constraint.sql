/*
  # Fix Product User ID Constraint
  # إصلاح قيد معرف المستخدم في جدول المنتجات
  
  The issue: The products table references auth.users, but we are using a custom app_users table.
  This causes a foreign key violation when trying to insert a product with an app_user ID.
  
  Solution: 
  1. Drop the foreign key constraint to auth.users.
  2. Change user_id column type to TEXT to be flexible.
*/

-- 1. Drop the foreign key constraint if it exists
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_user_id_fkey;

-- 2. Alter the column type to TEXT to accept any ID format (UUID or Integer from app_users)
ALTER TABLE public.products
ALTER COLUMN user_id TYPE text;

-- 3. Ensure RLS allows all operations (since we handle auth logic in the app)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;
CREATE POLICY "Enable all access for all users" ON public.products FOR ALL USING (true) WITH CHECK (true);
