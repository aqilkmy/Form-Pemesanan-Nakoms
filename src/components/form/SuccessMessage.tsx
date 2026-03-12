
import { CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PJ_DESAIN_GRAFIS, PJ_WEBSITE, PJ_BANTUAN_TEKNIS, PJ_SURVEY, MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/constants"

interface SubmittedData {
    menu_type: MenuType
    kementerian: string
    jenis_bantuan?: "podcast" | "take_video" | "live_instagram" | "lainnya"
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
    const getWhatsAppContacts = () => {
        if (!submittedData) return []

        const contacts: { label: string; nama: string; nomor: string }[] = []
        const defaultMessage = `Permisi kak, saya [Nama] dari [Kementerian] izin konfirmasi pemesanan yang sudah saya submit melalui form. Terima kasih.`

        switch (submittedData.menu_type) {
            case "desain_publikasi": {
                const pjDesain = PJ_DESAIN_GRAFIS[submittedData.kementerian]
                if (pjDesain?.nomor) {
                    contacts.push({
                        label: "PJ Desain Grafis",
                        nama: pjDesain.nama,
                        nomor: pjDesain.nomor
                    })
                }
                break
            }
            case "website": {
                if (PJ_WEBSITE.nomor) {
                    contacts.push({
                        label: "PJ Website",
                        nama: PJ_WEBSITE.nama,
                        nomor: PJ_WEBSITE.nomor
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
                        nomor: pjTeknis.nomor
                    })
                }
                break
            }
            case "survey": {
                if (PJ_SURVEY.nomor) {
                    contacts.push({
                        label: "PJ Survey",
                        nama: PJ_SURVEY.nama,
                        nomor: PJ_SURVEY.nomor
                    })
                }
                break
            }
        }

        return contacts
    }

    const contacts = getWhatsAppContacts()
    const defaultMessage = `Permisi kak, saya [Nama] dari [Kementerian] izin konfirmasi pemesanan yang sudah saya submit melalui form. Terima kasih.`

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

            {contacts.length > 0 && (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 font-medium">Hubungi PJ via WhatsApp:</p>
                    <div className="grid gap-2">
                        {contacts.map((contact, index) => (
                            <a
                                key={index}
                                href={getWhatsAppLink(contact.nomor, defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="w-full justify-start gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{contact.label} - {contact.nama}</span>
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <Button onClick={onReset} className="mt-6" variant="outline">
                Buat Pesanan Baru
            </Button>
        </div>
    )
}
