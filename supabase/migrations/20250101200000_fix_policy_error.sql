/*
  # Fix Policy Duplication Error (42710)
  # إصلاح خطأ تكرار اسم السياسة
  
  1. Check if policy exists and drop it safely.
  2. Re-create the policy.
*/

-- Fix for app_users table | إصلاح جدول المستخدمين
do $$ 
begin
    -- Check if table exists first
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'app_users') then
        -- Drop the specific Arabic policy name if it exists
        drop policy if exists "تمكين الوصول لجميع المستخدمين" on public.app_users;
        
        -- Also drop the English one if it exists just in case
        drop policy if exists "Enable all access for all users" on public.app_users;
        
        -- Re-create the policy
        create policy "تمكين الوصول لجميع المستخدمين" on public.app_users 
            for all using (true) with check (true);
    end if;
end $$;
