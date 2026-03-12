
export const KEMENTERIAN_OPTIONS = [
    "Lingkar Presiden",
    "Biro Kesekretariatan",
    "Biro Keuangan",
    "Biro Pengembangan Sumber Daya Anggota",
    "Biro Pengendali & Penjamin Mutu",
    "Kementerian Pengembangan Sumber Daya Mahasiswa",
    "Kementerian Seni dan Olahraga",
    "Kementerian Prestasi dan Inovasi",
    "Kementerian Dalam Negeri",
    "Kementerian Luar Negeri",
    "Kementerian Pengabdian Masyarakat",
    "Kementerian Advokasi dan Kesejahteraan Mahasiswa",
    "Kementerian Aksi dan Propaganda",
    "Kementerian Analisis Isu Strategis",
    "Kementerian Pemberdayaan Perempuan",
    "Kementerian Media Kreatif dan Aplikatif",
    "Kementerian Media Komunikasi dan Informasi",
    "Kementerian Riset dan Data"
]

export const PLATFORM_OPTIONS = [
    "Instagram Feed & X (Twitter)",
    "Instagram Story",
    "Whatsapp Channel",
    "Instagram Reels & Tiktok",
    "YouTube",
    "Repost"
]

export const WAKTU_PUBLIKASI_OPTIONS = [
    "10.00",
    "12.00 (Reels & Igs)",
    "13.00",
    "18.00 (Reels & Igs)",
    "19.00"
]

export const STATUS_OPTIONS = [
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    { value: "in progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { value: "under review", label: "Under Review", color: "bg-purple-100 text-purple-800" },
    { value: "ready", label: "Ready", color: "bg-green-100 text-green-800" },
    { value: "pause", label: "Pause", color: "bg-orange-100 text-orange-800" },
    { value: "cancel", label: "Cancel", color: "bg-red-100 text-red-800" }
] as const

// Jenis Menu/Layanan
export type MenuType = "desain_publikasi" | "website" | "bantuan_teknis" | "survey"

export const MENU_OPTIONS: { id: MenuType; label: string; description: string; icon: string }[] = [
    { id: "desain_publikasi", label: "Desain & Publikasi", description: "Pemesanan desain grafis dan publikasi konten", icon: "🎨" },
    { id: "website", label: "Laman Website", description: "Pemesanan shortlink dan halaman website", icon: "🌐" },
    { id: "bantuan_teknis", label: "Bantuan Teknis", description: "Podcast, video, live instagram, dll", icon: "🎬" },
    { id: "survey", label: "Survey", description: "Publikasi survey/kuesioner", icon: "📊" },
]

// Jenis Bantuan Teknis
export const JENIS_BANTUAN_OPTIONS = [
    { id: "podcast", label: "Podcast", pj: "A" },
    { id: "take_video", label: "Take Konten Video", pj: "A" },
    { id: "live_instagram", label: "Live Instagram", pj: "B" },
    { id: "lainnya", label: "Lainnya (isi sendiri)", pj: "A" },
] as const

// PJ Desain Grafis berdasarkan kementerian pemesan (untuk menu Desain & Publikasi)
export const PJ_DESAIN_GRAFIS: Record<string, { nama: string; nomor: string }> = {
    "Lingkar Presiden": { nama: "Fira", nomor: "6288706691442" },
    "Biro Kesekretariatan": { nama: "Kes", nomor: "62895362396200" },
    "Biro Keuangan": { nama: "Rahma", nomor: "6281392626815" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "Isa", nomor: "6285727631992" },
    "Biro Pengendali & Penjamin Mutu": { nama: "Kynna", nomor: "6289526269980" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "Kynna", nomor: "6289526269980" },
    "Kementerian Seni dan Olahraga": { nama: "Fira", nomor: "6288706691442" },
    "Kementerian Prestasi dan Inovasi": { nama: "Dina", nomor: "6285691140342" },
    "Kementerian Dalam Negeri": { nama: "Rosyid", nomor: "6285134057783" },
    "Kementerian Luar Negeri": { nama: "Rahma", nomor: "6281392626815" },
    "Kementerian Pengabdian Masyarakat": { nama: "Rissa", nomor: "6281393665862" },
    "Kementerian Advokasi dan Kesejahteraan Mahasiswa": { nama: "Livia", nomor: "6289504858150" },
    "Kementerian Aksi dan Propaganda": { nama: "Isa", nomor: "6285727631992" },
    "Kementerian Analisis Isu Strategis": { nama: "Dina", nomor: "6285691140342" },
    "Kementerian Pemberdayaan Perempuan": { nama: "Livia", nomor: "6289504858150" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "Kes", nomor: "62895362396200" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "Rissa", nomor: "6281393665862" },
    "Kementerian Riset dan Data": { nama: "Rosyid", nomor: "6285134057783" },
}

// PJ Website (untuk menu Laman Website) - TODO: isi dengan data yang sesuai
export const PJ_WEBSITE: { nama: string; nomor: string } = {
    nama: "Admin Website",  // Ganti dengan nama PJ website
    nomor: "6281234567890"  // Ganti dengan nomor PJ website
}

// PJ Bantuan Teknis
export const PJ_BANTUAN_TEKNIS: Record<"A" | "B", { nama: string; nomor: string }> = {
    "A": { nama: "Feli", nomor: "6285640447440" },  // Podcast, Video, Lainnya
    "B": { nama: "Wulan", nomor: "6287758922681" },  // Live Instagram
}

// PJ Survey
export const PJ_SURVEY: { nama: string; nomor: string } = {
    nama: "PJ Survey",  // Ganti dengan nama PJ survey
    nomor: "6281234567893"  // Ganti dengan nomor PJ survey
}
