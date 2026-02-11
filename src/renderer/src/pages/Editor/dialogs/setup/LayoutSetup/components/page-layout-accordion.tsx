import DragIndicator from "@/components/icons/DragIndicator"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Typogaphy from "@components/Typography"
import { ReactNode } from "react"

export interface PageLayoutAccordionProps {
    title: string
    children: ReactNode
    v: string
    accordionDisabled?: boolean
    dragHandler: (ReactNode) => ReactNode
}

const PageLayoutAccordion = ({ title, children, v, accordionDisabled, dragHandler }: PageLayoutAccordionProps) => {
    const accordionTriggerClass = "flex flex-row justify-between w-full px-2 py-0 bg-white dark:bg-grey-10  hover:no-underline";

    return (
        <AccordionItem value={v}>
            <AccordionTrigger disabled={accordionDisabled} className={accordionTriggerClass}>
                {dragHandler(<DragIndicator className="h-[14px] cursor-move " />)}
                <Typogaphy component="div" className="dark:text-grey-90">
                    {title}
                </Typogaphy>
            </AccordionTrigger>

            <AccordionContent className="p-0">
                {children}
            </AccordionContent>
        </AccordionItem>
    )
}

export default PageLayoutAccordion