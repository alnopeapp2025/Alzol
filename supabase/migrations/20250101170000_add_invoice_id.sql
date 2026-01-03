/*
  # Add Invoice ID to Sales
  - Adds invoice_id column to group sales items
*/

alter table public.sales 
add column if not exists invoice_id text;

-- Index for faster grouping
create index if not exists sales_invoice_id_idx on public.sales(invoice_id);
