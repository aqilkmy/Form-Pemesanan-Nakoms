
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
    "Instagram Reels & Tiktok",
    "YouTube",
    "Website",
    "Repost"
]

export const WAKTU_PUBLIKASI_OPTIONS = [
    "09.00",
    "10.00",
    "12.00 (Reels & Igs)",
    "13.00",
    "15.00",
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

// PJ Publikasi berdasarkan hari publikasi (0 = Minggu, 1 = Senin, dst)
export const PJ_PUBLIKASI: Record<number, { nama: string; nomor: string }> = {
    0: { nama: "Jasmine", nomor: "6281326790367" }, // Minggu
    1: { nama: "Nesya", nomor: "6282225061788" }, // Senin
    2: { nama: "Nesya", nomor: "6282225061788" }, // Selasa
    3: { nama: "Alwan", nomor: "6285150004241" }, // Rabu
    4: { nama: "Alwan", nomor: "6285150004241" }, // Kamis
    5: { nama: "Nana", nomor: "6285156164027" }, // Jumat
    6: { nama: "Nana", nomor: "6285156164027" }, // Sabtu
}

// PJ Desain Grafis berdasarkan kementerian pemesan
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

// PJ Website berdasarkan kementerian pemesan
export const PJ_WEBSITE: Record<string, { nama: string; nomor: string }> = {
    "Lingkar Presiden": { nama: "", nomor: "" },
    "Biro Kesekretariatan": { nama: "", nomor: "" },
    "Biro Keuangan": { nama: "", nomor: "" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "", nomor: "" },
    "Biro Pengendali & Penjamin Mutu": { nama: "", nomor: "" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "", nomor: "" },
    "Kementerian Seni dan Olahraga": { nama: "", nomor: "" },
    "Kementerian Prestasi dan Inovasi": { nama: "", nomor: "" },
    "Kementerian Dalam Negeri": { nama: "", nomor: "" },
    "Kementerian Luar Negeri": { nama: "", nomor: "" },
    "Kementerian Pengabdian Masyarakat": { nama: "", nomor: "" },
    "Kementerian Advokasi dan Kesejahteraan Mahasiswa": { nama: "", nomor: "" },
    "Kementerian Aksi dan Propaganda": { nama: "", nomor: "" },
    "Kementerian Analisis Isu Strategis": { nama: "", nomor: "" },
    "Kementerian Pemberdayaan Perempuan": { nama: "", nomor: "" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "", nomor: "" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "", nomor: "" },
    "Kementerian Riset dan Data": { nama: "", nomor: "" },
}
