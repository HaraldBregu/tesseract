import { useFloating, offset, flip, shift } from '@floating-ui/react-dom';
import { Editor, isNodeSelection, posToDOMRect } from '@tiptap/core';
import { ReactNode, useLayoutEffect, useState, useEffect, useImperativeHandle, useRef } from 'react';

export interface EditorOptionMenuElement {
    show: () => void;
    hide: () => void;
    toggle: () => void;
}

interface EditorOptionMenuProps {
    editor: Editor;
    children: ReactNode;
    className?: string;
    ref?: React.Ref<EditorOptionMenuElement>;
}

export function EditorOptionMenu({
    editor,
    children,
    className = '',
    ref
}: EditorOptionMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
        show: () => setIsVisible(true),
        hide: () => setIsVisible(false),
        toggle: () => setIsVisible((prev) => !prev)
    }), []);

    const { floatingStyles, refs, update } = useFloating({
        strategy: 'fixed',
        placement: 'left',
        middleware: [
            offset({ mainAxis: 8, crossAxis: 0 }),
            flip({
                padding: 8,
                fallbackPlacements: [
                    'right',
                    'left',
                ],
            }),
            shift({ padding: 8 }),
        ],
    });

    useLayoutEffect(() => {
        const { ranges } = editor.state.selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        refs.setReference({
            getBoundingClientRect() {
                if (isNodeSelection(editor.state.selection)) {
                    const node = editor.view.nodeDOM(from) as HTMLElement | null;

                    if (node) {
                        return node.getBoundingClientRect();
                    }
                }

                return posToDOMRect(editor.view, from, to);
            },
        });

        // Manually update position since we're using a virtual element
        update();
    }, [refs, editor.view, editor.state.selection, update]);

    // Update position on scroll and resize since autoUpdate doesn't work with virtual elements
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

    const isOpen = !editor.view.state.selection.empty && isVisible;

    useEffect(() => {
        const isOpen = !editor.view.state.selection.empty && isVisible;
        if (!isOpen) {
            setIsVisible(false);
        }
    }, [isVisible, editor.view.state.selection]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                refs.setFloating(node);
            }}
            style={{
                ...floatingStyles,
            }}
            className={`z-50 bg-white dark:bg-grey-20 rounded-md shadow-lg dark:shadow-grey-10 border border-grey-80 dark:border-grey-30 overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

export function EditorOptionMenuHeader({ children }) {
    return (
        <>
            <div className="flex-shrink-0 border-b border-grey-80 dark:border-grey-30 px-2 py-2 bg-white dark:bg-grey-20 rounded-t-md">
                <span className="font-semibold text-sm text-grey-10 dark:text-grey-95">
                    {children}
                </span>
            </div>
        </>
    )
}

export function EditorOptionMenuFooter({ children }) {
    return (
        <>
            <div className="flex-shrink-0 border-t border-grey-80 dark:border-grey-30 px-2 py-2 bg-grey-95 dark:bg-grey-20 rounded-b-md">
                <div className="flex items-center justify-between text-xs text-grey-50 dark:text-grey-80">
                    {children}
                </div>
            </div>
        </>
    )
}