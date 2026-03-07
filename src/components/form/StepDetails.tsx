
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SelectNative } from "@/components/ui/select-native"
import { PLATFORM_OPTIONS, WAKTU_PUBLIKASI_OPTIONS } from "@/lib/constants"

interface StepProps {
    form: UseFormReturn<OrderFormValues>
}

export function StepDetails({ form }: StepProps) {
    const { register, formState: { errors } } = form

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Detail Konten</h2>

                <div className="grid gap-2">
                    <Label htmlFor="judul_desain">Judul Desain / Konten</Label>
                    <Input
                        id="judul_desain"
                        placeholder="Contoh: Belajar Bersama Medkom #1"
                        {...register("judul_desain")}
                    />
                    {errors.judul_desain && <p className="text-sm text-destructive">{errors.judul_desain.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label>Platform Publikasi (Semua Mirroring ke WAC & IGS)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-md bg-secondary/20">
                        {PLATFORM_OPTIONS.map((platform) => (
                            <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={platform}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    {...register("platform_publikasi")}
                                />
                                <span className="text-sm">{platform}</span>
                            </label>
                        ))}
                    </div>
                    {errors.platform_publikasi && <p className="text-sm text-destructive">{errors.platform_publikasi.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="tanggal_publikasi">Tanggal Publikasi</Label>
                        <Input
                            id="tanggal_publikasi"
                            type="date"
                            {...register("tanggal_publikasi")}
                        />
                        {errors.tanggal_publikasi && <p className="text-sm text-destructive">{errors.tanggal_publikasi.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="waktu_publikasi">Waktu Publikasi</Label>
                        <SelectNative
                            id="waktu_publikasi"
                            {...register("waktu_publikasi")}
                        >
                            <option value="">Pilih waktu</option>
                            {WAKTU_PUBLIKASI_OPTIONS.map((waktu) => (
                                <option key={waktu} value={waktu}>{waktu}</option>
                            ))}
                        </SelectNative>
                        {errors.waktu_publikasi && <p className="text-sm text-destructive">{errors.waktu_publikasi.message}</p>}
                    </div>
                </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="sudah_baca_sop" className="font-medium text-foreground">
                            Lihat <span className="font-bold text-blue-700 italic underline"><a href="/jadwal" target="_blank">Jadwal Publikasi</a></span>
                        </label>
                        <p className="text-muted-foreground mt-1">
                            Lihat Jadwal Publikasi Sebelum Memilih Jadwal, Pastikan Tidak Ada Jadwal Bentrok dengan Konten Lain.
                        </p>
                        {errors.sudah_baca_sop && <p className="text-sm text-destructive mt-1">{errors.sudah_baca_sop.message}</p>}
                    </div>
            </div>
        </div>
    )
}
