import { cn } from "@/lib/utils";
import { memo } from "react";

type ContentLayoutProps = {
    className?: string;
    children: React.ReactNode;
    onBlur?: () => void;
}

export const ContentLayout = memo(({
    className,
    children,
    ...props
}: ContentLayoutProps) => {
    return (
        <div className={cn(className)} {...props}>
            <div className="h-full overflow-auto bg-white dark:bg-grey-10">
                <div className="flex flex-col h-full">
                    {children}
                </div>
            </div>
        </div>
    )
})
