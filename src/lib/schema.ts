
import { z } from "zod"

// Base identity schema (shared across all forms)
export const identitySchema = z.object({
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    kementerian: z.string().min(1, "Pilih kementerian"),
    nomor_whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)").max(15, "Nomor terlalu panjang"),
    sudah_baca_sop: z.boolean().refine((val) => val === true, {
        message: "Anda harus menyatakan sudah membaca SOP",
    }),
})

// Menu 1: Desain & Publikasi
export const desainPublikasiSchema = identitySchema.extend({
    menu_type: z.literal("desain_publikasi"),
    judul_desain: z.string().min(5, "Judul desain minimal 5 karakter"),
    platform_publikasi: z.array(z.string()).min(1, "Pilih minimal satu platform"),
    tanggal_publikasi: z.string().min(1, "Tanggal wajib diisi"),
    waktu_publikasi: z.string().min(1, "Waktu wajib diisi"),
    link_file_konten: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_caption_docs: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    request_lagu: z.string().optional(),
})

// Menu 2: Laman Website
export const websiteSchema = identitySchema.extend({
    menu_type: z.literal("website"),
    tujuan_pemesanan: z.string().min(3, "Tujuan pemesanan wajib diisi"),
    link_original: z.string().optional(),
    custom_shortlink: z.string().optional(),
    link_pengajuan_fitur: z.string().optional(),
    link_pendaftaran_event: z.string().optional(),
})

// Menu 3: Bantuan Teknis
export const bantuanTeknisSchema = identitySchema.extend({
    menu_type: z.literal("bantuan_teknis"),
    nama_kegiatan: z.string().min(5, "Nama kegiatan minimal 5 karakter"),
    tanggal_kegiatan: z.string().min(1, "Tanggal wajib diisi"),
    waktu_kegiatan: z.string().min(1, "Waktu wajib diisi"),
    tempat_kegiatan: z.string().min(3, "Tempat kegiatan wajib diisi"),
    jenis_bantuan: z.enum(["podcast", "take_video", "live_instagram", "lainnya"]),
    jenis_bantuan_lainnya: z.string().optional(),
})

// Menu 4: Survey
export const surveySchema = identitySchema.extend({
    menu_type: z.literal("survey"),
    judul_survey: z.string().min(5, "Judul survey minimal 5 karakter"),
    deskripsi_survey: z.string().min(10, "Deskripsi minimal 10 karakter"),
    target_responden: z.string().min(3, "Target responden wajib diisi"),
    deadline_survey: z.string().min(1, "Deadline wajib diisi"),
    link_gdrive_brief: z.string().min(1, "Link G-Drive wajib diisi"),
    hadiah_survey: z.enum(["ada", "tidak"]),
})

// Union type for all forms
export const orderFormSchema = z.discriminatedUnion("menu_type", [
    desainPublikasiSchema,
    websiteSchema,
    bantuanTeknisSchema,
    surveySchema,
])

// Legacy schema for backward compatibility
export const legacyOrderFormSchema = z.object({
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    kementerian: z.string().min(1, "Pilih kementerian"),
    nomor_whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)").max(15, "Nomor terlalu panjang"),
    sudah_baca_sop: z.boolean().refine((val) => val === true, {
        message: "Anda harus menyatakan sudah membaca SOP",
    }),
    judul_desain: z.string().min(5, "Judul desain minimal 5 karakter"),
    platform_publikasi: z.array(z.string()).min(1, "Pilih minimal satu platform"),
    tanggal_publikasi: z.string().min(1, "Tanggal wajib diisi"),
    waktu_publikasi: z.string().min(1, "Waktu wajib diisi"),
    link_thumbnail: z.string().optional(),
    link_file_konten: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_caption_docs: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    request_lagu: z.string().optional(),
    custom_shortlink: z.string().optional(),
    fitur_tambahan_web: z.string().optional(),
})

export type IdentityFormValues = z.infer<typeof identitySchema>
export type DesainPublikasiFormValues = z.infer<typeof desainPublikasiSchema>
export type WebsiteFormValues = z.infer<typeof websiteSchema>
export type BantuanTeknisFormValues = z.infer<typeof bantuanTeknisSchema>
export type SurveyFormValues = z.infer<typeof surveySchema>
export type OrderFormValues = z.infer<typeof orderFormSchema>
export type LegacyOrderFormValues = z.infer<typeof legacyOrderFormSchema>
