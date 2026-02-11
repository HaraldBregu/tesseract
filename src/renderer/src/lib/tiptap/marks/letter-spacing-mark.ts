import { Mark, mergeAttributes } from "@tiptap/core";

export const LetterSpacingMark = Mark.create({
    name: "letterSpacing",

    addAttributes() {
        return {
            ...this.parent?.(),
            spacing: {
                default: "normal",
                parseHTML: (element) => element.style.letterSpacing || "normal",
                renderHTML: (attributes) => {
                    if (!attributes.spacing || attributes.spacing === "normal") {
                        return {};
                    }
                    return { style: `letter-spacing: ${attributes.spacing}` };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[style]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes), 0];
    },
});
