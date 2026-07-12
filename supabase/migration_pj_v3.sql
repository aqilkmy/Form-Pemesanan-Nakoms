-- Migration v3: Tambah kolom role ke pj_contacts
-- Menandakan bidang spesifik dari Penanggung Jawab

ALTER TABLE pj_contacts
ADD COLUMN role text;

-- Keterangan role yang valid:
-- 'desain_grafis'
-- 'website'
-- 'bantuan_teknis'
-- 'survey'
-- 'platform_khusus'
