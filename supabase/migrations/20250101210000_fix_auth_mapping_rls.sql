/*
  # Fix Auth Mapping & RLS
  # إصلاح تعيين الحقول وسياسات الأمان

  1. Schema Updates:
     - Ensure 'app_users' table has 'username' column (used for phone number).
     - Ensure 'activation_code' and 'security_answer' columns exist.
  
  2. Security Policies (RLS):
     - Drop existing restrictive policies.
     - Add permissive policies for SELECT, INSERT, UPDATE to allow registration flow.
*/

-- 1. Ensure columns exist | التأكد من وجود الأعمدة
do $$ 
begin
  -- Add username if not exists
  if not exists (select 1 from information_schema.columns where table_name = 'app_users' and column_name = 'username') then
    alter table public.app_users add column username text;
  end if;

  -- Add activation_code if not exists
  if not exists (select 1 from information_schema.columns where table_name = 'app_users' and column_name = 'activation_code') then
    alter table public.app_users add column activation_code text;
  end if;

  -- Add security_answer if not exists
  if not exists (select 1 from information_schema.columns where table_name = 'app_users' and column_name = 'security_answer') then
    alter table public.app_users add column security_answer text;
  end if;
end $$;

-- 2. Update RLS Policies | تحديث سياسات الأمان
alter table public.app_users enable row level security;

-- Drop potential existing policies to avoid conflicts
drop policy if exists "Enable read access for all users" on public.app_users;
drop policy if exists "Enable insert access for all users" on public.app_users;
drop policy if exists "Enable update access for all users" on public.app_users;
drop policy if exists "Enable all access for all users" on public.app_users;
drop policy if exists "تمكين الوصول لجميع المستخدمين" on public.app_users;

-- Create new permissive policies
create policy "Enable read access for all users" on public.app_users for select using (true);
create policy "Enable insert access for all users" on public.app_users for insert with check (true);
create policy "Enable update access for all users" on public.app_users for update using (true);
