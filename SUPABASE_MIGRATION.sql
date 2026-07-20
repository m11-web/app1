-- Run this SQL in your Supabase SQL editor to add app_banners and push_tokens tables

-- ─── App Banners ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.app_banners ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active banners
CREATE POLICY "Anyone can view active banners"
  ON public.app_banners FOR SELECT
  USING (is_active = true);

-- Only authenticated users can insert/update/delete (admin manages via app)
CREATE POLICY "Authenticated can manage banners"
  ON public.app_banners FOR ALL
  USING (true);

-- ─── Push Tokens ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push token"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Allow reading all tokens for admin notification sending
CREATE POLICY "Authenticated can read all tokens"
  ON public.push_tokens FOR SELECT
  USING (true);

-- Sample banner (optional)
INSERT INTO public.app_banners (title, subtitle, is_active)
VALUES (
  '🌿 Welcome to Rena Henna!',
  'Explore our premium natural henna collection. New products added weekly!',
  true
);
