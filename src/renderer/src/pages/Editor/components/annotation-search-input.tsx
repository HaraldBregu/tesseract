import { memo, forwardRef } from "react";
import { Input } from "../../../components/ui/input";
import IconClose from "@/components/app/icons/IconClose";

interface AnnotationSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder: string;
}

/**
 * Reusable search input component for annotations (comments/bookmarks)
 * Features:
 * - Real-time search with clear button
 * - Accessible with proper ARIA labels
 * - Consistent styling across the application
 */
const AnnotationSearchInput = forwardRef<HTMLInputElement, AnnotationSearchInputProps>(
    ({ value, onChange, onClear, placeholder }, ref) => {
        return (
            <div className="px-2 pb-2">
                <div className="relative">
                    <Input
                        ref={ref}
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-8 text-sm pr-8"
                    />
                    {value && (
                        <button
                            onClick={onClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-grey-80 dark:hover:bg-grey-30 rounded p-0.5 transition-colors flex items-center justify-center"
                            aria-label="Clear search"
                            type="button"
                        >
                            <IconClose className="w-4 h-4 text-grey-50 dark:text-grey-70" />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

AnnotationSearchInput.displayName = 'AnnotationSearchInput';

export default memo(AnnotationSearchInput);

