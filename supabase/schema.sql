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
  
  -- Internal Status & Visibility
  status text default 'new' check (status in ('new', 'in progress', 'under review', 'ready', 'pause', 'cancel')),
  is_hidden boolean default false
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

-- ================================================================
-- PJ Mappings table (Penanggung Jawab)
-- Source of truth for PJ assignments, managed via Admin Dashboard
-- ================================================================

create table pj_contacts (
  id uuid default gen_random_uuid() primary key,
  nama text not null,
  nomor text not null,
  role text,
  created_at timestamptz default now()
);

alter table pj_contacts enable row level security;
create policy "Enable read access for all on contacts" on pj_contacts for select using (true);
create policy "Enable insert for all on contacts" on pj_contacts for insert with check (true);
create policy "Enable update for all on contacts" on pj_contacts for update using (true);
create policy "Enable delete for all on contacts" on pj_contacts for delete using (true);

create table pj_mappings (
  id uuid default gen_random_uuid() primary key,
  category text not null,        -- 'desain_grafis' | 'website' | 'bantuan_teknis' | 'survey' | 'platform_khusus'
  lookup_key text not null,      -- kementerian name, "A"/"B", "all", or platform group key
  pj_id uuid references pj_contacts(id) on delete set null,
  platforms text[],              -- only used for platform_khusus category
  updated_at timestamptz default now(),
  unique(category, lookup_key)
);

alter table pj_mappings enable row level security;
create policy "Enable read access for all on mappings" on pj_mappings for select using (true);
create policy "Enable insert for all on mappings" on pj_mappings for insert with check (true);
create policy "Enable update for all on mappings" on pj_mappings for update using (true);
create policy "Enable delete for all on mappings" on pj_mappings for delete using (true);

create index idx_pj_mappings_category on pj_mappings(category);
create index idx_pj_mappings_category_key on pj_mappings(category, lookup_key);
create index idx_pj_mappings_pj_id on pj_mappings(pj_id);

