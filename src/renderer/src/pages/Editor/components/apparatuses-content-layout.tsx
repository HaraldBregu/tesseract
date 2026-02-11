import { useWhyDidYouUpdate } from "@/hooks/use-why-did-you-update";
import { motion } from "framer-motion";
import { memo } from "react";

export const ApparatusesLayout = memo(({ className, children }: { className?: string, children: React.ReactNode }) => {
    useWhyDidYouUpdate('ApparatusesLayout', {className});
    return (
        <div className={className}>
            <div className="h-full overflow-auto bg-white dark:bg-grey-10">
                <div className="flex flex-col h-full">
                    {children}
                </div>
            </div>
        </div>
    )
})

export const ApparatusContainer = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div className='flex flex-col w-full h-full'>
            {children}
        </motion.div>
    )
})
