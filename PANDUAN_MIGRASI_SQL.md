# 🗄️ Panduan & Analisis Migrasi ke Database SQL Mandiri (MySQL / PostgreSQL)

Dokumen ini memuat panduan lengkap, analisis kelayakan, komparasi arsitektur, serta langkah teknis untuk memigrasikan sistem **Form Pemesanan Nakoms (Rizzmed)** dari Supabase Client SDK ke database SQL mandiri (seperti PostgreSQL mandiri atau MySQL/MariaDB) menggunakan ORM di Next.js.

---

## 1. Fakta Basis Data Saat Ini

Sebelum memulai migrasi, penting untuk memahami status arsitektur data saat ini:
- **Aplikasi ini sebenarnya sudah menggunakan SQL.** Supabase berjalan di atas engine **PostgreSQL murni**.
- File `orders_rows.sql`, `pj_contacts_rows.sql`, dan `schema.sql` di root direktori sudah berformat skrip query SQL relasional standar.
- **Perbedaan utamanya:** Saat ini browser client memanggil database secara langsung melalui `@supabase/supabase-js` (*BaaS - Backend as a Service*). Migrasi yang dimaksud adalah beralih ke arsitektur **Server-Side SQL Tradisional** (Next.js Server Actions / API Routes + ORM).

---

## 2. Analisis Tingkat Kesulitan

### **Skor Kelayakan: 3 / 5 (Relatif Mudah)**

```mermaid
pie title Distribusi Kompleksitas Migrasi
    "Skema Tabel & Tipe Data (Sangat Mudah)" : 40
    "Server Actions / CRUD (Mudah)" : 35
    "Penyesuaian Realtime / Polling (Sedang)" : 25
```

### Mengapa Tergolong Mudah?
1. **Jumlah Tabel Sangat Sedikit**: Sistem ini hanya bertumpu pada **3 tabel utama**:
   - `orders` (tabel master semua formulir pesanan).
   - `pj_contacts` (tabel kontak person penanggung jawab).
   - `pj_mappings` (tabel relasi penugasan shift & kementerian).
2. **Tipe Data Sudah Rapi**: Skema validasi Zod (`src/lib/schema.ts`) dan interface TypeScript (`src/lib/types.ts`) sudah 100% lengkap dan sesuai dengan struktur tabel.
3. **Data Dump Sudah Siap**: Anda sudah memiliki file SQL dump (`orders_rows.sql`) sehingga data lama bisa langsung di-*restore* dengan perintah SQL sederhana.

---

## 3. Komparasi Arsitektur

```mermaid
graph LR
    subgraph Arsitektur Saat Ini (Supabase Client-Direct)
        A1[Browser / Client] -->|Anon Key / Direct SDK| B1[(Supabase PostgreSQL)]
    end

    subgraph Arsitektur Pasca Migrasi (Server-Side SQL)
        A2[Browser / Client] -->|Server Action / API| B2[Next.js Backend]
        B2 -->|Prisma / Drizzle ORM| C2[(Database SQL Mandiri<br>Postgres / MySQL / VPS)]
    end
```

| Aspek | Arsitektur Saat Ini (Supabase) | Arsitektur SQL Mandiri (Prisma / Drizzle) |
| :--- | :--- | :--- |
| **Penyimpanan Kredensial DB** | Browser menyimpan Anon Key publik | Kredensial koneksi DB (URL, password) tersimpan aman di environment server (`.env`) |
| **Keamanan Autentikasi** | Hardcode di client (`AdminLogin.tsx`) | Terverifikasi aman via Next.js Server Session / HTTP-Only Cookie |
| **Fitur Realtime** | Menggunakan WebSocket bawaan Supabase | Digantikan dengan *Smart Polling* (TanStack Query / SWR) atau SSE |
| **Hosting Database** | Cloud Supabase | Bebas: VPS (Ubuntu), cPanel MySQL, Neon, Railway, Docker, dll. |

