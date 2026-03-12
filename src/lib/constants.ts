
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
    "Instagram Feed",
    "X (Twitter)",
    "Instagram Story",
    "Whatsapp Channel",
    "Instagram Reels",
    "TikTok",
    "YouTube",
    "Spotify",
    "Repost"
]

export const WAKTU_PUBLIKASI_OPTIONS = [
    "10.00 (Feeds)",
    "12.00 (Reels & Igs)",
    "13.00 (Feeds)",
    "17.00 (Spotify & YouTube)",
    "18.00 (Reels & Igs)",
    "19.00 (Feeds)"
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

export const MENU_OPTIONS: { id: MenuType; label: string; description: string; icon: "palette" | "globe" | "video" | "clipboard-list" }[] = [
    { id: "desain_publikasi", label: "Desain & Publikasi", description: "Pemesanan desain grafis dan publikasi konten", icon: "palette" },
    { id: "website", label: "Laman Website", description: "Pemesanan shortlink dan halaman website", icon: "globe" },
    { id: "bantuan_teknis", label: "Bantuan Teknis", description: "Podcast, video, live instagram, dll", icon: "video" },
    { id: "survey", label: "Survey", description: "Publikasi survey/kuesioner", icon: "clipboard-list" },
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
    "Biro Kesekretariatan": { nama: "Rissa", nomor: "6281393665862" },
    "Biro Keuangan": { nama: "Rahma", nomor: "6281392626815" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "Isa", nomor: "6285727631992" },
    "Biro Pengendali & Penjamin Mutu": { nama: "Kynna", nomor: "6289526269980" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "Kynna", nomor: "6289526269980" },
    "Kementerian Seni dan Olahraga": { nama: "Fira", nomor: "6288706691442" },
    "Kementerian Prestasi dan Inovasi": { nama: "Dina", nomor: "6285691140342" },
    "Kementerian Dalam Negeri": { nama: "Rosyid", nomor: "6285134057783" },
    "Kementerian Luar Negeri": { nama: "Rahma", nomor: "6281392626815" },
    "Kementerian Pengabdian Masyarakat": { nama: "Kes", nomor: "62895362396200" },
    "Kementerian Advokasi dan Kesejahteraan Mahasiswa": { nama: "Livia", nomor: "6289504858150" },
    "Kementerian Aksi dan Propaganda": { nama: "Isa", nomor: "6285727631992" },
    "Kementerian Analisis Isu Strategis": { nama: "Dina", nomor: "6285691140342" },
    "Kementerian Pemberdayaan Perempuan": { nama: "Livia", nomor: "6289504858150" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "Rissa", nomor: "6281393665862" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "Kes", nomor: "62895362396200" },
    "Kementerian Riset dan Data": { nama: "Rosyid", nomor: "6285134057783" },
}

// PJ Website berdasarkan kementerian pemesan
export const PJ_WEBSITE: Record<string, { nama: string; nomor: string }> = {
    "Lingkar Presiden": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Kesekretariatan": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Keuangan": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "Najmi", nomor: "62816400771" },
    "Biro Pengendali & Penjamin Mutu": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Seni dan Olahraga": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Prestasi dan Inovasi": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Dalam Negeri": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Luar Negeri": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Pengabdian Masyarakat": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Advokasi dan Kesejahteraan Mahasiswa": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Aksi dan Propaganda": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Analisis Isu Strategis": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Pemberdayaan Perempuan": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Riset dan Data": { nama: "Bintang", nomor: "6285710205061" },
}

// PJ Bantuan Teknis
export const PJ_BANTUAN_TEKNIS: Record<"A" | "B", { nama: string; nomor: string }> = {
    "A": { nama: "Feli", nomor: "6285640447440" },  // Podcast, Video, Lainnya
    "B": { nama: "Wulan", nomor: "6287758922681" },  // Live Instagram
}

// PJ Survey
export const PJ_SURVEY: { nama: string; nomor: string } = {
    nama: "Erga",  // Ganti dengan nama PJ survey
    nomor: "6285878335352"  // Ganti dengan nomor PJ survey
}

// PJ Platform Khusus (untuk Desain & Publikasi)
export const PJ_PLATFORM_KHUSUS: Record<string, { nama: string; nomor: string; platforms: string[] }> = {
    "reels_tiktok": { nama: "Zahran", nomor: "6285880125168", platforms: ["Instagram Reels", "TikTok"] },
    "spotify": { nama: "Nashwa", nomor: "6287722540756", platforms: ["Spotify"] },
    "youtube": { nama: "Shava", nomor: "6285727194418", platforms: ["YouTube"] },
}
