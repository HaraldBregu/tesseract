
import { mergeAttributes } from "@tiptap/core";
import { Node, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { paragraphTemplate } from "../shared/templates-mock";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        pageBreak: {
            setPageBreak: (style: Style) => ReturnType;
        };
    }
}

export interface PageBreakOptions {
    HTMLAttributes: Record<string, unknown>;
}

//this has been renamed hardBreak from pageBreak due to print preview issues

export default Node.create<PageBreakOptions>({
    name: "hardBreak",

    group: "block",

    atom: true,

    selectable: false,

    draggable: false,

    inline: false,

    handleContextMenu: false,

    addAttributes() {
        return {};
    },

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    parseHTML() {
        return [
            {
                tag: "page-break",
                getAttrs: () => {
                    return {};
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "page-break",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
        ];
    },
    addCommands() {
        return {
            setPageBreak:
                (style) =>
                    ({ commands }) => {
                        commands.insertContent([
                            { type: "hardBreak" },
                            paragraphTemplate(style)
                        ])
                        return true;
                    },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(PageBreakNodeView);
    },
});

function PageBreakNodeView() {
    return (
        <NodeViewWrapper>
            <div className="w-full bg-black my-2 h-[1px]" />
        </NodeViewWrapper>
    );
}
