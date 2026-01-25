
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
    currentStep: number
    totalSteps: number
    className?: string
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
    const percentage = Math.round((currentStep / totalSteps) * 100)

    return (
        <div className={cn("w-full bg-secondary h-2.5 rounded-full overflow-hidden", className)}>
            <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    )
}
