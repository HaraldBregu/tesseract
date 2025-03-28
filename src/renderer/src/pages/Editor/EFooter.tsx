import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const EFooter = () => {
    return (
        <>
            <div className="flex items-center gap-4 text-xs text-muted-foreground float-left font-medium">
                <span>Page 1 of 2</span>
                <span>234 words</span>
                <span>Modified 2h ago</span>
                <span>Auto-saved</span>
            </div>
            <div className="flex items-center gap-4 ml-auto float-right">
                <div className="flex items-center gap-2">
                    <Select defaultValue="100">
                        <SelectTrigger className="h-6 w-auto">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="100">100%</SelectItem>
                            <SelectItem value="125">125%</SelectItem>
                            <SelectItem value="150">150%</SelectItem>
                            <SelectItem value="200">200%</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>

    )
}