import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { Search } from "lucide-react";
import { memo, useCallback, ChangeEvent } from "react";

interface SearchInputSectionProps {
    title: string;
    placeholder: string;
    onSearchChange: (query: string) => void;
    searchQuery: string;
    disabled: boolean;
}
const SearchInputSection = memo(({
    title,
    placeholder,
    onSearchChange,
    searchQuery,
    disabled,
}: SearchInputSectionProps) => {

    const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value);
    }, [onSearchChange]);

    return (
        <div className="space-y-2">
            <AppLabel htmlFor="search-collaborators" className="text-sm">
                {title}
            </AppLabel>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <AppInput
                        id="search-collaborators"
                        type="text"
                        placeholder={placeholder}
                        onChange={handleSearchChange}
                        value={searchQuery}
                        className="pl-10"
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
});

export default SearchInputSection