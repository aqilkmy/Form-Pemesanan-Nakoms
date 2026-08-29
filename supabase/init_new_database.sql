-- ==============================================================================
-- FORM PEMESANAN NAKOMS (RIZZMED) - BEM UNSOED 2026
-- FULL DATABASE SCHEMA & INITIAL SEED DATA FOR SUPABASE
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor for a brand new project.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: orders
-- Stores all form submissions across all 4 service menus
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Menu Type (discriminator)
  menu_type text NOT NULL CHECK (menu_type IN ('desain_publikasi', 'website', 'bantuan_teknis', 'survey')),
  
  -- Identitas Pemesan (shared across all menus)
  nama text NOT NULL,
  kementerian text NOT NULL,
  nomor_whatsapp text NOT NULL,
  sudah_baca_sop boolean DEFAULT false NOT NULL,
  
  -- Desain & Publikasi fields
  judul_desain text,
  platform_publikasi text[], -- Array of strings for multi-select
  tanggal_publikasi date,
  waktu_publikasi text,
  link_file_konten text,
  link_caption_docs text,
  request_lagu text,
  link_desain_selesai text,
  status_publikasi jsonb DEFAULT '{}'::jsonb, -- Checklist status per platform
  
  -- Website fields
  website_sub_type text CHECK (website_sub_type IN ('shortlink', 'laman_website', 'twibbon') OR website_sub_type IS NULL),
  tujuan_pemesanan text,
  link_original text,
  custom_shortlink text,
  link_pengajuan_fitur text,
  link_pendaftaran_event text,
  
  -- Twibbon fields (Sub-layanan Website)
  judul_kampanye text,
  nama_url_twibbon text,
  caption_twibbon text,
  format_twibbon text CHECK (format_twibbon IN ('gambar', 'video') OR format_twibbon IS NULL),
  warna_chroma_key text,
  tanggal_publikasi_twibbon date,
  link_asset_twibbon text,
  
  -- Bantuan Teknis fields  
  nama_kegiatan text,
  tanggal_kegiatan date,
  waktu_kegiatan text,
  tempat_kegiatan text,
  jenis_bantuan text CHECK (jenis_bantuan IN ('podcast', 'take_video', 'live_instagram', 'lainnya') OR jenis_bantuan IS NULL),
  jenis_bantuan_lainnya text,
  
  -- Survey fields
  judul_survey text,
  deskripsi_survey text,
  target_responden text,
  deadline_survey date,
  link_gdrive_brief text,
  hadiah_survey text CHECK (hadiah_survey IN ('ada', 'tidak') OR hadiah_survey IS NULL),
  
  -- Internal Management Status & Visibility
  status text DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'in progress', 'under review', 'ready', 'pause', 'cancel')),
  is_hidden boolean DEFAULT false NOT NULL
);

