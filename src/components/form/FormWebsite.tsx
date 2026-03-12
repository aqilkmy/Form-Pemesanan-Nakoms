"use client"

import { UseFormReturn } from "react-hook-form"
import { WebsiteFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
                    <h2 className="text-xl font-semibold text-primary">Pemesanan Laman Website</h2>
                    <p className="text-muted-foreground text-sm">
                        Isi detail shortlink dan catatan tambahan untuk website
                    </p>

                    <div className="grid gap-2">
                        <Label htmlFor="custom_shortlink">Custom Shortlink</Label>
                        <Input
                            id="custom_shortlink"
                            placeholder="Contoh: s.id/namakegiatan atau bemunsoed.com/kegiatan"
                            {...register("custom_shortlink")}
                        />
                        {errors.custom_shortlink && <p className="text-sm text-destructive">{errors.custom_shortlink.message}</p>}
                        <p className="text-xs text-muted-foreground">
                            Masukkan shortlink yang Anda inginkan untuk halaman website
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="catatan_website">Catatan Tambahan (Opsional)</Label>
                        <Textarea
                            id="catatan_website"
                            placeholder="Catatan atau request tambahan untuk tim website..."
                            className="min-h-[120px]"
                            {...register("catatan_website")}
                        />
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
                <h2 className="text-xl font-semibold text-primary">Review Pesanan Website</h2>
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
                        <h3 className="font-semibold text-foreground">Detail Website</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Shortlink:</span>
                            <span className="col-span-2 font-medium">{values.custom_shortlink}</span>
                            {values.catatan_website && (
                                <>
                                    <span className="text-muted-foreground">Catatan:</span>
                                    <span className="col-span-2">{values.catatan_website}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
