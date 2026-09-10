-- ================================================================
-- Migration: Add PJ Internship (Desain, Website, Publikasi)
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Insert intern contacts into pj_contacts
-- Note: role = 'intern' to distinguish from regular staff

INSERT INTO pj_contacts (nama, nomor, role) VALUES
  ('Maura', '62895396055600', 'intern'),
  ('Racha', '6281226767725', 'intern'),
  ('Ayisha', '628110220020', 'intern'),
  ('Naila Rona', '6282298233138', 'intern'),
  ('Dimas', '6289529284887', 'intern'),
  ('Calista', '6281388800395', 'intern');

-- 2. PJ Desain Intern (per proker)
-- category = 'intern_desain'
-- lookup_key = nama proker
-- platforms = array of kementerian yang terkait

INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
  -- Maura: Nulispedia (Medkraf) & Media Partner (Lugri)
  ('intern_desain', 'Nulispedia',
    (SELECT id FROM pj_contacts WHERE nama = 'Maura' AND role = 'intern'),
    ARRAY['Kementerian Media Kreatif dan Aplikatif']),
  ('intern_desain', 'Media Partner',
    (SELECT id FROM pj_contacts WHERE nama = 'Maura' AND role = 'intern'),
    ARRAY['Kementerian Luar Negeri']),

  -- Racha: Malaka (Medkraf) & Seniora Mengapresiasi (Seniora)
  ('intern_desain', 'Malaka',
    (SELECT id FROM pj_contacts WHERE nama = 'Racha' AND role = 'intern'),
    ARRAY['Kementerian Media Kreatif dan Aplikatif']),
  ('intern_desain', 'Seniora Mengapresiasi',
    (SELECT id FROM pj_contacts WHERE nama = 'Racha' AND role = 'intern'),
    ARRAY['Kementerian Seni dan Olahraga']);

-- 3. PJ Website Intern (per proker)
-- category = 'intern_website'

INSERT INTO pj_mappings (category, lookup_key, pj_id, platforms) VALUES
  -- Ayisha: PSDM (S.O.L.O), Seniora (PORSOED), Akspro (Sekolah Politik Pergerakan)
  ('intern_website', 'S.O.L.O',
    (SELECT id FROM pj_contacts WHERE nama = 'Ayisha' AND role = 'intern'),
    ARRAY['Kementerian Pengembangan Sumber Daya Mahasiswa']),
  ('intern_website', 'PORSOED',
    (SELECT id FROM pj_contacts WHERE nama = 'Ayisha' AND role = 'intern'),
    ARRAY['Kementerian Seni dan Olahraga']),
  ('intern_website', 'Sekolah Politik Pergerakan',
    (SELECT id FROM pj_contacts WHERE nama = 'Ayisha' AND role = 'intern'),
    ARRAY['Kementerian Aksi dan Propaganda']),

  -- Naila Rona: Pengmas (Desa Cita & PRS), PSDA (Internship BEM), Pempu (ALERTA: PEKA)
  ('intern_website', 'Desa Cita & Pesta Rakyat Soedirman',
    (SELECT id FROM pj_contacts WHERE nama = 'Naila Rona' AND role = 'intern'),
    ARRAY['Kementerian Pengabdian Masyarakat']),
  ('intern_website', 'Internship BEM Unsoed',
    (SELECT id FROM pj_contacts WHERE nama = 'Naila Rona' AND role = 'intern'),
    ARRAY['Biro Pengembangan Sumber Daya Anggota']),
  ('intern_website', 'ALERTA: PEKA',
    (SELECT id FROM pj_contacts WHERE nama = 'Naila Rona' AND role = 'intern'),
    ARRAY['Kementerian Pemberdayaan Perempuan']);

-- 4. PJ Publikasi Intern (per hari)
-- Uses existing 'publikasi' category — update existing rows or insert

UPDATE pj_mappings
SET pj_id = (SELECT id FROM pj_contacts WHERE nama = 'Dimas' AND role = 'intern')
WHERE category = 'publikasi' AND lookup_key = 'Senin';

UPDATE pj_mappings
SET pj_id = (SELECT id FROM pj_contacts WHERE nama = 'Calista' AND role = 'intern')
WHERE category = 'publikasi' AND lookup_key = 'Selasa';

-- If the publikasi rows don't exist yet, insert them
INSERT INTO pj_mappings (category, lookup_key, pj_id)
SELECT 'publikasi', 'Senin', (SELECT id FROM pj_contacts WHERE nama = 'Dimas' AND role = 'intern')
WHERE NOT EXISTS (SELECT 1 FROM pj_mappings WHERE category = 'publikasi' AND lookup_key = 'Senin');

INSERT INTO pj_mappings (category, lookup_key, pj_id)
SELECT 'publikasi', 'Selasa', (SELECT id FROM pj_contacts WHERE nama = 'Calista' AND role = 'intern')
WHERE NOT EXISTS (SELECT 1 FROM pj_mappings WHERE category = 'publikasi' AND lookup_key = 'Selasa');
