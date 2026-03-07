
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "@/lib/schema"
import { Card, CardContent } from "@/components/ui/card"

// Helper for date formatting
const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString("id-ID", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

interface StepProps {
    form: UseFormReturn<OrderFormValues>
}

export function StepReview({ form }: StepProps) {
    const values = form.getValues()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Review Pesanan</h2>
                <p className="text-muted-foreground text-sm">
                    Mohon periksa kembali data pesanan Anda sebelum dikirim.
                </p>

                <div className="bg-secondary/30 rounded-lg p-4 space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-foreground">Identitas</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Nama:</span>
                            <span className="col-span-2 font-medium">{values.nama}</span>

                            <span className="text-muted-foreground">Kementerian:</span>
                            <span className="col-span-2 font-medium">{values.kementerian}</span>

                            <span className="text-muted-foreground">WhatsApp:</span>
                            <span className="col-span-2 font-medium">{values.nomor_whatsapp}</span>
                        </div>
                    </div>

                    <div className="border-t border-border pt-3">
                        <h3 className="font-semibold text-foreground">Detail Konten</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Judul:</span>
                            <span className="col-span-2 font-medium">{values.judul_desain}</span>

                            <span className="text-muted-foreground">Platform:</span>
                            <span className="col-span-2 font-medium">
                                {values.platform_publikasi?.join(", ")}
                            </span>

                            <span className="text-muted-foreground">Waktu Tayang:</span>
                            <span className="col-span-2 font-medium">
                                {formatDate(values.tanggal_publikasi)} — Pukul {values.waktu_publikasi}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-border pt-3">
                        <h3 className="font-semibold text-foreground">Aset & Link</h3>
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">File Konten:</span>
                                <a href={values.link_file_konten} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_file_konten}</a>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Caption:</span>
                                <a href={values.link_caption_docs} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_caption_docs}</a>
                            </div>
                        </div>
                    </div>

                    {(values.request_lagu || values.custom_shortlink || values.fitur_tambahan_web) && (
                        <div className="border-t border-border pt-3">
                            <h3 className="font-semibold text-foreground">Tambahan</h3>
                            <div className="grid grid-cols-3 gap-1 mt-1">
                                {values.request_lagu && (
                                    <>
                                        <span className="text-muted-foreground">Lagu:</span>
                                        <span className="col-span-2">{values.request_lagu}</span>
                                    </>
                                )}
                                {values.custom_shortlink && (
                                    <>
                                        <span className="text-muted-foreground">Shortlink:</span>
                                        <span className="col-span-2">{values.custom_shortlink}</span>
                                    </>
                                )}
                                {values.fitur_tambahan_web && (
                                    <>
                                        <span className="text-muted-foreground">Catatan:</span>
                                        <span className="col-span-2">{values.fitur_tambahan_web}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
