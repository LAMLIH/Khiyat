"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { fr } from "date-fns/locale"
import { useLanguage } from "@/contexts/LanguageContext"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    placeholder?: string
}

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
    const { isRTL } = useLanguage()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-14 w-full justify-start text-left font-medium rounded-xl border-2 bg-background transition-all hover:bg-muted/50",
                        !date && "text-muted-foreground",
                        isRTL && "text-right flex-row-reverse"
                    )}
                >
                    <CalendarIcon className={cn("h-5 w-5 opacity-50", isRTL ? "ml-2" : "mr-2")} />
                    {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder || (isRTL ? "اختر تاريخا" : "Choisir une date")}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                <Calendar
                    dir={isRTL ? "rtl" : "ltr"}
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
