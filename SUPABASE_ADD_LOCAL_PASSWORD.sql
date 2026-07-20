-- ─── Run this in Supabase SQL Editor ─────────────────────────────────────────
-- Supabase Dashboard → SQL Editor → New query → paste → Run

-- Step 1: Add local_password column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS local_password TEXT;

-- Step 2: Set the current admin password (you can change it from website after this)
UPDATE public.profiles SET local_password = 'haris17482' WHERE email = 'haris@renahenna.com';

-- Step 3: Allow all operations on profiles (needed for admin to update passwords)
-- If RLS is enabled, make sure this policy exists:
CREATE POLICY IF NOT EXISTS "Allow all on profiles" ON public.profiles FOR ALL USING (true);
