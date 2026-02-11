import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseAnnotationSearchReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    handleClearSearch: () => void;
}

/**
 * Custom hook for managing annotation search functionality
 * Provides search state management, filtering logic, and click-outside behavior
 * 
 * @template T - The type of items being searched
 * @param items - Array of items to search through
 * @param searchFields - Function that extracts searchable fields from an item
 * @param containerRef - Reference to the container element for click-outside detection
 * @returns Search state and handlers
 */
export function useAnnotationSearch<T>(
    items: T[],
    searchFields: (item: T) => string[],
    containerRef: React.RefObject<HTMLDivElement | null>
): UseAnnotationSearchReturn & { filteredItems: T[] } {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;

        const query = searchQuery.toLowerCase();
        const filtered = items.filter(item => {
            const fields = searchFields(item);
            return fields.some(field =>
                field?.toLowerCase().includes(query)
            );
        });

        return filtered;
    }, [items, searchQuery, searchFields]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (containerRef.current?.contains(target)) {
                return;
            }

            const element = target as Element;
            const isPortalClick = element.closest(
                '[role="menu"], ' +
                '[role="dialog"], ' +
                '[data-radix-popper-content-wrapper], ' +
                '[data-radix-portal]'
            );

            if (isPortalClick) {
                return;
            }

            setSearchQuery("");
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
        searchInputRef.current?.focus();
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        searchInputRef,
        handleClearSearch,
        filteredItems,
    };
}

