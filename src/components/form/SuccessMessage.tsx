
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps {
    onReset: () => void
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
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
            <Button onClick={onReset} className="mt-6" variant="outline">
                Buat Pesanan Baru
            </Button>
        </div>
    )
}
