import ReorderItem from "@/components/reorder-item";
import { useWhyDidYouUpdate } from "@/hooks/use-why-did-you-update";
import { cn } from "@/lib/utils";
import { PanInfo } from "framer-motion";
import { memo, useMemo } from "react";


type ApparatusesReorderItemProps = {
    item: Apparatus,
    visibleApparatuses: Apparatus[],
    expandedApparatuses: Apparatus[],
    drag: "y" | "x" | undefined | boolean,
    children: React.ReactNode | ((dragControls: any) => React.ReactNode),
    onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void,
}

const ApparatusesReorderItem = (props: ApparatusesReorderItemProps) => {
    const {
        item,
        visibleApparatuses,
        expandedApparatuses,
        drag,
        children,
        onDragEnd,
    } = props;
    const className = useMemo(() => cn(
        item !== visibleApparatuses[0] && 'border-t border-grey-70 dark:border-grey-40',
        !expandedApparatuses.includes(item) &&
        item === visibleApparatuses[visibleApparatuses.length - 1] &&
        expandedApparatuses.length === 0 &&
        'border-b border-grey-70 dark:border-grey-40',
        'relative flex items-center overflow-hidden select-none',
        "w-full",
        expandedApparatuses.includes(item) ? "flex-1 bg-white dark:bg-grey-10" : "flex-none"
    ), [item, visibleApparatuses, expandedApparatuses]);
    useWhyDidYouUpdate("ApparatusesReorderItem", props)
    return (
        <ReorderItem
            id={item.id}
            item={item}
            drag={drag}
            onDragEnd={onDragEnd}
            className={className}>
            {(dragControls) => (
                <>
                    {typeof children === 'function' ? children(dragControls) : children}
                </>
            )}
        </ReorderItem>
    );
};

export default memo(ApparatusesReorderItem)