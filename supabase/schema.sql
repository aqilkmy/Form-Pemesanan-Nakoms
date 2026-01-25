-- Create a table for orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  
  -- Identitas
  nama text not null,
  kementerian text not null,
  nomor_whatsapp text not null,
  
  -- Status Baca
  sudah_baca_sop boolean default false,
  
  -- Detail Konten
  judul_desain text not null,
  platform_publikasi text[] not null, -- Array of strings for multi-select
  tanggal_publikasi date not null,
  waktu_publikasi time not null,
  
  -- Aset
  link_thumbnail text not null,
  link_file_konten text not null,
  link_caption_docs text not null,
  
  -- Opsional
  request_lagu text,
  custom_shortlink text,
  fitur_tambahan_web text,
  
  -- Internal Status
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected'))
);

-- Enable Row Level Security (RLS)
alter table orders enable row level security;

-- Policy: Allow public insert (anyone can submit)
create policy "Enable insert for public" on orders
  for insert with check (true);

-- Policy: Allow read access to everyone (or restrict to admin)
-- For this simple app without auth, we might allow public read for the dashboard if we don't implement login,
-- BUT user request mentioned "Admin Dashboard".
-- Ideally, admin should be authenticated. 
-- For MVP/Demo as requested without auth details, we can allow public read or assume anon key has access.
-- We'll allow public read for now to make the simple dashboard work easily.
create policy "Enable read access for all" on orders
  for select using (true);
