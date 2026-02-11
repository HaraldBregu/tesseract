import { useCallback, useMemo, useState } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import AppButton from "@/components/app/app-button"
import { ChevronDown } from "lucide-react"
import { FIND_WHOLE_DOC } from "@/utils/constants"
import cn from "@/utils/classNames"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


interface MultiSelectDropdownProps {
    selected: string[]
    toggleValue: (value: string[]) => void
    options: {
        label: string;
        value: string;
    }[],
    placeholder?: string
}

export default function MultiSelectDropdown({ selected, toggleValue, options, placeholder }: MultiSelectDropdownProps) {
    const [open, setOpen] = useState(false)

    const selectedLabel = useMemo(() => {
        return options.filter((opt) => selected.includes(opt.value)).map((opt) => opt.label).join(", ") || placeholder;
    }, [selected, options, placeholder]);

    const handleSelect = useCallback((value: string) =>
        () => {
            if (value === FIND_WHOLE_DOC && !selected.includes(FIND_WHOLE_DOC)) {
                toggleValue([value]);
            } else if (selected.includes(value)) {
                toggleValue(selected.filter((v) => v !== value));
            } else {
                toggleValue([...selected, value]);
            }
        },
        [selected, toggleValue]
    );

    return (
        <TooltipProvider>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="w-full">
                    <Tooltip>
                        <TooltipTrigger
                            asChild
                            className={cn(
                                "leading-none rounded-sm",
                                "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-50 dark:[&>svg]:hover:!bg-transparent",
                                "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-grey-50",
                            )}>
                            <AppButton asChild variant="transparent" onClick={() => setOpen(!open)}>
                                <div className="max-h-8 border w-full justify-between">
                                    <span className={cn('truncate max-w-full', selected.length === 0 ? "opacity-60" : "")}>{selectedLabel}</span>
                                    <ChevronDown />
                                </div>
                            </AppButton>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md whitespace-normal break-words text-wrap text-sm">
                            {selectedLabel}
                        </TooltipContent>
                    </Tooltip>
                </PopoverTrigger>
                <PopoverContent className="p-2 space-y-1 overflow-y-auto max-h-[70vh] max-w-[237px]">
                    {options.map((opt) => (
                        <Checkbox
                            key={opt.value}
                            checked={selected.includes(opt.value)}
                            disabled={selected.includes(FIND_WHOLE_DOC) && opt.value !== FIND_WHOLE_DOC}
                            onCheckedChange={handleSelect(opt.value)}
                            className="w-6 h-6 border-secondary"
                            label={opt.label}
                            labelClassName="text-[13px] leading-[15px] truncate dark:text-grey-90"
                        />
                    ))}
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    )
}