---

## 4. Rekomendasi Stack Database & ORM

### Pilihan Engine Database
1. **PostgreSQL Mandiri (Sangat Direkomendasikan ⭐⭐⭐⭐⭐)**
   - *Alasan:* Skema saat ini sudah memakai fitur PostgreSQL (tipe `TEXT[]` array untuk `platform_publikasi` dan `status_publikasi` format `JSONB`). Tidak perlu mengubah tipe data sama sekali.
   - *Opsi Hosting:* Neon.tech (gratis & cepat), Railway, Supabase self-hosted, atau VPS Ubuntu (Docker Postgres).
2. **MySQL / MariaDB (Direkomendasikan jika memakai cPanel/Shared Hosting ⭐⭐⭐)**
   - *Penyesuaian:* Tipe `TEXT[]` diubah menjadi kolom `JSON` atau string CSV koma.

### Pilihan ORM (Object-Relational Mapping)
- **Prisma ORM (Paling Mudah & Populer)**: Memiliki Prisma Studio (GUI database visual bawaan), dokumentasi sangat ramah pemula, dan auto-generate migration.
- **Drizzle ORM (Paling Ringan & Cepat)**: Sangat ramping (*zero-overhead*), performa SQL murni, ukuran bundle minimalis.

---

## 5. Panduan Langkah Teknis Migrasi (Contoh: Prisma ORM)

### Langkah 1: Instalasi Prisma
Jalankan perintah berikut di terminal:
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Langkah 2: Konfigurasi Database URL (`.env`)
Atur string koneksi database Anda:
```env
# Untuk PostgreSQL:
DATABASE_URL="postgresql://user:password@localhost:5432/rizzmed_db?schema=public"

# Atau Untuk MySQL:
# DATABASE_URL="mysql://user:password@localhost:3306/rizzmed_db"
```

### Langkah 3: Definisikan Skema Prisma (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql" // atau "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum OrderStatus {
  new
  in_progress
  under_review
  ready
  pause
  cancel
}

model Order {
  id                        String       @id @default(uuid())
  createdAt                 DateTime     @default(now()) @map("created_at")
  status                    OrderStatus  @default(new)
  menuType                  String       @map("menu_type")
  nama                      String
  kementerian               String
  nomorWhatsapp             String       @map("nomor_whatsapp")
  sudahBacaSop              Boolean      @default(false) @map("sudah_baca_sop")
  isHidden                  Boolean      @default(false) @map("is_hidden")
  
  // Desain & Publikasi
  judulDesain               String?      @map("judul_desain")
  platformPublikasi         String[]     @map("platform_publikasi") // Jika MySQL: Json?
  tanggalPublikasi          String?      @map("tanggal_publikasi")
  waktuPublikasi            String?      @map("waktu_publikasi")
  linkFileKonten            String?      @map("link_file_konten")
  linkCaptionDocs           String?      @map("link_caption_docs")
  requestLagu               String?      @map("request_lagu")
  linkDesainSelesai         String?      @map("link_desain_selesai")
  statusPublikasi           Json?        @map("status_publikasi")
  
  // Website & Twibbon
  websiteSubType            String?      @map("website_sub_type")
  tujuanPemesanan           String?      @map("tujuan_pemesanan")
  linkOriginal              String?      @map("link_original")
  customShortlink           String?      @map("custom_shortlink")
  judulKampanye             String?      @map("judul_kampanye")
  namaUrlTwibbon            String?      @map("nama_url_twibbon")
  captionTwibbon            String?      @map("caption_twibbon")
  formatTwibbon             String?      @map("format_twibbon")
  tanggalPublikasiTwibbon   String?      @map("tanggal_publikasi_twibbon")
  linkAssetTwibbon          String?      @map("link_asset_twibbon")

  @@map("orders")
}

