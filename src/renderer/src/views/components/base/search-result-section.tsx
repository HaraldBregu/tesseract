import { Loader2 } from "lucide-react";


interface SearchResultsSectionLayoutProps {
    visible: boolean
    title: string
    loading: boolean
    empty: boolean
    emptyText: string
    children: React.ReactNode,
}
const SearchResultsSection = ({
    visible,
    title,
    loading,
    empty,
    emptyText,
    children,
}: SearchResultsSectionLayoutProps) => {
    if (!visible)
        return null

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">
                {title}
            </p>
            {loading ? <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div> : null}
            {empty && !loading ? <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">{emptyText}</p>
            </div> : null}
            {!empty && !loading ? <div className="space-y-3 max-h-64 overflow-y-auto border border-grey-80 dark:border-grey-30 rounded-md">
                {children}
            </div> : null}
        </div>
    );
}

export default SearchResultsSection;
