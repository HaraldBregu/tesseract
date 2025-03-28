export const EditorFooter = ({ children }: { children: React.ReactNode }) => {
    return (
        <footer className="sticky bottom-0 z-50 flex h-8 shrink-0 items-center gap-2 border-t bg-background px-3">
            <div className="flex items-center w-full">
                {children}
            </div>
        </footer>
    )
}
