
import { z } from "zod"

const googleDriveRegex = /https:\/\/(drive|docs)\.google\.com\/[^\s]+/
const googleDriveError = "Harus link Google Drive atau Google Docs yang valid"

export const orderFormSchema = z.object({
    // Step 1: Identitas & SOP
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    kementerian: z.string().min(1, "Pilih kementerian"),
    nomor_whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)").max(15, "Nomor terlalu panjang"),
    sudah_baca_sop: z.boolean().refine((val) => val === true, {
        message: "Anda harus menyatakan sudah membaca SOP",
    }),

    // Step 2: Detail Konten
    judul_desain: z.string().min(5, "Judul desain minimal 5 karakter"),
    platform_publikasi: z.array(z.string()).min(1, "Pilih minimal satu platform"),
    tanggal_publikasi: z.string().min(1, "Tanggal wajib diisi"),
    waktu_publikasi: z.string().min(1, "Waktu wajib diisi"),

    // Step 3: Aset (bisa diisi "-" jika tidak ada)
    link_thumbnail: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_file_konten: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_caption_docs: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),

    // Step 4: Opsional
    request_lagu: z.string().optional(),
    custom_shortlink: z.string().optional(),
    fitur_tambahan_web: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
