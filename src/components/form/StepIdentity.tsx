
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectNative } from "@/components/ui/select-native"
import { KEMENTERIAN_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface StepProps {
    form: UseFormReturn<OrderFormValues>
}

export function StepIdentity({ form }: StepProps) {
    const { register, formState: { errors } } = form

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Identitas Pemesan</h2>

                <div className="grid gap-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" placeholder="Masukkan nama lengkap" {...register("nama")} />
                    {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="kementerian">Asal Kementerian/Biro</Label>
                    <SelectNative id="kementerian" {...register("kementerian")}>
                        <option value="">Pilih Kementerian/Biro</option>
                        {KEMENTERIAN_OPTIONS.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </SelectNative>
                    {errors.kementerian && <p className="text-sm text-destructive">{errors.kementerian.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="nomor_whatsapp">Nomor WhatsApp</Label>
                    <Input
                        id="nomor_whatsapp"
                        placeholder="Contoh: 081234567890"
                        type="tel"
                        {...register("nomor_whatsapp")}
                    />
                    {errors.nomor_whatsapp && <p className="text-sm text-destructive">{errors.nomor_whatsapp.message}</p>}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h2 className="text-xl font-semibold text-primary">Konfirmasi SOP</h2>
                <div className="flex items-start bg-secondary p-4 rounded-lg">
                    <div className="flex items-center h-5">
                        <input
                            id="sudah_baca_sop"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            {...register("sudah_baca_sop")}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="sudah_baca_sop" className="font-medium text-foreground">
                            Saya sudah membaca dan memahami <span className="font-bold text-blue-700 italic underline"><a href="google.com">SOP Pemesanan Konten</a></span>
                        </label>
                        <p className="text-muted-foreground mt-1">
                            Dengan mencentang ini, Anda setuju untuk mengikuti semua prosedur yang berlaku.
                        </p>
                        {errors.sudah_baca_sop && <p className="text-sm text-destructive mt-1">{errors.sudah_baca_sop.message}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
