-- Create a table for orders (supports multiple menu types)
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  
  -- Menu Type (discriminator)
  menu_type text not null check (menu_type in ('desain_publikasi', 'website', 'bantuan_teknis', 'survey')),
  
  -- Identitas (shared across all menus)
  nama text not null,
  kementerian text not null,
  nomor_whatsapp text not null,
  sudah_baca_sop boolean default false,
  
  -- Desain & Publikasi fields
  judul_desain text,
  platform_publikasi text[], -- Array of strings for multi-select
  tanggal_publikasi date,
  waktu_publikasi text,
  link_file_konten text,
  link_caption_docs text,
  request_lagu text,
  link_desain_selesai text,
  status_publikasi jsonb default '{}'::jsonb, -- Checklist status per platform
  
  -- Website fields
  tujuan_pemesanan text,
  link_original text,
  custom_shortlink text,
  link_pengajuan_fitur text,
  link_pendaftaran_event text,
  
  -- Bantuan Teknis fields  
  nama_kegiatan text,
  tanggal_kegiatan date,
  waktu_kegiatan text,
  tempat_kegiatan text,
  jenis_bantuan text check (jenis_bantuan in ('podcast', 'take_video', 'live_instagram', 'lainnya') or jenis_bantuan is null),
  jenis_bantuan_lainnya text,
  
  -- Survey fields
  judul_survey text,
  deskripsi_survey text,
  target_responden text,
  deadline_survey date,
  link_gdrive_brief text,
  hadiah_survey text check (hadiah_survey in ('ada', 'tidak') or hadiah_survey is null),
  
  -- Internal Status
  status text default 'new' check (status in ('new', 'in progress', 'under review', 'ready', 'pause', 'cancel'))
);

-- Enable Row Level Security (RLS)
alter table orders enable row level security;

-- Policy: Allow public insert (anyone can submit)
create policy "Enable insert for public" on orders
  for insert with check (true);

-- Policy: Allow read access to everyone
create policy "Enable read access for all" on orders
  for select using (true);

-- Policy: Allow update for status changes
create policy "Enable update for all" on orders
  for update using (true);

-- Create index on menu_type for faster queries  
create index idx_orders_menu_type on orders(menu_type);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);
