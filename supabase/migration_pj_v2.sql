-- ================================================================
-- Migration: Create pj_contacts and update pj_mappings
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Drop existing table if we are running this to replace the previous one
drop table if exists pj_mappings cascade;
drop table if exists pj_contacts cascade;

-- 2. Create the master pj_contacts table
create table pj_contacts (
  id uuid default gen_random_uuid() primary key,
  nama text not null,
  nomor text not null,
  created_at timestamptz default now()
);

-- Enable RLS for pj_contacts
alter table pj_contacts enable row level security;
create policy "Enable read access for all on contacts" on pj_contacts for select using (true);
create policy "Enable insert for all on contacts" on pj_contacts for insert with check (true);
create policy "Enable update for all on contacts" on pj_contacts for update using (true);
create policy "Enable delete for all on contacts" on pj_contacts for delete using (true);

-- 3. Create the updated pj_mappings table with foreign key
create table pj_mappings (
  id uuid default gen_random_uuid() primary key,
  category text not null,        -- 'desain_grafis' | 'website' | 'bantuan_teknis' | 'survey' | 'platform_khusus'
  lookup_key text not null,      -- kementerian name, "A"/"B", "all", or platform group key
  pj_id uuid references pj_contacts(id) on delete set null,
  platforms text[],              -- only used for platform_khusus category
  updated_at timestamptz default now(),
  unique(category, lookup_key)
);

-- Enable RLS for pj_mappings
alter table pj_mappings enable row level security;
create policy "Enable read access for all on mappings" on pj_mappings for select using (true);
create policy "Enable insert for all on mappings" on pj_mappings for insert with check (true);
create policy "Enable update for all on mappings" on pj_mappings for update using (true);
create policy "Enable delete for all on mappings" on pj_mappings for delete using (true);

create index idx_pj_mappings_category on pj_mappings(category);
create index idx_pj_mappings_category_key on pj_mappings(category, lookup_key);
create index idx_pj_mappings_pj_id on pj_mappings(pj_id);

-- ================================================================
-- Seed Data
-- ================================================================

