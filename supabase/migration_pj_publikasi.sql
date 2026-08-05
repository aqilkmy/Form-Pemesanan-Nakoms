-- ================================================================
-- Migration: Add PJ Publikasi (Senin - Minggu) to pj_mappings
-- Run this in your Supabase SQL Editor
-- ================================================================

insert into pj_mappings (category, lookup_key, pj_id) values
  ('publikasi', 'Senin', null),
  ('publikasi', 'Selasa', null),
  ('publikasi', 'Rabu', null),
  ('publikasi', 'Kamis', null),
  ('publikasi', 'Jumat', null),
  ('publikasi', 'Sabtu', null),
  ('publikasi', 'Minggu', null)
on conflict (category, lookup_key) do nothing;
