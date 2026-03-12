"use client"

import { MENU_OPTIONS, MenuType } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface MenuSelectorProps {
    selectedMenu: MenuType | null
    onSelectMenu: (menu: MenuType) => void
}

export function MenuSelector({ selectedMenu, onSelectMenu }: MenuSelectorProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Pilih Layanan</h2>
                <p className="text-muted-foreground text-sm">
                    Silakan pilih jenis layanan yang Anda butuhkan
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MENU_OPTIONS.map((menu) => (
                    <button
                        key={menu.id}
                        type="button"
                        onClick={() => onSelectMenu(menu.id)}
                        className={cn(
                            "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200",
                            "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                            selectedMenu === menu.id
                                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                                : "border-gray-200 bg-white"
                        )}
                    >
                        <span className="text-4xl mb-3">{menu.icon}</span>
                        <h3 className="font-semibold text-foreground mb-1">{menu.label}</h3>
                        <p className="text-sm text-muted-foreground">{menu.description}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
