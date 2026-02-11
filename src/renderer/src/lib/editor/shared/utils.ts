import { Editor } from "@tiptap/react";
import { Node } from '@tiptap/pm/model'
import { EditorState } from "@tiptap/pm/state";

export const removeAllStyles = (container: Element): void => {
    const formattingTags = [
        'strong',
        'em',
        'b',
        'i',
        'u',
        's',
        'sub',
        'sup',
        'span',
        'font',
        'mark',
        'small',
        'big',
        'br',
        'a',
        'bookmark',
        'note',
        'siglum[data-type="siglum"]',
        'comment',
        'reading-separator[data-type="reading-separator"]',
        'reading-type[data-type="reading-type"]',
        'content'
    ];

    let elementsToUnwrap = container.querySelectorAll(formattingTags.join(', '));
    while (elementsToUnwrap.length > 0) {
        elementsToUnwrap.forEach(element => {
            const innerContent = element.innerHTML;
            const fragment = document.createRange().createContextualFragment(innerContent);
            element?.parentNode?.replaceChild(fragment, element);
        });
        elementsToUnwrap = container.querySelectorAll(formattingTags.join(', '));
    }
};

export const removeParagraphAndHeadings = (container: Element): void => {
    const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    removeTagsFromElement(tags, container)
}

export const removeLinks = (container: Element): void => {
    const tags = ['a']
    removeTagsFromElement(tags, container)
}

export const removeBreaks = (container: Element): void => {
    const tags = ['br']
    removeTagsFromElement(tags, container)
}

export const removeMainTextCustomElements = (container: Element): void => {
    const tags = [
        'bookmark',
        'note',
        'siglum[data-type="siglum"]',
        'comment',
    ];
    removeTagsFromElement(tags, container)
};

export const removeApparatusCustomElements = (container: Element): void => {
    const tags = [
        'lemma',
        'siglum[data-type="siglum"]',
        'comment',
        'reading-separator[data-type="reading-separator"]',
        'reading-type[data-type="reading-type"]',
        'content'
    ];
    removeTagsFromElement(tags, container)
};

export const removeCustomElements = (container: Element): void => {
    const tags = [
        'lemma',
        'bookmark',
        'note',
        'siglum[data-type="siglum"]',
        'comment',
        'reading-separator[data-type="reading-separator"]',
        'reading-type[data-type="reading-type"]',
        'content'
    ];
    removeTagsFromElement(tags, container)
};

export const selectParagraphsOnly = (container: Element): void => {
    const paragraphs = Array.from(container.querySelectorAll('p'));
    if (paragraphs.length === 0)
        return;

    // Remove all children of the container
    while (container.firstChild)
        container.removeChild(container.firstChild);

    // Append only the paragraphs themselves to the container
    paragraphs.forEach(paragraph => {
        // Remove paragraph from its previous parent if necessary
        if (paragraph.parentElement)
            paragraph.parentElement.removeChild(paragraph);
        container.appendChild(paragraph);
    });
}

export const extractSelectionHTML = (editor: Editor): string => {
    const view = editor.view;
    const { state } = editor;
    const { from, to } = state.selection;
    let originalHTML = '';

    if (view && typeof window !== 'undefined') {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            const range = document.createRange();
            const fromPos = view.domAtPos(from);
            const toPos = view.domAtPos(to);

            if (
                fromPos.node &&
                toPos.node &&
                fromPos.node.ownerDocument === window.document &&
                toPos.node.ownerDocument === window.document
            ) {
                range.setStart(fromPos.node, fromPos.offset);
                range.setEnd(toPos.node, toPos.offset);
                selection.addRange(range);
                const fragment = range.cloneContents();
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(fragment);
                originalHTML = tempDiv.innerHTML;
                selection.removeAllRanges();
            }
        }
    }

    return originalHTML;
}

export const removeTagsFromElement = (tags: string[], element: Element): void => {
    let elementsToUnwrap = element.querySelectorAll(tags.join(', '));
    while (elementsToUnwrap.length > 0) {
        elementsToUnwrap.forEach(element => {
            const innerContent = element.innerHTML;
            const fragment = document.createRange().createContextualFragment(innerContent);
            element?.parentNode?.replaceChild(fragment, element);
        });
        elementsToUnwrap = element.querySelectorAll(tags.join(', '));
    }
}



interface SelectionContainsNodeTypeOptions {
    nodeTypes: string[]
}

type SelectionContainsNodeTypeCommand = (options: SelectionContainsNodeTypeOptions) => (props: { state: EditorState }) => boolean

/**
 * Checks if the current selection contains any node of the specified types
 * @param nodeTypes - Array of node type names to check for
 * @returns true if any of the specified node types are found in the selection, false otherwise
 */
const selectionContainsNodeType: SelectionContainsNodeTypeCommand = ({ nodeTypes }) => ({ state }) => {
    const { selection, doc } = state
    if (selection.empty) return false

    const { from, to } = selection
    let foundNodeType = false

    doc.nodesBetween(from, to, (node: Node) => {
        if (nodeTypes.includes(node.type.name)) {
            foundNodeType = true
            return false // Stop searching once found
        }
        return true // Continue searching
    })

    return foundNodeType
}

interface CanDeleteSelectionOptions {
    preventDeleteIfContains?: string[]
}

type CanDeleteSelectionCommand = (options: CanDeleteSelectionOptions) => (props: { state: EditorState }) => boolean

/**
 * Checks if the selection can be deleted based on whether it contains certain protected node types
 * @param preventDeleteIfContains - Array of node type names that prevent deletion if found
 * @returns true if deletion is allowed, false if it should be prevented
 * 
 * @example
 * // Check if selection can be deleted (prevents deletion if it contains lemma nodes)
 * const canDelete = canDeleteSelection({ preventDeleteIfContains: ['lemma'] })({
 *   state: editor.state
 * })
 * 
 * if (canDelete) {
 *   editor.commands.deleteSelection()
 * } else {
 *   console.log('Cannot delete: selection contains protected nodes')
 * }
 * 
 * @example
 * // Use in a custom command
 * const safeDelete = () => ({ state, dispatch }) => {
 *   if (!canDeleteSelection({ preventDeleteIfContains: ['lemma', 'citation'] })({ state })) {
 *     return false
 *   }
 *   if (dispatch) {
 *     dispatch(state.tr.deleteSelection())
 *   }
 *   return true
 * }
 */
const canDeleteSelection: CanDeleteSelectionCommand = ({ preventDeleteIfContains = [] } = {}) => ({ state }) => {
    if (preventDeleteIfContains.length === 0) return true

    return !selectionContainsNodeType({ nodeTypes: preventDeleteIfContains })({ state })
}

// Export utility functions for external use
export { selectionContainsNodeType, canDeleteSelection }
export type { SelectionContainsNodeTypeOptions, CanDeleteSelectionOptions }