-- Row Level Security (RLS) for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all" ON orders;
CREATE POLICY "Enable read access for all" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for public" ON orders;
CREATE POLICY "Enable insert for public" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON orders;
CREATE POLICY "Enable update for all" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all" ON orders;
CREATE POLICY "Enable delete for all" ON orders FOR DELETE USING (true);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_menu_type ON orders(menu_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_kementerian ON orders(kementerian);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_publikasi ON orders(tanggal_publikasi);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_kegiatan ON orders(tanggal_kegiatan);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_publikasi_twibbon ON orders(tanggal_publikasi_twibbon);

-- ==============================================================================
-- 3. TABLE: pj_contacts
-- Master data for Penanggung Jawab (PJ) contacts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pj_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nama text NOT NULL,
  nomor text NOT NULL,
  role text, -- 'desain_grafis' | 'website' | 'twibbon' | 'bantuan_teknis' | 'survey' | 'platform_khusus' | 'publikasi'
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security (RLS) for pj_contacts
ALTER TABLE pj_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all on contacts" ON pj_contacts;
CREATE POLICY "Enable read access for all on contacts" ON pj_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all on contacts" ON pj_contacts;
CREATE POLICY "Enable insert for all on contacts" ON pj_contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all on contacts" ON pj_contacts;
CREATE POLICY "Enable update for all on contacts" ON pj_contacts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all on contacts" ON pj_contacts;
CREATE POLICY "Enable delete for all on contacts" ON pj_contacts FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_pj_contacts_nama ON pj_contacts(nama);
CREATE INDEX IF NOT EXISTS idx_pj_contacts_role ON pj_contacts(role);

-- ==============================================================================
-- 4. TABLE: pj_mappings
-- Mapping Penanggung Jawab (PJ) to categories, ministries, platforms, and days
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pj_mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,        -- 'desain_grafis' | 'website' | 'twibbon' | 'bantuan_teknis' | 'survey' | 'platform_khusus' | 'publikasi'
  lookup_key text NOT NULL,      -- Nama kementerian / Grup Kemenko / "A"/"B" / "all" / group key / Hari
  pj_id uuid REFERENCES pj_contacts(id) ON DELETE SET NULL,
  platforms text[],              -- Digunakan khusus untuk category 'platform_khusus'
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(category, lookup_key)
);

-- Row Level Security (RLS) for pj_mappings
ALTER TABLE pj_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all on mappings" ON pj_mappings;
CREATE POLICY "Enable read access for all on mappings" ON pj_mappings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all on mappings" ON pj_mappings;
CREATE POLICY "Enable insert for all on mappings" ON pj_mappings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all on mappings" ON pj_mappings;
CREATE POLICY "Enable update for all on mappings" ON pj_mappings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all on mappings" ON pj_mappings;
CREATE POLICY "Enable delete for all on mappings" ON pj_mappings FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_pj_mappings_category ON pj_mappings(category);
CREATE INDEX IF NOT EXISTS idx_pj_mappings_category_key ON pj_mappings(category, lookup_key);
CREATE INDEX IF NOT EXISTS idx_pj_mappings_pj_id ON pj_mappings(pj_id);

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- Default Contacts and Mappings for BEM Unsoed 2026
-- ==============================================================================

DO $$
DECLARE
  v_rosyid uuid;
  v_livia uuid;
  v_dhina uuid;
  v_kes uuid;
  v_fira uuid;
  v_rahma uuid;
  v_isa uuid;
  v_rissa uuid;
  v_kynaa uuid;
  v_aufa uuid;
  v_najmi uuid;
  v_albert uuid;
  v_bintang uuid;
  v_feli uuid;
  v_wulan uuid;
  v_fahmi uuid;
  v_zahran uuid;
  v_nashwa uuid;
  v_shava uuid;
