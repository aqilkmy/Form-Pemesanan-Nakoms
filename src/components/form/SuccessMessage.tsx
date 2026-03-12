
import { CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PJ_DESAIN_GRAFIS, PJ_WEBSITE, PJ_BANTUAN_TEKNIS, PJ_SURVEY, PJ_PLATFORM_KHUSUS, MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/constants"

interface SubmittedData {
    menu_type: MenuType
    kementerian: string
    jenis_bantuan?: "podcast" | "take_video" | "live_instagram" | "lainnya"
    platform_publikasi?: string[]
}

interface SuccessMessageProps {
    onReset: () => void
    submittedData?: SubmittedData
}

function getWhatsAppLink(nomor: string, message: string): string {
    const cleanNumber = nomor.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

function getPJForBantuanTeknis(jenisBantuan: string): "A" | "B" {
    const option = JENIS_BANTUAN_OPTIONS.find(o => o.id === jenisBantuan)
    return option?.pj || "A"
}

export function SuccessMessage({ onReset, submittedData }: SuccessMessageProps) {
    const getTemplateMessage = (menuType: MenuType, kementerian: string, pjNama: string): string => {
        switch (menuType) {
            case "desain_publikasi":
                return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan *Desain & Publikasi* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih 🙏`
            case "website":
                return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan *Laman Website* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih 🙏`
            case "bantuan_teknis":
                return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan *Bantuan Teknis* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih 🙏`
            case "survey":
                return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan *Publikasi Survey* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih 🙏`
            default:
                return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan yang sudah saya submit melalui form RISET & MEDIA. Terima kasih 🙏`
        }
    }

    const getPlatformMessage = (kementerian: string, pjNama: string, platformLabel: string): string => {
        return `Halo Kak ${pjNama}, saya dari ${kementerian} izin konfirmasi pemesanan *Desain & Publikasi* untuk platform *${platformLabel}* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih 🙏`
    }

    const getWhatsAppContacts = () => {
        if (!submittedData) return []

        const contacts: { label: string; nama: string; nomor: string; message: string }[] = []

        switch (submittedData.menu_type) {
            case "desain_publikasi": {
                const pjDesain = PJ_DESAIN_GRAFIS[submittedData.kementerian]
                if (pjDesain?.nomor) {
                    contacts.push({
                        label: "PJ Desain Grafis",
                        nama: pjDesain.nama,
                        nomor: pjDesain.nomor,
                        message: getTemplateMessage("desain_publikasi", submittedData.kementerian, pjDesain.nama)
                    })
                }

                // Check for special platform PJs
                if (submittedData.platform_publikasi && submittedData.platform_publikasi.length > 0) {
                    const addedPJs = new Set<string>() // Prevent duplicates

                    Object.entries(PJ_PLATFORM_KHUSUS).forEach(([key, pjData]) => {
                        const hasMatchingPlatform = pjData.platforms.some(platform => 
                            submittedData.platform_publikasi?.includes(platform)
                        )
                        
                        if (hasMatchingPlatform && !addedPJs.has(key)) {
                            addedPJs.add(key)
                            const matchedPlatforms = pjData.platforms.filter(p => 
                                submittedData.platform_publikasi?.includes(p)
                            )
                            contacts.push({
                                label: `PJ ${matchedPlatforms.join(" & ")}`,
                                nama: pjData.nama,
                                nomor: pjData.nomor,
                                message: getPlatformMessage(submittedData.kementerian, pjData.nama, matchedPlatforms.join(" & "))
                            })
                        }
                    })
                }
                break
            }
            case "website": {
                const pjWebsite = PJ_WEBSITE[submittedData.kementerian]
                if (pjWebsite?.nomor) {
                    contacts.push({
                        label: "PJ Website",
                        nama: pjWebsite.nama,
                        nomor: pjWebsite.nomor,
                        message: getTemplateMessage("website", submittedData.kementerian, pjWebsite.nama)
                    })
                }
                break
            }
            case "bantuan_teknis": {
                const pjKey = submittedData.jenis_bantuan 
                    ? getPJForBantuanTeknis(submittedData.jenis_bantuan) 
                    : "A"
                const pjTeknis = PJ_BANTUAN_TEKNIS[pjKey]
                if (pjTeknis?.nomor) {
                    contacts.push({
                        label: "PJ Bantuan Teknis",
                        nama: pjTeknis.nama,
                        nomor: pjTeknis.nomor,
                        message: getTemplateMessage("bantuan_teknis", submittedData.kementerian, pjTeknis.nama)
                    })
                }
                break
            }
            case "survey": {
                if (PJ_SURVEY?.nomor) {
                    contacts.push({
                        label: "PJ Survey",
                        nama: PJ_SURVEY.nama,
                        nomor: PJ_SURVEY.nomor,
                        message: getTemplateMessage("survey", submittedData.kementerian, PJ_SURVEY.nama)
                    })
                }
                break
            }
        }

        return contacts
    }

    const contacts = getWhatsAppContacts()

    const getMenuLabel = () => {
        switch (submittedData?.menu_type) {
            case "desain_publikasi": return "Desain & Publikasi"
            case "website": return "Laman Website"
            case "bantuan_teknis": return "Bantuan Teknis"
            case "survey": return "Survey"
            default: return ""
        }
    }

    return (
        <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center"> 
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Pesanan Berhasil Dikirim!</h2>
                {submittedData && (
                    <p className="text-sm text-primary font-medium">
                        Jenis Layanan: {getMenuLabel()}
                    </p>
                )}
                <p className="text-gray-500 max-w-md mx-auto">
                    Terima kasih. Silakan hubungi PJ terkait via WhatsApp untuk konfirmasi lebih lanjut.
                </p>
            </div>

            {contacts.length > 0 ? (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 font-medium">Hubungi PJ via WhatsApp:</p>
                    <div className="grid gap-3">
                        {contacts.map((contact, index) => (
                            <a
                                key={index}
                                href={getWhatsAppLink(contact.nomor, contact.message)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button 
                                    type="button"
                                    className="w-3/4 justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-6 text-base"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>Chat {contact.nama} - {contact.label}</span>
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            ) : submittedData && (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-yellow-600 font-medium">
                        PJ untuk kementerian Anda belum tersedia. Silakan hubungi admin.
                    </p>
                </div>
            )}

            <Button onClick={onReset} className="mt-6" variant="outline">
                Buat Pesanan Baru
            </Button>
        </div>
    )
}
