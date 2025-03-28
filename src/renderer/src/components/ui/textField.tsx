import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactNode, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import Invisible from "@/assets/reactIcons/Invisible"
import Visible from "@/assets/reactIcons/Visible"
import Calendar from "@/assets/reactIcons/Calendar"

interface TextFieldProps {
    id: string
    label?: string
    type?: "text" | "email" | "number" | "date" | "password"
    placeholder?: string
    helperText?: string
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    error?: boolean
    errorMessage?: string
    className?: string
    required?: boolean
    disabled?: boolean
    value?: string | number
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    dateFormat?: "dd-mm-yyyy" | "mm-dd-yyyy" | "yyyy-mm-dd"
    dateValueFormat?: "dd-mm-yyyy" | "mm-dd-yyyy" | "yyyy-mm-dd"
}

export default function TextField({
    id,
    label,
    type = "text",
    placeholder,
    helperText,
    leftIcon,
    rightIcon,
    error = false,
    errorMessage,
    className,
    required = false,
    disabled = false,
    value,
    onChange,
    dateFormat = "dd-mm-yyyy",
    dateValueFormat = "yyyy-mm-dd",
    ...props
}: TextFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [internalDateValue, setInternalDateValue] = useState<string>("");

    const inputType = type === "password" && showPassword ? "text" : type;

    useEffect(() => {
        if (type === "date" && value) {

            setInternalDateValue(formatToISODate(value.toString()));
        }
    }, [type, value]);

    const formatDateDisplay = (dateString: string | number | undefined): string => {
        if (!dateString) return "";

        try {
            return formatDateToCustomFormat(dateString, dateFormat);
        } catch (error) {
            return "";
        }
    };

    const formatDateToCustomFormat = (dateString: string | number | undefined, format: string): string => {
        if (!dateString) return "";


        let dateObj;

        if (typeof dateString === 'string') {

            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                const [year, month, day] = dateString.split('-');
                dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                const [day, month, year] = dateString.split('-');
                dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                const [month, day, year] = dateString.split('-');
                dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            else {
                dateObj = new Date(dateString);
            }
        } else {
            dateObj = new Date(dateString.toString());
        }

        if (isNaN(dateObj.getTime())) return "";

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        switch (format) {
            case "dd-mm-yyyy":
                return `${day}-${month}-${year}`;
            case "mm-dd-yyyy":
                return `${month}-${day}-${year}`;
            case "yyyy-mm-dd":
                return `${year}-${month}-${day}`;
            default:
                return `${day}-${month}-${year}`;
        }
    }


    const formatToISODate = (dateString: string | number | undefined): string => {
        if (!dateString) return "";


        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }


        if (typeof dateString === 'string') {

            if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                const [day, month, year] = dateString.split('-');
                return `${year}-${month}-${day}`;
            }


            if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                const [month, day, year] = dateString.split('-');
                return `${year}-${month}-${day}`;
            }
        }


        try {
            const date = new Date(dateString.toString());
            if (isNaN(date.getTime())) return "";


            return date.toISOString().split('T')[0];
        } catch (error) {
            return "";
        }
    }


    const formatDateForValue = (isoDate: string): string => {
        if (!isoDate) return "";

        try {
            return formatDateToCustomFormat(isoDate, dateValueFormat);
        } catch (error) {
            return isoDate;
        }
    }

    const handleDateIconClick = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            const isoDate = e.target.value;
            setInternalDateValue(isoDate);

            const formattedValue = formatDateForValue(isoDate);
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    id: id,
                    name: id,
                    value: formattedValue
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        inputValue = inputValue.replace(/,/g, '.');

        const numericRegex = /^-?\d*\.?\d*$/;
        const isValidInput = inputValue === '' || numericRegex.test(inputValue);

        if (isValidInput) {
            const validValue = inputValue === '-' || inputValue === '' ? inputValue : inputValue;

            if (onChange) {
                const syntheticEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        id: id,
                        name: id,
                        value: validValue
                    }
                } as React.ChangeEvent<HTMLInputElement>;

                onChange(syntheticEvent);
            }
        } else {
            if (inputRef.current && value !== undefined) {
                inputRef.current.value = value.toString();
            }
        }
    }

    const PasswordToggleIcon = type === "password" ? (
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center"
            tabIndex={-1}
        >
            {showPassword ? (
                <Invisible size={'small'} className="text-muted-foreground" />
            ) : (
                <Visible size={'small'} className="text-muted-foreground" />
            )}
        </button>
    ) : null;

    const DateIcon = type === "date" ? (
        <button
            type="button"
            onClick={handleDateIconClick}
            className="flex items-center justify-center"
            tabIndex={-1}
            aria-label="Apri selettore data"
        >
            <Calendar size={'small'} className="text-muted-foreground" />
        </button>
    ) : null;

    const displayRightIcon = (): ReactNode => {
        if (type === "password") return PasswordToggleIcon;
        if (type === "date") return DateIcon;
        return rightIcon;
    };

    return (
        <div className={cn("grid w-full items-center gap-1.5", className)}>
            {label && (
                <Label htmlFor={id} className={cn(error && "text-destructive")}>
                    {label} {required && <span className="text-destructive">*</span>}
                </Label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {leftIcon}
                    </div>
                )}
                <Input
                    ref={inputRef}
                    type={type === "date" ? "text" : inputType}
                    id={id}
                    placeholder={placeholder}
                    className={cn(
                        leftIcon && "pl-10",
                        (rightIcon || type === "password" || type === "date") && "pr-10",
                        error && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={disabled}

                    value={type === "date" ? formatDateDisplay(value) : value}
                    onChange={type === "date" ? undefined : (type === "number" ? handleNumberChange : onChange)}
                    onFocus={() => {
                        if (type === "date" && dateInputRef.current) {
                            handleDateIconClick();
                        }
                    }}
                    readOnly={type === "date"}
                    {...props}
                />
                {type === "date" && (
                    <input
                        ref={dateInputRef}
                        type="date"
                        className="sr-only"
                        onChange={handleDateChange}
                        tabIndex={-1}
                        aria-hidden="true"
                        value={internalDateValue}
                    />
                )}

                {(rightIcon || type === "password" || type === "date") && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {displayRightIcon()}
                    </div>
                )}
            </div>

            {(helperText || errorMessage) && (
                <p className={cn(
                    "text-sm",
                    error ? "text-destructive" : "text-muted-foreground"
                )}>
                    {error ? errorMessage : helperText}
                </p>
            )}
        </div>
    )
}