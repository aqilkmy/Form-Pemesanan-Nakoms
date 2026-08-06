-- Migration: Add Twibbon fields and website_sub_type to orders table
-- Run this migration on your Supabase database

-- Add website_sub_type to distinguish between shortlink, laman_website, and twibbon
ALTER TABLE orders ADD COLUMN IF NOT EXISTS website_sub_type text
    CHECK (website_sub_type IN ('shortlink', 'laman_website', 'twibbon') OR website_sub_type IS NULL);

-- Add Twibbon-specific fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS judul_kampanye text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nama_url_twibbon text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS caption_twibbon text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS format_twibbon text
    CHECK (format_twibbon IN ('gambar', 'video') OR format_twibbon IS NULL);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS warna_chroma_key text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tanggal_publikasi_twibbon date;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS link_asset_twibbon text;
