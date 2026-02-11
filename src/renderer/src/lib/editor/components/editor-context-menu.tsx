import { useFloating, offset, flip, shift } from '@floating-ui/react-dom';
import { Editor } from '@tiptap/core';
import { ReactNode, useLayoutEffect, useState, useEffect, useImperativeHandle, useRef } from 'react';
import AppSeparator from '@/components/app/app-separator';
import AppButton from '@/components/app/app-button';

export interface EditorContextMenuElement {
    show: (x: number, y: number) => void;
    hide: () => void;
    toggle: (x: number, y: number) => void;
}

interface EditorContextMenuProps {
    editor: Editor;
    children: ReactNode;
    className?: string;
    ref?: React.Ref<EditorContextMenuElement>;
    onVisibilityChange?: (isVisible: boolean) => void;
}

export function EditorContextMenu({
    editor,
    children,
    className = '',
    ref,
    onVisibilityChange
}: EditorContextMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        onVisibilityChange?.(isVisible);
    }, [isVisible, onVisibilityChange]);

    // Expose imperative methods to parent
    useImperativeHandle(ref, () => ({
        show: (x: number, y: number) => {
            setPosition({ x, y });
            setIsVisible(true);
        },
        hide: () => setIsVisible(false),
        toggle: (x: number, y: number) => {
            setPosition({ x, y });
            setIsVisible((prev) => !prev);
        }
    }), []);

    const { floatingStyles, refs, update } = useFloating({
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
            offset({ mainAxis: 0, crossAxis: 0 }),
            shift({ padding: 8 }),
            flip({
                padding: 8,
                // boundary: editor.options.element,
                fallbackPlacements: [
                    'bottom-end',
                    'top-start',
                    'top-end',
                    'right-start',
                    'left-start',
                ],
            }),
        ],
    });

    // Update reference position based on mouse coordinates
    useLayoutEffect(() => {
        if (!isVisible) return;

        refs.setReference({
            getBoundingClientRect() {
                return {
                    x: position.x,
                    y: position.y,
                    top: position.y,
                    left: position.x,
                    bottom: position.y,
                    right: position.x,
                    width: 0,
                    height: 0,
                };
            },
        });

        update();
    }, [position, isVisible, refs, update]);

    // Handle context menu event on editor
    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            if (!editor.view.dom.contains(event.target as Node)) {
                return;
            }

            event.preventDefault();
            setPosition({ x: event.clientX, y: event.clientY });
            setIsVisible(true);
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('contextmenu', handleContextMenu);

        return () => {
            editorElement.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [editor]);

    // Handle clicks outside to close menu
    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        // Small delay to prevent immediate closure from the contextmenu event
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible]);

    // Handle Escape key to close menu
    useEffect(() => {
        if (!isVisible) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsVisible(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible]);

    // Update position on scroll and resize
    useEffect(() => {
        if (!isVisible) return;

        const handleUpdate = () => {
            update();
        };

        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        return () => {
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('resize', handleUpdate);
        };
    }, [isVisible, update]);

    // Close menu when selection becomes empty (user clicked elsewhere in editor)
    useEffect(() => {
        if (!isVisible) return;

        const handleSelectionUpdate = () => {
            // Only close if selection is empty and menu is open
            if (editor.view.state.selection.empty) {
                setIsVisible(false);
            }
        };

        editor.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editor.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [isVisible, editor]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                refs.setFloating(node);
            }}
            style={floatingStyles}
            className={`z-50 overflow-hidden bg-white dark:bg-grey-20 rounded-md shadow-lg dark:shadow-grey-10 border border-grey-80 dark:border-grey-30 ${className}`}>
            {children}
        </div>
    );
}

export function EditorContextMenuHeader({ children }: { children: ReactNode }) {
    return (
        <div className="flex-shrink-0 border-b border-grey-80 dark:border-grey-30 px-2 py-2 bg-white dark:bg-grey-20 rounded-t-md">
            <span className="font-semibold text-sm text-grey-10 dark:text-grey-95">
                {children}
            </span>
        </div>
    );
}

export function EditorContextMenuFooter({ children }: { children: ReactNode }) {
    return (
        <div className="flex-shrink-0 border-t border-grey-80 dark:border-grey-30 px-2 py-2 bg-grey-95 dark:bg-grey-20 rounded-b-md">
            <div className="flex items-center justify-between text-xs text-grey-50 dark:text-grey-80">
                {children}
            </div>
        </div>
    );
}

export function EditorContextMenuToolbar({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-1 px-2 py-2 bg-white dark:bg-grey-20 border-b border-grey-80 dark:border-grey-30 ${className}`}>
            {children}
        </div>
    );
}

export function EditorContextMenuSeparator() {
    return (
        <AppSeparator orientation="horizontal" className="my-1 border-grey-80 dark:border-grey-30" />
    );
}

interface EditorContextMenuListProps {
    children?: ReactNode;
    className?: string;
}

export function EditorContextMenuList({
    children,
    className = '',
}: EditorContextMenuListProps) {
    return (
        <div
            className={`flex flex-col bg-white dark:bg-grey-20 overflow-y-auto ${className}`}>
            {children}
        </div>
    );
}

interface EditorContextMenuItemButtonProps {
    children: ReactNode;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function EditorContextMenuItemButton({
    children,
    disabled = false,
    onClick,
}: EditorContextMenuItemButtonProps) {
    return (
        <AppButton
            className="gap-12"
            variant={'context-menu'}
            size="context-menu-icon-xs"
            rounded="none"
            onClick={onClick}
            disabled={disabled}>
            {children}
        </AppButton>
    );
}

