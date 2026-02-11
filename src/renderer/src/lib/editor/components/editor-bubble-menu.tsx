import { useFloating, offset, flip, shift } from '@floating-ui/react-dom';
import { Editor, isNodeSelection, posToDOMRect } from '@tiptap/core';
import { ReactNode, useLayoutEffect, useState, useEffect, useImperativeHandle, useRef } from 'react';

export interface EditorBubbleMenuElement {
    show: () => void;
    hide: () => void;
    toggle: () => void;
    activate: (value: boolean) => void;
 }

interface EditorBubbleMenuProps {
    editor: Editor;
    children: ReactNode;
    className?: string;
    ref?: React.Ref<EditorBubbleMenuElement>;
    onVisibilityChange?: (isVisible: boolean) => void;
}

export function EditorBubbleMenu({ editor, children, className = '', ref, onVisibilityChange }: EditorBubbleMenuProps) {
    const [isVisible, setIsVisible] = useState(true);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [isActivated, setIsActivated] = useState(true);
    const [isMouseDown, setIsMouseDown] = useState(false);
    
    // Expose imperative methods to parent
    useImperativeHandle(ref, () => ({
        show: () => setIsVisible(true),
        hide: () => setIsVisible(false),
        toggle: () => setIsVisible((prev) => !prev),
        activate: (value: boolean) => setIsActivated(value)
     }), [])

    // Notify parent when visibility changes
    useEffect(() => {
        onVisibilityChange?.(isVisible);
    }, [isVisible, onVisibilityChange]);

    const { floatingStyles, refs, update } = useFloating({
        strategy: 'fixed',
        placement: 'top',
        middleware: [
            offset({ mainAxis: 8 }),
            shift({ padding: 8 }),
            // shift({ crossAxis: true }),
            flip({
                padding: 8,
                // To show the bubble menu inside the text editor boundaries
                // boundary: editor.options.element,
                fallbackPlacements: [
                    'bottom',
                    'top-start',
                    'bottom-start',
                    'top-end',
                    'bottom-end',
                ],
            }),
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

    // Track mouse down/up to only show menu after selection is complete
    useEffect(() => {
        const editorElement = editor.view.dom;
        
        const handleMouseDown = () => {
            setIsMouseDown(true);
            setIsVisible(false); // Hide menu while selecting
        };
        
        const handleMouseUp = () => {
            setIsMouseDown(false);
            // Show menu only if there's a selection when mouse is released
            if (!editor.view.state.selection.empty) {
                setIsVisible(true);
            }
        };
        
        editorElement.addEventListener('mousedown', handleMouseDown);
        editorElement.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            editorElement.removeEventListener('mousedown', handleMouseDown);
            editorElement.removeEventListener('mouseup', handleMouseUp);
        };
    }, [editor]);
    
    // Show menu when selection changes (only if mouse is not down)
    useEffect(() => {
        if (!editor.view.state.selection.empty && !isMouseDown) {
            setIsVisible(true);
        }
    }, [editor.view.state.selection, isMouseDown]);

    // Handle Escape key to hide menu
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && editor.isFocused && !editor.view.state.selection.empty) {
                event.preventDefault();
                setIsVisible(false);
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('keydown', handleKeyDown);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor]);

    // Hide menu when focus moves away from both editor and bubble menu
    useEffect(() => {
        const handleFocusOut = (event: FocusEvent) => {
            // Get the element that's receiving focus
            const relatedTarget = event.relatedTarget as HTMLElement | null;

            // Check if focus is moving to the bubble menu or editor
            const isFocusInBubbleMenu = elementRef.current?.contains(relatedTarget);
            const isFocusInEditor = editor.view.dom.contains(relatedTarget);

            // Hide menu only if focus is moving outside both editor and bubble menu
            if (!isFocusInBubbleMenu && !isFocusInEditor) {
                setIsVisible(false);
            }
        };

        const editorElement = editor.view.dom;

        // Listen to focusout on both editor and bubble menu
        editorElement.addEventListener('focusout', handleFocusOut);

        // Also listen on bubble menu element when it exists
        const bubbleMenuElement = elementRef.current;
        if (bubbleMenuElement) {
            bubbleMenuElement.addEventListener('focusout', handleFocusOut);
        }

        return () => {
            editorElement.removeEventListener('focusout', handleFocusOut);
            if (bubbleMenuElement) {
                bubbleMenuElement.removeEventListener('focusout', handleFocusOut);
            }
        };
    }, [editor]);

    // Update position on scroll and resize since autoUpdate doesn't work with virtual elements
    useEffect(() => {
        if (!isVisible) return;

        const handleUpdate = () => {
            update();
        };

        // Listen to window scroll and resize
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        // Use ResizeObserver to detect when editor container or parent elements resize
        const editorElement = editor.options.element;
        const resizeObserver = new ResizeObserver(handleUpdate);

        if (editorElement) {
            // Observe the editor element itself
            resizeObserver.observe(editorElement);

            // Also observe parent elements that might resize
            let parent = editorElement.parentElement;
            while (parent) {
                resizeObserver.observe(parent);
                parent = parent.parentElement;
            }
        }

        return () => {
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('resize', handleUpdate);
            resizeObserver.disconnect();
        };
    }, [isVisible, update, editor.options.element]);

    const isOpen = !editor.view.state.selection.empty && isVisible;

    if (!isOpen || !isActivated) {
        return null;
    }

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                refs.setFloating(node);
            }}
            style={floatingStyles}
            className={`z-50 ${className}`}>
            {children}
        </div>
    );
}