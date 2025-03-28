export const EditorContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full w-full flex flex-col scrollbar-hide">
           {children}
        </div>
    )
}
