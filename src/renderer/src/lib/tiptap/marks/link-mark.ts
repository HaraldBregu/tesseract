import { Link as DefaultLink, LinkOptions as DefaultLinkOptions } from "@tiptap/extension-link";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { getAttributes } from "@tiptap/core";

interface LinkOptions extends DefaultLinkOptions {
    ctrlClick?: boolean;
}

const Link = DefaultLink.extend<LinkOptions>({

    // Set to false if you want to unset the mark when the cursor is at the end of the mark
    inclusive: false,

    addOptions() {
        return {
            ...this.parent?.(),
            ctrlClick: true,
            openOnClick: false, // Prevent default navigation on click
        };
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            class: {
                default: 'cursor-pointer',
                parseHTML: element => element.getAttribute("class"),
                renderHTML: attributes => {
                    return {
                        class: attributes.class,
                    };
                },
            },
            title: {
                default: typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
                    ? 'Cmd+Click to open link'
                    : 'Ctrl+Click to open link',
                parseHTML: element => element.getAttribute("title"),
                renderHTML: attributes => ({
                    title: attributes.title,
                }),
            },
        };
    },

    addProseMirrorPlugins() {
        const plugins: Plugin[] = this.parent?.() || [];

        if (this.options.ctrlClick) {
            const ctrlClickHandler = new Plugin({
                key: new PluginKey("handleControlClick"),
                props: {
                    handleClick(view, _, event) {
                        const link = (event.target as HTMLElement)?.closest("a");
                        const keyPressed = event.ctrlKey || event.metaKey;

                        if (keyPressed && link) {
                            const attrs = getAttributes(view.state, "link");
                            if (attrs.href) {
                                window.open(attrs.href, attrs.target || "_blank");
                                return true;
                            }
                        }

                        // Prevent navigation on normal click
                        if (link) {
                            event.preventDefault();
                            return true;
                        }

                        return false;
                    }
                }
            });

            plugins.push(ctrlClickHandler);
        }

        return plugins;
    }
});

export default Link;