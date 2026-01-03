/*
  # Add Pro Subscription Fields
  # إضافة حقول اشتراك المحترفين
*/

-- Add Pro fields to app_users
alter table public.app_users add column if not exists is_pro boolean default false;
alter table public.app_users add column if not exists subscription_plan text;
alter table public.app_users add column if not exists subscription_end_date timestamp with time zone;

-- Ensure products and categories have user_id if not already present (for migration)
-- Note: user_id column usually exists from previous steps, but ensuring it allows NULL for guests
alter table public.products alter column user_id drop not null;
alter table public.categories alter column user_id drop not null; -- Assuming categories might need this too if not present

-- Policy update to ensure users can update 'null' owner rows during migration (claiming guest data)
create policy "Allow users to claim guest data" on public.products
  for update using (true) with check (true);

create policy "Allow users to claim guest categories" on public.categories
  for update using (true) with check (true);
