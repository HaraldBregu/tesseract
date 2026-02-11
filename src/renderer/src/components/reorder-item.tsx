import cn from "@/utils/classNames";
import { PanInfo, Reorder, useDragControls } from "framer-motion";

type ReorderItemProps<T> = {
    id: string,
    item: T,
    children: React.ReactNode | ((dragControls: any) => React.ReactNode),
    className?: string,
    drag: "y" | "x" | undefined | boolean,
    onDragEnd?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
}

const ReorderItem = <T,>({
    id,
    item,
    children,
    className,
    drag,
    onDragEnd,
}: ReorderItemProps<T>) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            id={id}
            value={item}
            initial={{
                opacity: 1,
                x: 0
            }}
            animate={{
                opacity: 1,
                x: 0,
                transition: {
                    duration: 0.1,
                    ease: 'easeInOut'
                }
            }}
            exit={{
                opacity: 0,
                x: 20,
                transition: {
                    duration: 0.15
                }
            }}
            whileDrag={{
                transition: {
                    ease: 'easeInOut'
                }
            }}
            drag={drag}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={onDragEnd}
            className={cn("bg-grey-95 dark:bg-grey-20", className)}>
            {typeof children === 'function' ? children(dragControls) : children}
        </Reorder.Item>
    )
}

export default ReorderItem