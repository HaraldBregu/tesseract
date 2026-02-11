import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import IconSearch from "./icons/IconSearch";
import { Input } from "../ui/input";
import AppLabel from "./app-label";
import AppButton from "./app-button";
import IconCloseCircle from "./icons/IconCloseCircle";

interface SearchBarProps {
    search: string;
    handleInputChange: (search: string) => void;
    total: number;
    filtered: number;
}

const SearchBar = ({
    filtered,
    handleInputChange,
    search,
    total
}: SearchBarProps) => {

    const { t } = useTranslation();

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value), []);

    const handleCloseButton = useCallback(() => handleInputChange(""), []);

    return (
        <div className="relative gap-2 flex items-center border border-secondary-85 dark:border-zinc-700 rounded-md px-2 py-1 w-full bg-white dark:bg-zinc-900 text-grey-40 dark:text-white focus-within:border-primary shadow-none">
            {/* Search Icon */}
            <IconSearch width="20" height="20" />

            {/* Input Field */}
            <Input
                type="text"
                placeholder={t('bibliography.references.search')}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6 flex-1 bg-transparent text-sm leading-[18px] font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={search}
                onChange={handleInput}
            />

            {search && (
                <>
                    {/* Pagination Text */}
                    <AppLabel className="text-sm leading-[18px] font-normal text-grey-10 dark:text-secondary-foreground">{filtered}/{total}</AppLabel>
                    {/* Clear Button */}
                    <AppButton onClick={handleCloseButton} variant="toolbar" size="icon" className="p-0 !text-grey-40">
                        <IconCloseCircle />
                    </AppButton>
                </>
            )}
        </div>
    )
};

export default memo(SearchBar);