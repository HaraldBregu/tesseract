import AppInput from "@/components/app/app-input"
import { cn } from "@/lib/utils"

interface FilterInputProps {
    className?: string
    title: string
    placeholder: string
    value: string
    onChange: (value: string) => void
}
const FilterInput = ({
    className,
    title,
    placeholder,
    value,
    onChange,
    ...props
}: FilterInputProps) => {

    return (
        <div className={cn(className)} {...props}>
            <label className="text-xs text-muted-foreground">{title}</label>
            <div className="relative">
                <AppInput
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>
        </div>
    )
}

export default FilterInput;