BEGIN
  -- Insert PJ Contacts (if not exists)
  INSERT INTO pj_contacts (nama, nomor, role) VALUES
    ('Rosyid', '6289516552616', 'desain_grafis'),
    ('Livia', '6289504858150', 'desain_grafis'),
    ('Dhina', '6285691140342', 'desain_grafis'),
    ('Kes', '62895362396200', 'desain_grafis'),
    ('Fira', '6288706691442', 'desain_grafis'),
    ('Rahma', '6281392626815', 'desain_grafis'),
    ('Isa', '6285727631992', 'desain_grafis'),
    ('Rissa', '6281393665862', 'desain_grafis'),
    ('Kynaa', '6289526269980', 'desain_grafis'),
    ('Aufa', '6285947647645', 'website'),
    ('Najmi', '62816400771', 'website'),
    ('Albert', '6281226895057', 'website'),
    ('Bintang', '6285710205061', 'website'),
    ('Feli', '6285640447440', 'bantuan_teknis'),
    ('Wulan', '6287758922681', 'bantuan_teknis'),
    ('Fahmi', '6289630259393', 'survey'),
    ('Zahran', '6285880125168', 'platform_khusus'),
    ('Nashwa', '6287722540756', 'platform_khusus'),
    ('Shava', '6285727194418', 'platform_khusus');

  -- Get UUIDs
  SELECT id INTO v_rosyid FROM pj_contacts WHERE nama = 'Rosyid' LIMIT 1;
  SELECT id INTO v_livia FROM pj_contacts WHERE nama = 'Livia' LIMIT 1;
  SELECT id INTO v_dhina FROM pj_contacts WHERE nama = 'Dhina' LIMIT 1;
  SELECT id INTO v_kes FROM pj_contacts WHERE nama = 'Kes' LIMIT 1;
  SELECT id INTO v_fira FROM pj_contacts WHERE nama = 'Fira' LIMIT 1;
  SELECT id INTO v_rahma FROM pj_contacts WHERE nama = 'Rahma' LIMIT 1;
  SELECT id INTO v_isa FROM pj_contacts WHERE nama = 'Isa' LIMIT 1;
  SELECT id INTO v_rissa FROM pj_contacts WHERE nama = 'Rissa' LIMIT 1;
  SELECT id INTO v_kynaa FROM pj_contacts WHERE nama = 'Kynaa' LIMIT 1;
  SELECT id INTO v_aufa FROM pj_contacts WHERE nama = 'Aufa' LIMIT 1;
  SELECT id INTO v_najmi FROM pj_contacts WHERE nama = 'Najmi' LIMIT 1;
  SELECT id INTO v_albert FROM pj_contacts WHERE nama = 'Albert' LIMIT 1;
  SELECT id INTO v_bintang FROM pj_contacts WHERE nama = 'Bintang' LIMIT 1;
  SELECT id INTO v_feli FROM pj_contacts WHERE nama = 'Feli' LIMIT 1;
  SELECT id INTO v_wulan FROM pj_contacts WHERE nama = 'Wulan' LIMIT 1;
  SELECT id INTO v_fahmi FROM pj_contacts WHERE nama = 'Fahmi' LIMIT 1;
  SELECT id INTO v_zahran FROM pj_contacts WHERE nama = 'Zahran' LIMIT 1;
  SELECT id INTO v_nashwa FROM pj_contacts WHERE nama = 'Nashwa' LIMIT 1;
  SELECT id INTO v_shava FROM pj_contacts WHERE nama = 'Shava' LIMIT 1;

  -- 5.1 Seed PJ Desain Grafis (Per Kementerian)
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('desain_grafis', 'Lingkar Presiden', v_rosyid, NULL),
    ('desain_grafis', 'Biro Kesekretariatan', v_livia, NULL),
    ('desain_grafis', 'Biro Keuangan', v_dhina, NULL),
    ('desain_grafis', 'Biro Pengembangan Sumber Daya Anggota', v_kes, NULL),
    ('desain_grafis', 'Biro Pengendali & Penjamin Mutu', v_fira, NULL),
    ('desain_grafis', 'Kementerian Pengembangan Sumber Daya Mahasiswa', v_fira, NULL),
    ('desain_grafis', 'Kementerian Seni dan Olahraga', v_livia, NULL),
    ('desain_grafis', 'Kementerian Prestasi dan Inovasi', v_rahma, NULL),
    ('desain_grafis', 'Kementerian Dalam Negeri', v_isa, NULL),
    ('desain_grafis', 'Kementerian Luar Negeri', v_dhina, NULL),
    ('desain_grafis', 'Kementerian Pengabdian Masyarakat', v_rissa, NULL),
    ('desain_grafis', 'Kementerian Advokasi Kesejahteraan Mahasiswa', v_kynaa, NULL),
    ('desain_grafis', 'Kementerian Aksi dan Propaganda', v_kes, NULL),
    ('desain_grafis', 'Kementerian Analisis Isu Strategis', v_rahma, NULL),
    ('desain_grafis', 'Kementerian Pemberdayaan Perempuan', v_kynaa, NULL),
    ('desain_grafis', 'Kementerian Media Kreatif dan Aplikatif', v_rosyid, NULL),
    ('desain_grafis', 'Kementerian Media Komunikasi dan Informasi', v_rissa, NULL),
    ('desain_grafis', 'Kementerian Riset dan Data', v_isa, NULL)
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.2 Seed PJ Website (Per Kementerian)
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('website', 'Lingkar Presiden', v_aufa, NULL),
    ('website', 'Biro Kesekretariatan', v_aufa, NULL),
    ('website', 'Biro Keuangan', v_aufa, NULL),
    ('website', 'Biro Pengembangan Sumber Daya Anggota', v_najmi, NULL),
    ('website', 'Biro Pengendali & Penjamin Mutu', v_najmi, NULL),
    ('website', 'Kementerian Pengembangan Sumber Daya Mahasiswa', v_albert, NULL),
    ('website', 'Kementerian Seni dan Olahraga', v_albert, NULL),
    ('website', 'Kementerian Prestasi dan Inovasi', v_albert, NULL),
    ('website', 'Kementerian Dalam Negeri', v_najmi, NULL),
    ('website', 'Kementerian Luar Negeri', v_najmi, NULL),
    ('website', 'Kementerian Pengabdian Masyarakat', v_najmi, NULL),
    ('website', 'Kementerian Advokasi Kesejahteraan Mahasiswa', v_bintang, NULL),
    ('website', 'Kementerian Aksi dan Propaganda', v_bintang, NULL),
    ('website', 'Kementerian Analisis Isu Strategis', v_bintang, NULL),
    ('website', 'Kementerian Pemberdayaan Perempuan', v_bintang, NULL),
    ('website', 'Kementerian Media Kreatif dan Aplikatif', v_bintang, NULL),
    ('website', 'Kementerian Media Komunikasi dan Informasi', v_bintang, NULL),
    ('website', 'Kementerian Riset dan Data', v_bintang, NULL)
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.3 Seed PJ Twibbon (Per Kemenko)
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('twibbon', 'Satuan Pengawas Internal', v_najmi, NULL),
    ('twibbon', 'Sekretaris Jenderal', v_aufa, NULL),
    ('twibbon', 'Kemenko Polper', v_bintang, NULL),
    ('twibbon', 'Kemenko PM', v_albert, NULL),
    ('twibbon', 'Kemenko Respub', v_najmi, NULL),
    ('twibbon', 'Kemenko Rismed', v_bintang, NULL)
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.4 Seed PJ Bantuan Teknis (Grup A & B)
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('bantuan_teknis', 'A', v_feli, NULL),
    ('bantuan_teknis', 'B', v_wulan, NULL)
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.5 Seed PJ Survey
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('survey', 'all', v_fahmi, NULL)
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.6 Seed PJ Platform Khusus
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('platform_khusus', 'reels_tiktok', v_zahran, ARRAY['Instagram Reels', 'TikTok']),
    ('platform_khusus', 'spotify', v_nashwa, ARRAY['Spotify']),
    ('platform_khusus', 'youtube', v_shava, ARRAY['YouTube'])
  ON CONFLICT (category, lookup_key) DO UPDATE SET pj_id = EXCLUDED.pj_id, platforms = EXCLUDED.platforms;

  -- 5.7 Seed PJ Publikasi (Senin - Minggu)
  INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
    ('publikasi', 'Senin', NULL, NULL),
    ('publikasi', 'Selasa', NULL, NULL),
    ('publikasi', 'Rabu', NULL, NULL),
    ('publikasi', 'Kamis', NULL, NULL),
    ('publikasi', 'Jumat', NULL, NULL),
    ('publikasi', 'Sabtu', NULL, NULL),
    ('publikasi', 'Minggu', NULL, NULL)
  ON CONFLICT (category, lookup_key) DO NOTHING;

END $$;
