import { createContext, forwardRef, memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    AppDialog,
    AppDialogContent,
    AppDialogHeader,
    AppDialogFooter,
    AppDialogTitle,
    AppDialogDescription,
} from "./app-dialog";
import { cn } from "@/lib/utils";

interface DragPosition {
    x: number;
    y: number;
}

interface DragContextValue {
    startDrag: (clientX: number, clientY: number) => void;
}

const DragContext = createContext<DragContextValue | null>(null);

interface DraggableDialogContentProps extends React.ComponentPropsWithoutRef<typeof AppDialogContent> {
    onPositionChange?: (position: DragPosition) => void;
    initialPosition?: DragPosition;
}

const AppDraggableDialogContent = memo(
    forwardRef<HTMLDivElement, DraggableDialogContentProps>(
        ({ className, children, onPositionChange, initialPosition, ...props }, ref) => {
            const [position, setPosition] = useState<DragPosition>(
                initialPosition || { x: 0, y: 0 }
            );
            const isDraggingRef = useRef(false);
            const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
            const positionRef = useRef<DragPosition>(position);
            const dialogRef = useRef<HTMLDivElement>(null);

            // Keep position ref in sync
            useEffect(() => {
                positionRef.current = position;
            }, [position]);

            const constrainPosition = useCallback((newX: number, newY: number): DragPosition => {
                if (!dialogRef.current) return { x: newX, y: newY };

                const dialog = dialogRef.current;
                const rect = dialog.getBoundingClientRect();
                
                // Get window dimensions
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // Calculate the dialog's center position (where it would be without offset)
                const centerX = windowWidth / 2;
                const centerY = windowHeight / 2;
                
                // Calculate the actual position with offset
                const dialogWidth = rect.width;
                const dialogHeight = rect.height;
                
                // Calculate bounds (keeping at least some part of dialog visible)
                const minX = -(centerX - dialogWidth / 2);
                const maxX = centerX - dialogWidth / 2;
                const minY = -(centerY - dialogHeight / 2);
                const maxY = centerY - dialogHeight / 2;
                
                // Constrain the position
                const constrainedX = Math.max(minX, Math.min(maxX, newX));
                const constrainedY = Math.max(minY, Math.min(maxY, newY));
                
                return { x: constrainedX, y: constrainedY };
            }, []);

            const handleMouseMove = useCallback((e: MouseEvent) => {
                if (!isDraggingRef.current) return;

                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;

                const tentativePosition = {
                    x: positionRef.current.x + deltaX,
                    y: positionRef.current.y + deltaY,
                };

                const newPosition = constrainPosition(tentativePosition.x, tentativePosition.y);

                setPosition(newPosition);
                dragStartRef.current = { x: e.clientX, y: e.clientY };

                if (onPositionChange) {
                    onPositionChange(newPosition);
                }
            }, [onPositionChange, constrainPosition]);

            const handleMouseUp = useCallback(() => {
                isDraggingRef.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }, []);

            useEffect(() => {
                const handleMove = (e: MouseEvent) => handleMouseMove(e);
                const handleUp = () => handleMouseUp();

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);

                return () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                };
            }, [handleMouseMove, handleMouseUp]);

            const startDrag = useCallback((clientX: number, clientY: number) => {
                isDraggingRef.current = true;
                dragStartRef.current = { x: clientX, y: clientY };
                document.body.style.cursor = 'move';
                document.body.style.userSelect = 'none';
            }, []);

            const dragContextValue: DragContextValue = {
                startDrag
            };

            return (
                <DragContext.Provider value={dragContextValue}>
                    <AppDialogContent
                        ref={(node) => {
                            dialogRef.current = node;
                            if (typeof ref === 'function') {
                                ref(node);
                            } else if (ref) {
                                ref.current = node;
                            }
                        }}
                        className={cn(
                            "transition-none",
                            className
                        )}
                        style={{
                            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                        }}
                        {...props}
                    >
                        {children}
                    </AppDialogContent>
                </DragContext.Provider>
            );
        }
    )
);
AppDraggableDialogContent.displayName = "AppDraggableDialogContent";

interface DraggableDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    onDragStart?: () => void;
}

const AppDraggableDialogHeader = memo(
    ({ className, children, onDragStart, ...props }: DraggableDialogHeaderProps) => {
        const dragContext = useContext(DragContext);

        const handleMouseDown = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!dragContext) return;

                e.preventDefault();
                dragContext.startDrag(e.clientX, e.clientY);

                if (onDragStart) {
                    onDragStart();
                }
            },
            [dragContext, onDragStart]
        );

        return (
            <AppDialogHeader
                className={cn("cursor-move select-none", className)}
                onMouseDown={handleMouseDown}
                {...props}
            >
                {children}
            </AppDialogHeader>
        );
    }
);
AppDraggableDialogHeader.displayName = "AppDraggableDialogHeader";

const AppDraggableDialog = memo(AppDialog);
const AppDraggableDialogFooter = memo(AppDialogFooter);
const AppDraggableDialogTitle = memo(AppDialogTitle);
const AppDraggableDialogDescription = memo(AppDialogDescription);

export {
    AppDraggableDialog,
    AppDraggableDialogContent,
    AppDraggableDialogHeader,
    AppDraggableDialogFooter,
    AppDraggableDialogTitle,
    AppDraggableDialogDescription,
};

