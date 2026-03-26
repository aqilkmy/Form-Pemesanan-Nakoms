
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
    identitySchema, 
    desainPublikasiSchema, 
    websiteSchema, 
    bantuanTeknisSchema, 
    surveySchema,
    IdentityFormValues,
    DesainPublikasiFormValues,
    WebsiteFormValues,
    BantuanTeknisFormValues,
    SurveyFormValues,
    OrderFormValues
} from "@/lib/schema"
import { MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/constants"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StepIdentity } from "./StepIdentity"
import { MenuSelector } from "./MenuSelector"
import { FormDesainPublikasi } from "./FormDesainPublikasi"
import { FormWebsite } from "./FormWebsite"
import { FormBantuanTeknis } from "./FormBantuanTeknis"
import { FormSurvey } from "./FormSurvey"
import { SuccessMessage } from "./SuccessMessage"
import { ChevronRight, ChevronLeft, Save } from "lucide-react"

type FlowStep = "identity" | "menu" | "detail" | "aset" | "review"

interface SubmittedData {
    menu_type: MenuType
    kementerian: string
    nama: string
    jenis_bantuan?: "podcast" | "take_video" | "live_instagram" | "lainnya"
    platform_publikasi?: string[]
}

export function OrderForm() {
    const [currentStep, setCurrentStep] = React.useState<FlowStep>("identity")
    const [selectedMenu, setSelectedMenu] = React.useState<MenuType | null>(null)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isNavigating, setIsNavigating] = React.useState(false)
    const [submittedData, setSubmittedData] = React.useState<SubmittedData | null>(null)

    // Identity form (used for all menus)
    const identityForm = useForm<IdentityFormValues>({
        resolver: zodResolver(identitySchema),
        mode: "onChange",
        defaultValues: {
            sudah_baca_sop: undefined
        }
    })

    // Menu-specific forms
    const desainForm = useForm<DesainPublikasiFormValues>({
        resolver: zodResolver(desainPublikasiSchema),
        mode: "onChange",
        defaultValues: {
            menu_type: "desain_publikasi",
            platform_publikasi: [],
            sudah_baca_sop: undefined
        }
    })

    const websiteForm = useForm<WebsiteFormValues>({
        resolver: zodResolver(websiteSchema),
        mode: "onChange",
        defaultValues: {
            menu_type: "website",
            sudah_baca_sop: undefined
        }
    })

    const bantuanTeknisForm = useForm<BantuanTeknisFormValues>({
        resolver: zodResolver(bantuanTeknisSchema),
        mode: "onChange",
        defaultValues: {
            menu_type: "bantuan_teknis",
            sudah_baca_sop: undefined
        }
    })

    const surveyForm = useForm<SurveyFormValues>({
        resolver: zodResolver(surveySchema),
        mode: "onChange",
        defaultValues: {
            menu_type: "survey",
            sudah_baca_sop: undefined
        }
    })

    const topRef = React.useRef<HTMLDivElement>(null)

    // Copy identity values to the selected form
    const syncIdentityToForm = React.useCallback(() => {
        const identityValues = identityForm.getValues()
        
        if (selectedMenu === "desain_publikasi") {
            desainForm.setValue("nama", identityValues.nama)
            desainForm.setValue("kementerian", identityValues.kementerian)
            desainForm.setValue("nomor_whatsapp", identityValues.nomor_whatsapp)
            desainForm.setValue("sudah_baca_sop", identityValues.sudah_baca_sop)
        } else if (selectedMenu === "website") {
            websiteForm.setValue("nama", identityValues.nama)
            websiteForm.setValue("kementerian", identityValues.kementerian)
            websiteForm.setValue("nomor_whatsapp", identityValues.nomor_whatsapp)
            websiteForm.setValue("sudah_baca_sop", identityValues.sudah_baca_sop)
        } else if (selectedMenu === "bantuan_teknis") {
            bantuanTeknisForm.setValue("nama", identityValues.nama)
            bantuanTeknisForm.setValue("kementerian", identityValues.kementerian)
            bantuanTeknisForm.setValue("nomor_whatsapp", identityValues.nomor_whatsapp)
            bantuanTeknisForm.setValue("sudah_baca_sop", identityValues.sudah_baca_sop)
        } else if (selectedMenu === "survey") {
            surveyForm.setValue("nama", identityValues.nama)
            surveyForm.setValue("kementerian", identityValues.kementerian)
            surveyForm.setValue("nomor_whatsapp", identityValues.nomor_whatsapp)
            surveyForm.setValue("sudah_baca_sop", identityValues.sudah_baca_sop)
        }
    }, [selectedMenu, identityForm, desainForm, websiteForm, bantuanTeknisForm, surveyForm])

    // Get steps based on selected menu
    const getSteps = (): FlowStep[] => {
        if (!selectedMenu) return ["identity", "menu"]
        
        switch (selectedMenu) {
            case "desain_publikasi":
                return ["identity", "menu", "detail", "aset", "review"]
            case "website":
            case "bantuan_teknis":
            case "survey":
                return ["identity", "menu", "detail", "review"]
            default:
                return ["identity", "menu"]
        }
    }

    const steps = getSteps()
    const currentStepIndex = steps.indexOf(currentStep)
    const totalSteps = steps.length

    const getStepTitle = (): string => {
        switch (currentStep) {
            case "identity": return "Identitas"
            case "menu": return "Pilih Layanan"
            case "detail": return "Detail"
            case "aset": return "Aset"
            case "review": return "Review"
            default: return ""
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault()
        }
    }

    const validateCurrentStep = async (): Promise<boolean> => {
        if (currentStep === "identity") {
            return await identityForm.trigger()
        }
        if (currentStep === "menu") {
            return selectedMenu !== null
        }
        if (currentStep === "detail") {
            switch (selectedMenu) {
                case "desain_publikasi":
                    return await desainForm.trigger(["judul_desain", "platform_publikasi", "tanggal_publikasi", "waktu_publikasi"])
                case "website":
                    return await websiteForm.trigger(["custom_shortlink"])
                case "bantuan_teknis":
                    return await bantuanTeknisForm.trigger(["nama_kegiatan", "tanggal_kegiatan", "waktu_kegiatan", "tempat_kegiatan", "jenis_bantuan"])
                case "survey":
                    return await surveyForm.trigger(["judul_survey", "deskripsi_survey", "target_responden", "deadline_survey", "link_gdrive_brief", "hadiah_survey"])
            }
        }
        if (currentStep === "aset" && selectedMenu === "desain_publikasi") {
            return await desainForm.trigger(["link_file_konten", "link_caption_docs"])
        }
        return true
    }

    const nextStep = async () => {
        if (isNavigating) return

        setIsNavigating(true)
        const isValid = await validateCurrentStep()

        if (isValid) {
            if (currentStep === "identity") {
                setCurrentStep("menu")
            } else if (currentStep === "menu" && selectedMenu) {
                syncIdentityToForm()
                setCurrentStep("detail")
            } else {
                const nextIndex = currentStepIndex + 1
                if (nextIndex < steps.length) {
                    setCurrentStep(steps[nextIndex])
                }
            }
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
        
        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex])
        }
        topRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleMenuSelect = (menu: MenuType) => {
        setSelectedMenu(menu)
    }

    const onSubmit = async () => {
        if (currentStep !== "review" || isNavigating || !selectedMenu) return

        try {
            setIsLoading(true)
            
            let data: OrderFormValues
            let jenisBantuan: "podcast" | "take_video" | "live_instagram" | "lainnya" | undefined

            switch (selectedMenu) {
                case "desain_publikasi":
                    data = desainForm.getValues()
                    break
                case "website":
                    data = websiteForm.getValues()
                    break
                case "bantuan_teknis":
                    data = bantuanTeknisForm.getValues()
                    jenisBantuan = data.jenis_bantuan
                    break
                case "survey":
                    data = surveyForm.getValues()
                    break
                default:
                    throw new Error("Invalid menu type")
            }

            const { error } = await supabase
                .from('orders')
                .insert([data])

            if (error) {
                throw error
            }

            setSubmittedData({
                menu_type: selectedMenu,
                kementerian: data.kementerian,
                nama: data.nama,
                jenis_bantuan: jenisBantuan,
                platform_publikasi: selectedMenu === "desain_publikasi" ? (data as any).platform_publikasi : undefined
            })
            setIsSuccess(true)

            // Reset all forms
            identityForm.reset()
            desainForm.reset()
            websiteForm.reset()
            bantuanTeknisForm.reset()
            surveyForm.reset()

            topRef.current?.scrollIntoView({ behavior: "smooth" })
        } catch (error: any) {
            const errorMsg = error?.message || error?.code || 'Unknown error'
            console.error('Error submitting order:', errorMsg)
            alert(`Terjadi kesalahan: ${errorMsg}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setIsSuccess(false)
        setCurrentStep("identity")
        setSelectedMenu(null)
        setSubmittedData(null)
    }

    if (isSuccess) {
        return <SuccessMessage onReset={handleReset} submittedData={submittedData || undefined} />
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case "identity":
                return <StepIdentity form={identityForm as any} />
            case "menu":
                return <MenuSelector selectedMenu={selectedMenu} onSelectMenu={handleMenuSelect} />
            case "detail":
                switch (selectedMenu) {
                    case "desain_publikasi":
                        return <FormDesainPublikasi form={desainForm} step="detail" />
                    case "website":
                        return <FormWebsite form={websiteForm} step="detail" />
                    case "bantuan_teknis":
                        return <FormBantuanTeknis form={bantuanTeknisForm} step="detail" />
                    case "survey":
                        return <FormSurvey form={surveyForm} step="detail" />
                }
                break
            case "aset":
                if (selectedMenu === "desain_publikasi") {
                    return <FormDesainPublikasi form={desainForm} step="aset" />
                }
                break
            case "review":
                switch (selectedMenu) {
                    case "desain_publikasi":
                        return <FormDesainPublikasi form={desainForm} step="review" />
                    case "website":
                        return <FormWebsite form={websiteForm} step="review" />
                    case "bantuan_teknis":
                        return <FormBantuanTeknis form={bantuanTeknisForm} step="review" />
                    case "survey":
                        return <FormSurvey form={surveyForm} step="review" />
                }
                break
        }
        return null
    }

    const canProceed = currentStep !== "menu" || selectedMenu !== null

    return (
        <div ref={topRef} className="w-full max-w-3xl mx-auto p-4" onKeyDown={handleKeyDown}>
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle>{getStepTitle()}</CardTitle>
                        <span className="text-sm font-medium text-muted-foreground">
                            Langkah {currentStepIndex + 1} dari {totalSteps}
                        </span>
                    </div>
                    <Progress value={((currentStepIndex + 1) / totalSteps) * 100} className="h-2" />
                </CardHeader>

                <CardContent className="pt-6">
                    <form id="order-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                        {renderStepContent()}
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStepIndex === 0 || isLoading || isNavigating}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>

                    {currentStep !== "review" ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={isLoading || isNavigating || !canProceed}
                        >
                            Lanjut
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="order-form"
                            disabled={isLoading || isNavigating}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? "Mengirim..." : "Kirim Pesanan"}
                            <Save className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
