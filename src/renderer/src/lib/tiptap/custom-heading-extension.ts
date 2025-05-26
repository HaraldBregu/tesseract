import Heading from '@tiptap/extension-heading';

// Define heading styles for each level
const headingStyles = {
    1: { fontSize: '18pt', fontWeight: 'bold', color: '#000', fontStyle: 'normal' },
    2: { fontSize: '16pt', fontWeight: 'bold', color: '#000', fontStyle: 'normal' },
    3: { fontSize: '14pt', fontWeight: 'bold', color: '#000', fontStyle: 'normal' },
    4: { fontSize: '12pt', fontWeight: 'bold', color: '#000', fontStyle: 'italic' },
    5: { fontSize: '12pt', fontWeight: 'bold', color: '#000', fontStyle: 'italic' },
    6: { fontSize: '10pt', fontWeight: 'bold', color: '#000', fontStyle: 'italic' },
};

// Create a custom heading extension with styles
export const CustomHeading = Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
}).extend({
    addAttributes() {
        return {
            level: {
                default: 1,
                rendered: true,
                // Aggiungiamo un trigger per aggiornare gli altri attributi quando cambia il livello
                parseHTML: element => {
                    const level = parseInt(element.tagName.replace('H', ''), 10);
                    return level || 1;
                }
            },
            fontSize: {
                default: null, // Rimosso valore di default statico
                parseHTML: element => {
                    const style = element.getAttribute('style');
                    if (style) {
                        const match = style.match(/font-size:\s*([^;]+)/);
                        return match ? match[1].trim() : null;
                    }
                    return element.dataset.fontSize || null;
                },
                renderHTML: attributes => {
                    const level = attributes.level || 1;
                    const fontSize = attributes.fontSize || headingStyles[level].fontSize;
                    return { style: `font-size: ${fontSize}` };
                },
            },
            fontWeight: {
                default: null, // Rimosso valore di default statico
                parseHTML: element => element.style.fontWeight || element.dataset.fontWeight || 'bold',
                renderHTML: attributes => {
                    const level = attributes.level || 1;
                    const weight = attributes.fontWeight || headingStyles[level].fontWeight;
                    return { style: `font-weight: ${weight}` };
                },
            },
            fontStyle: {
                default: null, // Rimosso valore di default statico
                parseHTML: element => element.style.fontStyle || element.dataset.fontStyle || null,
                renderHTML: attributes => {
                    const level = attributes.level || 1;
                    const style = attributes.fontStyle || headingStyles[level].fontStyle;
                    if (style === 'normal') return {};
                    return { style: `font-style: ${style}` };
                },
            },
            color: {
                default: null, // Rimosso valore di default statico
                parseHTML: element => element.style.color || element.dataset.color || '#000',
                renderHTML: attributes => {
                    const level = attributes.level || 1;
                    const color = attributes.color || headingStyles[level].color;
                    return { style: `color: ${color}` };
                },
            },
        };
    },

    onTransaction({ transaction }) {
        // Quando c'è una transazione che cambia il livello, aggiorniamo gli attributi
        const docChanged = transaction.docChanged;
        if (!docChanged) return;

        const { state } = this.editor.view;
        const { tr } = state;
        let modified = false;

        // Itera attraverso tutti i nodi del documento per trovare gli heading
        state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
                const level = node.attrs.level;
                const style = headingStyles[level];

                // Se gli attributi non corrispondono agli stili predefiniti per questo livello, aggiornali
                if (node.attrs.fontSize !== style.fontSize ||
                    node.attrs.fontWeight !== style.fontWeight ||
                    node.attrs.fontStyle !== style.fontStyle ||
                    node.attrs.color !== style.color) {

                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle,
                        color: style.color
                    });
                    modified = true;
                }

                if (node.content.size > 0) {
                    // Rimuovi marks se presenti nel contenuto del nodo
                    node.content.forEach((childNode, index) => {
                        if (childNode.marks && childNode.marks.length > 0) {
                            const childPos = pos + 1 + index;
                            tr.removeMark(childPos, childPos + childNode.nodeSize, null);
                            modified = true;
                        }
                    });
                }
            }
            return true;
        });

        if (modified) {
            this.editor.view.dispatch(tr);
        }
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setHeading: attributes => ({ commands }) => {
                const level = attributes.level;
                const styles = headingStyles[level];

                // Set all attributes at once
                return commands.setNode('heading', {
                    level,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    fontStyle: styles.fontStyle,
                    color: styles.color
                });
            }
        }
    },

    renderHTML({ node, HTMLAttributes }) {
        const level = node.attrs.level;
        // Get default styles for this level
        const styles = headingStyles[level];

        // Use node attributes if available, otherwise use defaults
        const fontSize = node.attrs.fontSize || styles.fontSize;
        const fontWeight = node.attrs.fontWeight || styles.fontWeight;
        const fontStyle = node.attrs.fontStyle || (level >= 4 ? 'italic' : 'normal');
        const color = node.attrs.color || styles.color;

        const styleString = `font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; ${fontStyle === 'italic' ? 'font-style: italic;' : ''}`;

        return [`h${level}`, {
            ...HTMLAttributes,
            class: `heading-${level}`,
            style: styleString,
            "data-font-size": fontSize,
            "data-font-weight": fontWeight,
            "data-color": color,
            "data-font-style": fontStyle
        }, 0];
    }
});
