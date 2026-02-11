import ReorderGroup from "@/components/reorder-group"
import { useWhyDidYouUpdate } from "@/hooks/use-why-did-you-update"
import { memo } from "react"

type ApparatusesReorderGroupProps = {
    apparatuses: Apparatus[],
    children: React.ReactNode,
    className?: string,
    onReorder: (newTabs: Apparatus[]) => void,
}

const ApparatusesReorderGroup = (props: ApparatusesReorderGroupProps) => {
    const {
        apparatuses,
        children,
        className,
        onReorder,
    } = props;
    useWhyDidYouUpdate("ApparatusesReorderGroup", props)
    return (
        <ReorderGroup
            items={apparatuses}
            className={className}
            onReorder={onReorder}>
            {children}
        </ReorderGroup>
    )
}

export default memo(ApparatusesReorderGroup)
