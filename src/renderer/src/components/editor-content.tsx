export const EditorContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-[calc(100vh-5.5rem)]">
            <div className="h-full overflow-auto">
                {children}
            </div>
        </div>
    )
}   