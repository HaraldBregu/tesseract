import { createElement } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';

const SectionDividerView: React.FC<NodeViewProps> = ({ node }) => {
    const { sectionType, label } = node.attrs as { sectionType: string; label: string; };

    return createElement(
        NodeViewWrapper,
        {
            className: `relative select-none pointer-events-none section-divider-${sectionType} mt-4`
        },
        createElement(
            'div',
            {
                className: 'text-[11px] font-semibold text-grey-50 my-1 text-left section-divider',
            },
            label
        ),
        createElement(
            'div',
            {
                className: 'border-t border-grey-60 my-[10px]'
            }
        )
    );
};

export { SectionDividerView };