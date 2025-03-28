export const EditorHeader = ({ children }: { children: React.ReactNode }) => {
    return (
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center gap-2 px-3">
                {children}
            </div>
        </header>
    )
}