-- ================================================================
-- Migration: Add PJ Twibbon category mappings (per Kemenko)
-- Run this in your Supabase SQL Editor if needed
-- ================================================================

-- Insert Twibbon category mappings per Kemenko/Koordinator (if not already existing)
insert into pj_mappings (category, lookup_key, pj_id, platforms) values
  ('twibbon', 'Satuan Pengawas Internal', null, null),
  ('twibbon', 'Sekretaris Jenderal', null, null),
  ('twibbon', 'Kemenko Polper', null, null),
  ('twibbon', 'Kemenko PM', null, null),
  ('twibbon', 'Kemenko Respub', null, null),
  ('twibbon', 'Kemenko Rismed', null, null)
on conflict (category, lookup_key) do nothing;