-- Insert all distinct PJs into pj_contacts and return their IDs in a CTE
with inserted_pjs as (
  insert into pj_contacts (nama, nomor) values
    ('Rosyid', '6289516552616'),
    ('Livia', '6289504858150'),
    ('Dhina', '6285691140342'),
    ('Kes', '62895362396200'),
    ('Fira', '6288706691442'),
    ('Rahma', '6281392626815'),
    ('Isa', '6285727631992'),
    ('Rissa', '6281393665862'),
    ('Kynaa', '6289526269980'),
    ('Aufa', '6285947647645'),
    ('Najmi', '62816400771'),
    ('Albert', '6281226895057'),
    ('Bintang', '6285710205061'),
    ('Feli', '6285640447440'),
    ('Wulan', '6287758922681'),
    ('Fahmi', '6289630259393'),
    ('Zahran', '6285880125168'),
    ('Nashwa', '6287722540756'),
    ('Shava', '6285727194418')
  returning id, nama
)
-- Insert Mappings using the returned IDs
insert into pj_mappings (category, lookup_key, pj_id, platforms) values
  -- DESAIN
  ('desain_grafis', 'Lingkar Presiden', (select id from inserted_pjs where nama = 'Rosyid'), null),
  ('desain_grafis', 'Biro Kesekretariatan', (select id from inserted_pjs where nama = 'Livia'), null),
  ('desain_grafis', 'Biro Keuangan', (select id from inserted_pjs where nama = 'Dhina'), null),
  ('desain_grafis', 'Biro Pengembangan Sumber Daya Anggota', (select id from inserted_pjs where nama = 'Kes'), null),
  ('desain_grafis', 'Biro Pengendali & Penjamin Mutu', (select id from inserted_pjs where nama = 'Fira'), null),
  ('desain_grafis', 'Kementerian Pengembangan Sumber Daya Mahasiswa', (select id from inserted_pjs where nama = 'Fira'), null),
  ('desain_grafis', 'Kementerian Seni dan Olahraga', (select id from inserted_pjs where nama = 'Livia'), null),
  ('desain_grafis', 'Kementerian Prestasi dan Inovasi', (select id from inserted_pjs where nama = 'Rahma'), null),
  ('desain_grafis', 'Kementerian Dalam Negeri', (select id from inserted_pjs where nama = 'Isa'), null),
  ('desain_grafis', 'Kementerian Luar Negeri', (select id from inserted_pjs where nama = 'Dhina'), null),
  ('desain_grafis', 'Kementerian Pengabdian Masyarakat', (select id from inserted_pjs where nama = 'Rissa'), null),
  ('desain_grafis', 'Kementerian Advokasi dan Kesejahteraan Mahasiswa', (select id from inserted_pjs where nama = 'Kynaa'), null),
  ('desain_grafis', 'Kementerian Aksi dan Propaganda', (select id from inserted_pjs where nama = 'Kes'), null),
  ('desain_grafis', 'Kementerian Analisis Isu Strategis', (select id from inserted_pjs where nama = 'Rahma'), null),
  ('desain_grafis', 'Kementerian Pemberdayaan Perempuan', (select id from inserted_pjs where nama = 'Kynaa'), null),
  ('desain_grafis', 'Kementerian Media Kreatif dan Aplikatif', (select id from inserted_pjs where nama = 'Rosyid'), null),
  ('desain_grafis', 'Kementerian Media Komunikasi dan Informasi', (select id from inserted_pjs where nama = 'Rissa'), null),
  ('desain_grafis', 'Kementerian Riset dan Data', (select id from inserted_pjs where nama = 'Isa'), null),

  -- WEBSITE
  ('website', 'Lingkar Presiden', (select id from inserted_pjs where nama = 'Aufa'), null),
  ('website', 'Biro Kesekretariatan', (select id from inserted_pjs where nama = 'Aufa'), null),
  ('website', 'Biro Keuangan', (select id from inserted_pjs where nama = 'Aufa'), null),
  ('website', 'Biro Pengembangan Sumber Daya Anggota', (select id from inserted_pjs where nama = 'Najmi'), null),
  ('website', 'Biro Pengendali & Penjamin Mutu', (select id from inserted_pjs where nama = 'Najmi'), null),
  ('website', 'Kementerian Pengembangan Sumber Daya Mahasiswa', (select id from inserted_pjs where nama = 'Albert'), null),
  ('website', 'Kementerian Seni dan Olahraga', (select id from inserted_pjs where nama = 'Albert'), null),
  ('website', 'Kementerian Prestasi dan Inovasi', (select id from inserted_pjs where nama = 'Albert'), null),
  ('website', 'Kementerian Dalam Negeri', (select id from inserted_pjs where nama = 'Najmi'), null),
  ('website', 'Kementerian Luar Negeri', (select id from inserted_pjs where nama = 'Najmi'), null),
  ('website', 'Kementerian Pengabdian Masyarakat', (select id from inserted_pjs where nama = 'Najmi'), null),
  ('website', 'Kementerian Advokasi dan Kesejahteraan Mahasiswa', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Aksi dan Propaganda', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Analisis Isu Strategis', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Pemberdayaan Perempuan', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Media Kreatif dan Aplikatif', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Media Komunikasi dan Informasi', (select id from inserted_pjs where nama = 'Bintang'), null),
  ('website', 'Kementerian Riset dan Data', (select id from inserted_pjs where nama = 'Bintang'), null),

  -- BANTUAN TEKNIS
  ('bantuan_teknis', 'A', (select id from inserted_pjs where nama = 'Feli'), null),
  ('bantuan_teknis', 'B', (select id from inserted_pjs where nama = 'Wulan'), null),

  -- SURVEY
  ('survey', 'all', (select id from inserted_pjs where nama = 'Fahmi'), null),

  -- PLATFORM KHUSUS
  ('platform_khusus', 'reels_tiktok', (select id from inserted_pjs where nama = 'Zahran'), ARRAY['Instagram Reels', 'TikTok']),
  ('platform_khusus', 'spotify', (select id from inserted_pjs where nama = 'Nashwa'), ARRAY['Spotify']),
  ('platform_khusus', 'youtube', (select id from inserted_pjs where nama = 'Shava'), ARRAY['YouTube']);
