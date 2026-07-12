-- Update Role (Kategori PJ) berdasarkan data default di constant.ts

UPDATE pj_contacts 
SET role = 'desain_grafis' 
WHERE nama IN ('Rosyid', 'Livia', 'Dhina', 'Kes', 'Fira', 'Rahma', 'Isa', 'Rissa', 'Kynaa');

UPDATE pj_contacts 
SET role = 'website' 
WHERE nama IN ('Aufa', 'Najmi', 'Albert', 'Bintang');

UPDATE pj_contacts 
SET role = 'bantuan_teknis' 
WHERE nama IN ('Feli', 'Wulan');

UPDATE pj_contacts 
SET role = 'survey' 
WHERE nama = 'Fahmi';

UPDATE pj_contacts 
SET role = 'platform_khusus' 
WHERE nama IN ('Zahran', 'Nashwa', 'Shava');
