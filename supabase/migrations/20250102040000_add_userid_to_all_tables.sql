/*
  # Full Privacy & Financial Integration
  # خصوصية تامة وربط مالي
  
  1. Add user_id to all tables to ensure data isolation.
  2. Update policies if necessary (handled by application logic for now).
*/

-- Add user_id to Sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS user_id bigint;

-- Add user_id to Expenses
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS user_id bigint;

-- Add user_id to Treasury Balances (Crucial for private banking)
ALTER TABLE public.treasury_balances 
ADD COLUMN IF NOT EXISTS user_id bigint;

-- Add user_id to Workers
ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS user_id bigint;

-- Add user_id to Categories (if not exists)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS user_id bigint;

-- Ensure Products has it (already done, but safe to repeat)
ALTER TABLE public.products 
ALTER COLUMN user_id TYPE text; -- Ensure it accepts text/bigint mix if needed
