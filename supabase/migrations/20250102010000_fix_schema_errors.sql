/*
  # Fix Schema Errors & Add Settings Columns
  # إصلاح أخطاء قاعدة البيانات وإضافة أعمدة الإعدادات
*/

-- 1. Fix 'categories' table: Add user_id column
-- إضافة عمود user_id لجدول الأصناف لحل مشكلة الإضافة
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'user_id') THEN
    ALTER TABLE public.categories ADD COLUMN user_id bigint;
  END IF;
END $$;

-- 2. Fix 'app_users' table: Add store settings columns
-- إضافة أعمدة إعدادات المتجر لجدول المستخدمين
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_users' AND column_name = 'store_name') THEN
    ALTER TABLE public.app_users ADD COLUMN store_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_users' AND column_name = 'employees_count') THEN
    ALTER TABLE public.app_users ADD COLUMN employees_count text DEFAULT '1';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_users' AND column_name = 'currency') THEN
    ALTER TABLE public.app_users ADD COLUMN currency text DEFAULT 'SDG';
  END IF;
END $$;

-- 3. Fix 'products' table: Ensure user_id exists and is compatible
-- التأكد من وجود عمود user_id في جدول المنتجات
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'user_id') THEN
    ALTER TABLE public.products ADD COLUMN user_id bigint;
  ELSE
    -- Optional: If it exists as UUID but we need BigInt, we might need to handle it. 
    -- For now, we assume it's okay or we add a separate column if needed.
    -- Leaving as is to avoid data loss on existing columns.
    NULL;
  END IF;
END $$;
