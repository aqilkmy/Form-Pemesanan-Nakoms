# Tambah PJ Internship (Per Proker) ke Sistem

Menambahkan staf internship sebagai PJ tambahan yang muncul di halaman konfirmasi WhatsApp. Intern berbeda dari staf biasa — PJ Desain & Website intern di-mapping **per proker** (bukan per kementerian), dan ditampilkan dengan **warna berbeda** agar user notice.

## Data Internship

### PJ Desain Intern (per proker)
| Nama | Nomor | Proker yang Dipegang |
|------|-------|---------------------|
| Maura | +62 895-3960-55600 | Nulispedia (Medkraf), Media Partner (Lugri) |
| Racha | +62 812-2676-7725 | Malaka (Medkraf), Seniora Mengapresiasi (Seniora) |

### PJ Website Intern (per proker)
| Nama | Nomor | Proker yang Dipegang |
|------|-------|---------------------|
| Ayisha | +62 811-2022-020 | PSDM (S.O.L.O), Seniora (PORSOED), Akspro (Sekolah Politik Pergerakan) |
| Naila Rona | +62 822-9823-3138 | Pengmas (Desa Cita & Pesta Rakyat Soedirman), PSDA (Internship BEM Unsoed), Pempu (ALERTA: PEKA) |

### PJ Publikasi Intern (per hari)
| Nama | Nomor | Hari |
|------|-------|------|
| Dimas | +62 895-2928-4887 | Senin |
| Calista | +62 813-8880-0395 | Selasa |

## Open Questions

> [!IMPORTANT]
> **Mapping PJ Desain Intern → Kementerian:**
> - Maura memegang **Nulispedia** (proker dari **Kementerian Media Kreatif dan Aplikatif**) dan **Media Partner** (proker dari **Kementerian Luar Negeri**). Apakah artinya: jika pemesan dari **Medkraf** atau **Lugri**, muncul juga tombol chat ke Maura?
> - Racha memegang **Malaka** (Medkraf) dan **Seniora Mengapresiasi** (Seniora). Jika pemesan dari **Medkraf** atau **Seniora**, muncul juga tombol chat ke Racha?
> - Karena Maura & Racha sama-sama memegang proker Medkraf, apakah kedua-duanya muncul saat pemesan dari Medkraf?

> [!IMPORTANT]
> **Mapping PJ Website Intern → Kementerian:**
> - Ayisha: PSDM = **Kem. Pengembangan Sumber Daya Mahasiswa**, Seniora = **Kem. Seni dan Olahraga**, Akspro = **Kem. Aksi dan Propaganda**
> - Naila Rona: Pengmas = **Kem. Pengabdian Masyarakat**, PSDA = **Biro Pengembangan Sumber Daya Anggota**, Pempu = **Kem. Pemberdayaan Perempuan**
> Apakah mapping di atas sudah benar?

> [!IMPORTANT]  
> **PJ Publikasi Intern (Dimas & Calista):**
> Apakah mereka ditampilkan **menggantikan** PJ Publikasi staf yang sudah ada untuk hari Senin & Selasa, atau **sebagai tambahan** (kedua-duanya muncul)?

## Proposed Changes

### Database — SQL Migration

#### [NEW] `supabase/migration_intern_pj.sql`
SQL file yang bisa di-run di Supabase SQL Editor:
1. Insert intern contacts ke `pj_contacts` dengan `role = 'intern'`
2. Insert mappings ke `pj_mappings` dengan category baru:
   - `intern_desain` — lookup_key = nama kementerian (Medkraf, Lugri, Seniora)
   - `intern_website` — lookup_key = nama kementerian (PSDM, Seniora, Akspro, Pengmas, PSDA, Pempu)
   - `publikasi` — lookup_key = hari (Senin, Selasa) → update existing or insert

---

### Backend Logic

#### [MODIFY] [`pj.ts`](file:///e:/Github/Form-Pemesanan-Nakoms/src/lib/pj.ts)
- Add new `PJCategory` entries: `intern_desain`, `intern_website`
- Update `buildPJLookups()` to process `intern_desain` and `intern_website` categories
- Return `internDesain` and `internWebsite` lookups alongside existing ones
- Add `proker_label` field from the mapping so we can display proker info in the UI

#### [MODIFY] [`constants.ts`](file:///e:/Github/Form-Pemesanan-Nakoms/src/lib/constants.ts)
- Add `PJ_CATEGORY_LABELS` entries for the new categories

---

### Frontend — SuccessMessage

#### [MODIFY] [`SuccessMessage.tsx`](file:///e:/Github/Form-Pemesanan-Nakoms/src/components/form/SuccessMessage.tsx)
- In `getWhatsAppContacts()`:
  - For `desain_publikasi`: after adding PJ Desain staf, also check `internDesain[kementerian]` and add intern contacts with distinct label & color
  - For `website`: after adding PJ Website staf, also check `internWebsite[kementerian]` and add intern contacts
- Add `isIntern` flag to contact objects
- Render intern buttons with **different color** (e.g., amber/orange instead of green) and add keterangan showing nama + proker yang dipegang

---

### Database Schema

#### [MODIFY] [`schema.sql`](file:///e:/Github/Form-Pemesanan-Nakoms/supabase/schema.sql)
- No schema changes needed — `pj_contacts.role` already exists and can store `'intern'`
- `pj_mappings` category is a free-text field, so `intern_desain` / `intern_website` work without migration

## Verification Plan

### Automated Tests
```bash
npx tsc --noEmit
```

### Manual Verification
- Submit order sebagai kementerian Medkraf → harus muncul tombol chat Maura & Racha (intern, warna beda) + PJ Desain staf (Rosyid, warna hijau)
- Submit order website sebagai PSDM → harus muncul tombol chat Ayisha (intern, warna beda) + PJ Website staf (Albert, warna hijau)
- Submit order desain dengan Repost hari Senin → harus muncul tombol chat Dimas (PJ Publikasi)
