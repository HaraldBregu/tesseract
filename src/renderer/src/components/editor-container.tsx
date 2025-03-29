import { SidebarInset } from "./ui/sidebar"

export const EditorContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full w-full flex flex-col scrollbar-hide">
            {children}
        </div>
    )
}

export const EditorSidebarInsetContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarInset>
            <div className="h-full w-full flex flex-col scrollbar-hide">
                {children}
            </div>
        </SidebarInset>
    )
}