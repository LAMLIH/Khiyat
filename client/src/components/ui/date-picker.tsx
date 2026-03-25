"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { fr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useLanguage } from "@/contexts/LanguageContext"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    placeholder?: string
}

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
    const { isRTL } = useLanguage()
    const [isMobile, setIsMobile] = React.useState(
        () => typeof window !== "undefined" ? window.innerWidth < 768 : false
    )

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // ── Mobile: native date input ──
    if (isMobile) {
        return (
            <div className="relative w-full">
                <input
                    type="date"
                    className={cn(
                        "h-14 w-full rounded-xl border-2 bg-background font-medium transition-all focus:border-primary outline-none",
                        isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left",
                        !date && "text-muted-foreground"
                    )}
                    value={date ? format(date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                        const val = e.target.value
                        setDate(val ? new Date(val + "T12:00:00") : undefined)
                    }}
                />
                <CalendarIcon className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 pointer-events-none z-10",
                    isRTL ? "right-4" : "left-4"
                )} />
            </div>
        )
    }

    // ── Desktop: Popover with Calendar grid ──
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 w-full justify-start text-left font-medium rounded-xl border-2 bg-background transition-all hover:bg-muted/50",
                        !date && "text-muted-foreground",
                        isRTL && "text-right flex-row-reverse"
                    )}
                >
                    <CalendarIcon className={cn("h-5 w-5 opacity-50", isRTL ? "ml-2" : "mr-2")} />
                    {date
                        ? format(date, "PPP", { locale: fr })
                        : <span>{placeholder || (isRTL ? "اختر تاريخا" : "Choisir une date")}</span>
                    }
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={fr as any}
                />
            </PopoverContent>
        </Popover>
    )
}
