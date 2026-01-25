
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface StepProps {
    form: UseFormReturn<OrderFormValues>
}

export function StepAdditional({ form }: StepProps) {
    const { register } = form

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Request Tambahan (Opsional)</h2>

                <div className="grid gap-2">
                    <Label htmlFor="request_lagu">Request Lagu (Spotify Link/Judul - Penyanyi)</Label>
                    <Input
                        id="request_lagu"
                        placeholder="Opsional"
                        {...register("request_lagu")}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="custom_shortlink">Request Custom Shortlink</Label>
                    <Input
                        id="custom_shortlink"
                        placeholder="Opsional: s.id/namakegiatan"
                        {...register("custom_shortlink")}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fitur_tambahan_web">Fitur Tambahan Web / Lainnya</Label>
                    <Textarea
                        id="fitur_tambahan_web"
                        placeholder="Catatan tambahan untuk tim kami..."
                        className="min-h-[100px]"
                        {...register("fitur_tambahan_web")}
                    />
                </div>
            </div>
        </div>
    )
}
