import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';

export default Node.create({
    name: 'sectionDivider',
    group: 'block',
    selectable: false,
    draggable: false,
    atom: true,
    content: '',
    defining: true,
    isolating: true,
    code: true,
    whitespace: 'pre',
    marks: '',  // No marks allowed - makes it incompatible with formatting
    parseDOM: [],
    toDOM: () => ['div', { 'data-type': 'section-divider', class: 'section-divider', contenteditable: 'false' }],

    addAttributes() {
        return {
            sectionType: {
                default: 'introduction',
            },
            label: {
                default: ''
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div',
                getAttrs: element => ({
                    sectionType: element.dataset.sectionType,
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'section-divider',
                'data-section-type': HTMLAttributes.sectionType,
                class: `section-divider section-divider-${HTMLAttributes.sectionType}`,
            })
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SectionDividerView, {
            as: 'section-divider'
        });
    },
});

function SectionDividerView({ node }: any) {
    const sectionType = node.attrs.sectionType
    const label = node.attrs.label

    return (
        <NodeViewWrapper
            type={sectionType}
            className="relative select-none pointer-events-none my-6"
            contentEditable="false"
            draggable="false">
            <NodeViewContent className="content flex-1" />
            <div
                contentEditable="false"
                draggable="false"
                className="text-[11px] font-semibold text-grey-50 my-1 text-left border-b border-grey-60 py-2">
                <span>{label}</span>
            </div>
        </NodeViewWrapper>
    )
}

// return createElement(
//     NodeViewWrapper,
//     {
//         className: `relative select-none pointer-events-none section-divider-${sectionType} mt-4`,
//         'data-type': 'section-divider',
//         contentEditable: 'false',
//         draggable: false
//     },
//     createElement(
//         'div',
//         {
//             className: 'text-[11px] font-semibold text-grey-50 my-1 text-left section-divider',
//             contentEditable: 'false',
//             draggable: false,
//             unselectable: 'on'
//         },
//         label
//     ),
//     createElement(
//         'div',
//         {
//             className: 'border-t border-grey-60 my-[10px]',
//             contentEditable: 'false',
//             draggable: false,
//             unselectable: 'on'
//         }
//     )
// )