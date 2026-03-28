"use client"

import { UseFormReturn } from "react-hook-form"
import { WebsiteFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface FormWebsiteProps {
    form: UseFormReturn<WebsiteFormValues>
    step: "detail" | "review"
}

export function FormWebsite({ form, step }: FormWebsiteProps) {
    const { register, formState: { errors }, getValues } = form

    if (step === "detail") {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Pemesanan Laman Website</h2>
                    <p className="text-muted-foreground text-sm">
                        Lengkapi informasi untuk pembuatan shortlink atau pengajuan fitur/laman website
                    </p>

                    <div className="grid gap-2">
                        <Label htmlFor="tujuan_pemesanan">Tujuan Pemesanan Link</Label>
                        <Input
                            id="tujuan_pemesanan"
                            placeholder="Contoh: OPREC Internship, Pendaftaran Event, dll"
                            {...register("tujuan_pemesanan")}
                        />
                        {errors.tujuan_pemesanan && <p className="text-sm text-destructive">{errors.tujuan_pemesanan.message}</p>}
                        <p className="text-xs text-muted-foreground">
                            Jelaskan kebutuhan link yang ingin Anda pesan
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="link_original">Link Original (Opsional)</Label>
                        <Input
                            id="link_original"
                            placeholder="https://... (link asli yang ingin di-shorten)"
                            {...register("link_original")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Isi jika ingin mengajukan custom/shorten link dari URL yang sudah ada
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="custom_shortlink">Judul Custom/Shorten Link (Opsional)</Label>
                        <Input
                            id="custom_shortlink"
                            placeholder="Contoh: bit.ly/PENGUMUMANOPRECBEMU2025"
                            {...register("custom_shortlink")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format shortlink yang Anda inginkan
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Format Pengajuan Fitur/Laman:</p>
                            <ul className="list-disc ml-4 space-y-1">
                                <li><strong>Nama fitur/laman:</strong> (nama fitur atau laman)</li>
                                <li><strong>Deskripsi:</strong> (penjelasan fitur/laman)</li>
                                <li><strong>Lampiran:</strong> (dokumen konten dan aset)</li>
                            </ul>
                            <p className="mt-2 text-xs italic">Setelah submit, wajib bersinergi dengan PIC untuk menetapkan konsep.</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="link_pengajuan_fitur">Pengajuan Fitur/Laman di Website (Link GDocs) - Opsional</Label>
                        <Input
                            id="link_pengajuan_fitur"
                            placeholder="https://docs.google.com/..."
                            {...register("link_pengajuan_fitur")}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="link_pendaftaran_event">Pembuatan Pendaftaran Event di Website (Link GDocs) - Opsional</Label>
                        <Input
                            id="link_pendaftaran_event"
                            placeholder="https://docs.google.com/... (lampirkan pamflet event)"
                            {...register("link_pendaftaran_event")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Lampirkan pamflet event dalam dokumen
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Review step
    const values = getValues()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Review Pesanan Website</h2>
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
                        <h3 className="font-semibold text-foreground">Detail Pemesanan</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Tujuan:</span>
                            <span className="col-span-2 font-medium">{values.tujuan_pemesanan}</span>
                            {values.link_original && (
                                <>
                                    <span className="text-muted-foreground">Link Original:</span>
                                    <a href={values.link_original} target="_blank" className="col-span-2 text-blue-600 hover:underline truncate">{values.link_original}</a>
                                </>
                            )}
                            {values.custom_shortlink && (
                                <>
                                    <span className="text-muted-foreground">Custom Link:</span>
                                    <span className="col-span-2 font-medium">{values.custom_shortlink}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {(values.link_pengajuan_fitur || values.link_pendaftaran_event) && (
                        <div className="border-t border-border pt-3">
                            <h3 className="font-semibold text-foreground">Lampiran</h3>
                            <div className="flex flex-col gap-2 mt-1">
                                {values.link_pengajuan_fitur && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Pengajuan Fitur/Laman:</span>
                                        <a href={values.link_pengajuan_fitur} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_pengajuan_fitur}</a>
                                    </div>
                                )}
                                {values.link_pendaftaran_event && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Pendaftaran Event:</span>
                                        <a href={values.link_pendaftaran_event} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_pendaftaran_event}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