model PJContact {
  id         String      @id @default(uuid())
  nama       String
  nomor      String
  role       String?
  createdAt  DateTime    @default(now()) @map("created_at")
  mappings   PJMapping[]

  @@map("pj_contacts")
}

model PJMapping {
  id         String     @id @default(uuid())
  category   String
  lookupKey  String     @map("lookup_key")
  pjId       String?    @map("pj_id")
  platforms  String[]?  // Jika MySQL: Json?
  updatedAt  DateTime   @updatedAt @map("updated_at")
  pjContact  PJContact? @relation(fields: [pjId], references: [id], onDelete: SetNull)

  @@map("pj_mappings")
}
```

Jalankan migrasi skema:
```bash
npx prisma db push
```

### Langkah 4: Membuat Server Actions untuk Menggantikan Supabase Client
Buat file `src/lib/actions/orders.ts`:
```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mengambil seluruh pesanan
export async function getOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Menambah pesanan baru dari formulir publik
export async function createOrder(data: any) {
  const order = await prisma.order.create({
    data,
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/monitoring");
  return { success: true, order };
}

// Update status pesanan oleh Admin
export async function updateOrderStatus(orderId: string, status: any) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath("/admin/dashboard");
}

// Hapus pesanan oleh Admin
export async function deleteOrder(orderId: string) {
  await prisma.order.delete({
    where: { id: orderId },
  });
  revalidatePath("/admin/dashboard");
}
```

### Langkah 5: Mengatasi Fitur Realtime (Tanpa WebSocket Supabase)
Pada database SQL mandiri biasa, cara paling praktis, ringan, dan stabil untuk auto-update tabel pesanan tanpa reload adalah dengan **TanStack Query / SWR Auto Polling**:
```tsx
// Mengambil data pesanan dan refresh otomatis setiap 8 detik
import useSWR from "swr";

export function useOrdersPolling() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/orders",
    (url) => fetch(url).then((res) => res.json()),
    { refreshInterval: 8000 } // Auto poll setiap 8 detik
  );

  return { orders: data || [], isLoading, mutate };
}
```

### Langkah 6: Import Data Lama
Buka terminal database Anda atau pgAdmin / DBeaver, lalu jalankan query file dump:
```bash
psql -h localhost -U user -d rizzmed_db -f orders_rows.sql
psql -h localhost -U user -d rizzmed_db -f pj_contacts_rows.sql
psql -h localhost -U user -d rizzmed_db -f pj_mappings_rows.sql
```

---

## 6. Checklist Evaluasi: Kapan Anda Perlu Migrasi?

| Pertimbangan | Tetap di Supabase Saat Ini | Migrasi ke SQL Mandiri |
| :--- | :---: | :---: |
| Ingin fitur realtime instan tanpa konfigurasi server | ✅ | ❌ |
| Tidak ingin repot memelihara server database sendiri | ✅ | ❌ |
| Ingin database terhubung ke server/hosting kampus sendiri | ❌ | ✅ |
| Ingin keamanan penuh di mana password DB tidak pernah ada di browser | ❌ | ✅ |
| Tidak ingin ada batas kuota gratis dari provider cloud (*vendor lock-in*) | ❌ | ✅ |

---

## 7. Kesimpulan & Saran

1. **Kelayakan**: Sangat mudah dilakukan dan tidak berisiko tinggi karena struktur tabel aplikasi ini ringkas.
2. **Prioritas**: Jika kendala Anda saat ini adalah **keamanan login admin** atau **kode tabel yang menumpuk**, hal tersebut **bisa diselesaikan langsung** di arsitektur saat ini tanpa harus memindahkan database (cukup dengan membuat Next.js API route untuk login dan memecah file `AdminDashboard.tsx`).
3. Jika pihak organisasi (BEM Unsoed) mewajibkan database disimpan di server internal kampus (cPanel/VPS sendiri), maka panduan migrasi di atas dapat dijalankan dalam waktu **1 - 2 hari kerja**.
