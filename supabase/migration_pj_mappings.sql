-- ================================================================
-- Migration: Create pj_mappings table + seed data from constants
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Create the pj_mappings table
create table pj_mappings (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  lookup_key text not null,
  nama text not null,
  nomor text not null,
  platforms text[],
  updated_at timestamptz default now(),
  unique(category, lookup_key)
);

-- Enable Row Level Security
alter table pj_mappings enable row level security;

-- Policies: public read, authenticated update
create policy "Enable read access for all" on pj_mappings
  for select using (true);

create policy "Enable insert for all" on pj_mappings
  for insert with check (true);

create policy "Enable update for all" on pj_mappings
  for update using (true);

create policy "Enable delete for all" on pj_mappings
  for delete using (true);

-- Index for fast lookups
create index idx_pj_mappings_category on pj_mappings(category);
create index idx_pj_mappings_category_key on pj_mappings(category, lookup_key);

-- ================================================================
-- Seed data: PJ Desain Grafis (per kementerian)
-- ================================================================
insert into pj_mappings (category, lookup_key, nama, nomor) values
  ('desain_grafis', 'Lingkar Presiden', 'Rosyid', '6289516552616'),
  ('desain_grafis', 'Biro Kesekretariatan', 'Livia', '6289504858150'),
  ('desain_grafis', 'Biro Keuangan', 'Dhina', '6285691140342'),
  ('desain_grafis', 'Biro Pengembangan Sumber Daya Anggota', 'Kes', '62895362396200'),
  ('desain_grafis', 'Biro Pengendali & Penjamin Mutu', 'Fira', '6288706691442'),
  ('desain_grafis', 'Kementerian Pengembangan Sumber Daya Mahasiswa', 'Fira', '6288706691442'),
  ('desain_grafis', 'Kementerian Seni dan Olahraga', 'Livia', '6289504858150'),
  ('desain_grafis', 'Kementerian Prestasi dan Inovasi', 'Rahma', '6281392626815'),
  ('desain_grafis', 'Kementerian Dalam Negeri', 'Isa', '6285727631992'),
  ('desain_grafis', 'Kementerian Luar Negeri', 'Dhina', '6285691140342'),
  ('desain_grafis', 'Kementerian Pengabdian Masyarakat', 'Rissa', '6281393665862'),
  ('desain_grafis', 'Kementerian Advokasi Kesejahteraan Mahasiswa', 'Kynaa', '6289526269980'),
  ('desain_grafis', 'Kementerian Aksi dan Propaganda', 'Kes', '62895362396200'),
  ('desain_grafis', 'Kementerian Analisis Isu Strategis', 'Rahma', '6281392626815'),
  ('desain_grafis', 'Kementerian Pemberdayaan Perempuan', 'Kynaa', '6289526269980'),
  ('desain_grafis', 'Kementerian Media Kreatif dan Aplikatif', 'Rosyid', '6289516552616'),
  ('desain_grafis', 'Kementerian Media Komunikasi dan Informasi', 'Rissa', '6281393665862'),
  ('desain_grafis', 'Kementerian Riset dan Data', 'Isa', '6285727631992');

-- ================================================================
-- Seed data: PJ Website (per kementerian)
-- ================================================================
insert into pj_mappings (category, lookup_key, nama, nomor) values
  ('website', 'Lingkar Presiden', 'Aufa', '6285947647645'),
  ('website', 'Biro Kesekretariatan', 'Aufa', '6285947647645'),
  ('website', 'Biro Keuangan', 'Aufa', '6285947647645'),
  ('website', 'Biro Pengembangan Sumber Daya Anggota', 'Najmi', '62816400771'),
  ('website', 'Biro Pengendali & Penjamin Mutu', 'Najmi', '62816400771'),
  ('website', 'Kementerian Pengembangan Sumber Daya Mahasiswa', 'Albert', '6281226895057'),
  ('website', 'Kementerian Seni dan Olahraga', 'Albert', '6281226895057'),
  ('website', 'Kementerian Prestasi dan Inovasi', 'Albert', '6281226895057'),
  ('website', 'Kementerian Dalam Negeri', 'Najmi', '62816400771'),
  ('website', 'Kementerian Luar Negeri', 'Najmi', '62816400771'),
  ('website', 'Kementerian Pengabdian Masyarakat', 'Najmi', '62816400771'),
  ('website', 'Kementerian Advokasi Kesejahteraan Mahasiswa', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Aksi dan Propaganda', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Analisis Isu Strategis', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Pemberdayaan Perempuan', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Media Kreatif dan Aplikatif', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Media Komunikasi dan Informasi', 'Bintang', '6285710205061'),
  ('website', 'Kementerian Riset dan Data', 'Bintang', '6285710205061');

-- ================================================================
-- Seed data: PJ Bantuan Teknis (by group A/B)
-- ================================================================
insert into pj_mappings (category, lookup_key, nama, nomor) values
  ('bantuan_teknis', 'A', 'Feli', '6285640447440'),
  ('bantuan_teknis', 'B', 'Wulan', '6287758922681');

-- ================================================================
-- Seed data: PJ Survey (single entry)
-- ================================================================
insert into pj_mappings (category, lookup_key, nama, nomor) values
  ('survey', 'all', 'Fahmi', '6289630259393');

-- ================================================================
-- Seed data: PJ Platform Khusus (with platforms array)
-- ================================================================
insert into pj_mappings (category, lookup_key, nama, nomor, platforms) values
  ('platform_khusus', 'reels_tiktok', 'Zahran', '6285880125168', ARRAY['Instagram Reels', 'TikTok']),
  ('platform_khusus', 'spotify', 'Nashwa', '6287722540756', ARRAY['Spotify']),
  ('platform_khusus', 'youtube', 'Shava', '6285727194418', ARRAY['YouTube']);
