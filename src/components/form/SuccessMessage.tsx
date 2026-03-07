
import { CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PJ_PUBLIKASI, PJ_DESAIN_GRAFIS, PJ_WEBSITE } from "@/lib/constants"

interface SubmittedData {
    kementerian: string
    tanggal_publikasi: string
}

interface SuccessMessageProps {
    onReset: () => void
    submittedData?: SubmittedData
}

function getDayOfWeek(dateString: string): number {
    const date = new Date(dateString)
    return date.getDay() // 0 = Sunday, 1 = Monday, etc.
}

function getWhatsAppLink(nomor: string, message: string): string {
    // Clean phone number and create WhatsApp link
    const cleanNumber = nomor.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

export function SuccessMessage({ onReset, submittedData }: SuccessMessageProps) {
    const dayOfWeek = submittedData ? getDayOfWeek(submittedData.tanggal_publikasi) : 0
    const pjPublikasi = PJ_PUBLIKASI[dayOfWeek]
    const pjDesainGrafis = submittedData ? PJ_DESAIN_GRAFIS[submittedData.kementerian] : null
    const pjWebsite = submittedData ? PJ_WEBSITE[submittedData.kementerian] : null

    const defaultMessage = "Permisi kak, saya [Nama] dari [Kementerian] izin konfirmasi pemesanan konten yang sudah saya submit melalui form. Terima kasih."

    return (
        <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center"> 
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Pesanan Berhasil Dikirim!</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Terima kasih. Admin kami akan segera memeriksa pesanan Anda dan menghubungi via WhatsApp untuk konfirmasi lebih lanjut.
                </p>
            </div>

            {submittedData && (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 font-medium">Hubungi PJ via WhatsApp:</p>
                    <div className="grid gap-2">
                        {pjPublikasi?.nomor && (
                            <a
                                href={getWhatsAppLink(pjPublikasi.nomor, defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="w-full justify-start gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>PJ Publikasi - {pjPublikasi.nama}</span>
                                </Button>
                            </a>
                        )}
                        {pjDesainGrafis?.nomor && (
                            <a
                                href={getWhatsAppLink(pjDesainGrafis.nomor, defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="w-full justify-start gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>PJ Desain Grafis - {pjDesainGrafis.nama}</span>
                                </Button>
                            </a>
                        )}
                        {pjWebsite?.nomor && (
                            <a
                                href={getWhatsAppLink(pjWebsite.nomor, defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="w-full justify-start gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>PJ Website - {pjWebsite.nama}</span>
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            )}

            <Button onClick={onReset} className="mt-6" variant="outline">
                Buat Pesanan Baru
            </Button>
        </div>
    )
}
