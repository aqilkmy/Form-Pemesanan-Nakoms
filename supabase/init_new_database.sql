-- ==============================================================================
-- FORM PEMESANAN NAKOMS (RIZZMED) - BEM UNSOED 2026
-- EXACT PRODUCTION SCHEMA (COMPATIBLE WITH OLD DUMP & NEW FEATURES)
-- ==============================================================================
-- Run this script in Supabase SQL Editor to initialize or reset the tables.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if you want a clean reset (Optional / Caution)
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.pj_mappings CASCADE;
-- DROP TABLE IF EXISTS public.pj_contacts CASCADE;

-- ==============================================================================
-- 2. TABLE: pj_contacts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pj_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  role text,
  CONSTRAINT pj_contacts_pkey PRIMARY KEY (id)
);

ALTER TABLE public.pj_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all on contacts" ON public.pj_contacts;
CREATE POLICY "Enable read access for all on contacts" ON public.pj_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all on contacts" ON public.pj_contacts;
CREATE POLICY "Enable insert for all on contacts" ON public.pj_contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all on contacts" ON public.pj_contacts;
CREATE POLICY "Enable update for all on contacts" ON public.pj_contacts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all on contacts" ON public.pj_contacts;
CREATE POLICY "Enable delete for all on contacts" ON public.pj_contacts FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_pj_contacts_nama ON public.pj_contacts(nama);
CREATE INDEX IF NOT EXISTS idx_pj_contacts_role ON public.pj_contacts(role);

-- ==============================================================================
-- 3. TABLE: pj_mappings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pj_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  lookup_key text NOT NULL,
  pj_id uuid,
  platforms text[],
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pj_mappings_pkey PRIMARY KEY (id),
  CONSTRAINT pj_mappings_pj_id_fkey FOREIGN KEY (pj_id) REFERENCES public.pj_contacts(id) ON DELETE SET NULL,
  CONSTRAINT pj_mappings_category_lookup_key_unique UNIQUE (category, lookup_key)
);

ALTER TABLE public.pj_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all on mappings" ON public.pj_mappings;
CREATE POLICY "Enable read access for all on mappings" ON public.pj_mappings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all on mappings" ON public.pj_mappings;
CREATE POLICY "Enable insert for all on mappings" ON public.pj_mappings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all on mappings" ON public.pj_mappings;
CREATE POLICY "Enable update for all on mappings" ON public.pj_mappings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all on mappings" ON public.pj_mappings;
CREATE POLICY "Enable delete for all on mappings" ON public.pj_mappings FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_pj_mappings_category ON public.pj_mappings(category);
CREATE INDEX IF NOT EXISTS idx_pj_mappings_category_key ON public.pj_mappings(category, lookup_key);
CREATE INDEX IF NOT EXISTS idx_pj_mappings_pj_id ON public.pj_mappings(pj_id);

-- ==============================================================================
-- 4. TABLE: orders (Exact column order and data types matching orders_rows.sql)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  nama text NOT NULL,
  kementerian text NOT NULL,
  nomor_whatsapp text NOT NULL,
  sudah_baca_sop boolean DEFAULT false,
  judul_desain text,
  platform_publikasi text[],
  tanggal_publikasi date,
  waktu_publikasi text,
  link_thumbnail text,
  link_file_konten text,
  link_caption_docs text,
  request_lagu text,
  custom_shortlink text,
  fitur_tambahan_web text,
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'in progress'::text, 'under review'::text, 'ready'::text, 'pause'::text, 'cancel'::text])),
  link_desain_selesai text,
  menu_type text CHECK (menu_type = ANY (ARRAY['desain_publikasi'::text, 'website'::text, 'bantuan_teknis'::text, 'survey'::text])),
  catatan_website text,
  nama_kegiatan text,
  tanggal_kegiatan date,
  waktu_kegiatan text,
  tempat_kegiatan text,
  jenis_bantuan text,
  jenis_bantuan_lainnya text,
  judul_survey text,
  deskripsi_survey text,
  target_responden text,
  deadline_survey date,
  link_gdrive_brief text,
  hadiah_survey text,
  status_publikasi jsonb DEFAULT '{}'::jsonb,
  tujuan_pemesanan text,
  link_original text,
  link_pengajuan_fitur text,
  link_pendaftaran_event text,
  is_hidden boolean DEFAULT false,
  website_sub_type text CHECK ((website_sub_type = ANY (ARRAY['shortlink'::text, 'laman_website'::text, 'twibbon'::text])) OR website_sub_type IS NULL),
  judul_kampanye text,
  nama_url_twibbon text,
  caption_twibbon text,
  format_twibbon text CHECK ((format_twibbon = ANY (ARRAY['gambar'::text, 'video'::text])) OR format_twibbon IS NULL),
  warna_chroma_key text,
  tanggal_publikasi_twibbon date,
  link_asset_twibbon text,
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all" ON public.orders;
CREATE POLICY "Enable read access for all" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for public" ON public.orders;
CREATE POLICY "Enable insert for public" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON public.orders;
CREATE POLICY "Enable update for all" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all" ON public.orders;
CREATE POLICY "Enable delete for all" ON public.orders FOR DELETE USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_menu_type ON public.orders(menu_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_kementerian ON public.orders(kementerian);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_publikasi ON public.orders(tanggal_publikasi);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_kegiatan ON public.orders(tanggal_kegiatan);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_publikasi_twibbon ON public.orders(tanggal_publikasi_twibbon);
