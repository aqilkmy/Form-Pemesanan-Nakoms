
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "@/lib/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface StepProps {
    form: UseFormReturn<OrderFormValues>
}

export function StepAssets({ form }: StepProps) {
    const { register, formState: { errors } } = form

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Aset & Referensi</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Penting:</p>
                        <p>Pastikan link Google Drive yang Anda lampirkan <strong>sudah dibuka aksesnya (Anyone with the link can view)</strong> agar tim kami dapat mengakses file Anda.</p>
                        <p className="mt-1">Isi <strong>"-"</strong> jika tidak ada file yang perlu dilampirkan.</p>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="link_thumbnail">Link Thumbnail (G-Drive/Docs)</Label>
                    <Input
                        id="link_thumbnail"
                        placeholder="https://drive.google.com/... atau isi '-' jika tidak ada"
                        {...register("link_thumbnail")}
                    />
                    {errors.link_thumbnail && <p className="text-sm text-destructive">{errors.link_thumbnail.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="link_file_konten">Link File Konten (G-Drive/Docs)</Label>
                    <Input
                        id="link_file_konten"
                        placeholder="https://drive.google.com/... atau isi '-' jika tidak ada"
                        {...register("link_file_konten")}
                    />
                    {errors.link_file_konten && <p className="text-sm text-destructive">{errors.link_file_konten.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="link_caption_docs">Link Caption (G-Docs)</Label>
                    <Input
                        id="link_caption_docs"
                        placeholder="https://docs.google.com/... atau isi '-' jika tidak ada"
                        {...register("link_caption_docs")}
                    />
                    {errors.link_caption_docs && <p className="text-sm text-destructive">{errors.link_caption_docs.message}</p>}
                </div>
            </div>
        </div>
    )
}
