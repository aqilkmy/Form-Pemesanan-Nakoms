
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
