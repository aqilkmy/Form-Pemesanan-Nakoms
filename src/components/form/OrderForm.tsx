
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderFormSchema, OrderFormValues } from "@/lib/schema"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StepIdentity } from "./StepIdentity"
import { StepDetails } from "./StepDetails"
import { StepAssets } from "./StepAssets"
import { StepAdditional } from "./StepAdditional"
import { StepReview } from "./StepReview"
import { SuccessMessage } from "./SuccessMessage"
import { ChevronRight, ChevronLeft, Save } from "lucide-react"

const STEPS = [
    {
        id: 1,
        title: "Identitas",
        component: StepIdentity,
        fields: ["nama", "kementerian", "nomor_whatsapp", "sudah_baca_sop"] as const
    },
    {
        id: 2,
        title: "Detail",
        component: StepDetails,
        fields: ["judul_desain", "platform_publikasi", "tanggal_publikasi", "waktu_publikasi"] as const
    },
    {
        id: 3,
        title: "Aset",
        component: StepAssets,
        fields: ["link_thumbnail", "link_file_konten", "link_caption_docs"] as const
    },
    {
        id: 4,
        title: "Tambahan",
        component: StepAdditional,
        fields: ["request_lagu", "custom_shortlink", "fitur_tambahan_web"] as const
    },
    {
        id: 5,
        title: "Review",
        component: StepReview,
        fields: [] as const // No fields to validate for review step itself
    },
]

export function OrderForm() {
    const [currentStep, setCurrentStep] = React.useState(1)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isNavigating, setIsNavigating] = React.useState(false) // Prevent rapid clicks

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        mode: "onChange",
        defaultValues: {
            platform_publikasi: [],
            sudah_baca_sop: undefined
        }
    })

    const topRef = React.useRef<HTMLDivElement>(null)

    // Prevent Enter key from submitting form unintentionally
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
        }
    };

    const nextStep = async () => {
        if (isNavigating) return

        setIsNavigating(true)
        const fields = STEPS[currentStep - 1].fields
        const isValid = fields.length > 0 ? await form.trigger(fields as any) : true

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
            // Scroll to top and release lock after animation
            setTimeout(() => {
                topRef.current?.scrollIntoView({ behavior: "smooth" })
                setTimeout(() => setIsNavigating(false), 500)
            }, 100)
        } else {
            setIsNavigating(false)
        }
    }

    const prevStep = () => {
        if (isNavigating) return
        setCurrentStep((prev) => Math.max(prev - 1, 1))
        topRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const onSubmit = async (data: OrderFormValues) => {
        // Extra guard: Cannot submit if previously navigating or not on last step
        if (currentStep !== STEPS.length || isNavigating) return

        try {
            setIsLoading(true)
            const { error } = await supabase
                .from('orders')
                .insert([data])

            if (error) {
                throw error
            }

            setIsSuccess(true)
            form.reset()
            topRef.current?.scrollIntoView({ behavior: "smooth" })
        } catch (error) {
            console.error('Error submitting order:', error)
            alert('Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return <SuccessMessage onReset={() => {
            setIsSuccess(false)
            setCurrentStep(1)
        }} />
    }

    const CurrentStepComponent = STEPS[currentStep - 1].component

    return (
        <div ref={topRef} className="w-full max-w-3xl mx-auto p-4" onKeyDown={handleKeyDown}>
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                        <span className="text-sm font-medium text-muted-foreground">
                            Langkah {currentStep} dari {STEPS.length}
                        </span>
                    </div>
                    <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
                </CardHeader>

                <CardContent className="pt-6">
                    <form id="order-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <CurrentStepComponent form={form} />
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isLoading || isNavigating}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={isLoading || isNavigating}
                        >
                            Lanjut
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="order-form"
                            disabled={isLoading || isNavigating}
                            isLoading={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Kirim Pesanan
                            <Save className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
