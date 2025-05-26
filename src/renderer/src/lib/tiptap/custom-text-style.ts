import TextStyle from '@tiptap/extension-text-style'
import { Extension, Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: '12pt',
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`
          }
        }
      },
      fontFamily: {
        default: 'Times New Roman',
        parseHTML: (element) => element.style.fontFamily || null,
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) {
            return {};
          }
          return {
            style: `font-family: ${attributes.fontFamily}`,
          };
        },
      },
      color: {
        default: '#000000',
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    }
  },
})

const CustomLetterSpacing = Mark.create({
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

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    capitalization: {
      setCapitalization: (style: string, originalText?: string) => ReturnType;
    }
  }
}

const Capitalization = Mark.create({
  name: 'capitalization',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      style: {
        default: 'none',
        parseHTML: element => element.getAttribute('data-capitalization'),
        renderHTML: attributes => {
          if (!attributes.style || attributes.style === 'none') return {};
          return { 'data-capitalization': attributes.style, style: `text-transform: ${attributes.style}` };
        }
      },
      originalText: {
        default: null,
        parseHTML: element => element.getAttribute('data-original'),
        renderHTML: attributes => {
          if (!attributes.originalText) return {};
          return { 'data-original': attributes.originalText };
        }
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-capitalization]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setCapitalization: (style, originalText) => ({ chain, editor }) => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');

          return chain()
          .setMark(this.name, {
            style,
            originalText: originalText || selectedText // Store original text automatically
          })
          .run();
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      'Mod+Alt+U': () => {
        return this.editor.commands.setCapitalization('uppercase', undefined);
      },
      'Mod+Alt+L': () => {
        return this.editor.commands.setCapitalization('lowercase', undefined);
      },
      'Mod+Alt+C': () => {
        return this.editor.commands.setCapitalization('startcase', undefined);
      },
      'Mod+Alt+T': () => {
        return this.editor.commands.setCapitalization('capitalize', undefined);
      },
      'Mod+Alt+N': () => {
        return this.editor.commands.setCapitalization('none', undefined);
      },
    };
  }
});


interface IndentOptions {
  maxIndent: number;
  indentStep: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      increaseIndent: () => ReturnType;
      decreaseIndent: () => ReturnType;
    };
  }
}

const IndentExtension = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      maxIndent: 8,
      indentStep: 40,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletedList', 'orderList'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => parseInt(element.getAttribute('data-indent') || '0', 10),
            renderHTML: (attributes) => ({
              'style': `margin-left: ${attributes.indent * this.options.indentStep}px !important;`,
              'data-indent': attributes.indent
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent:
        () =>
          ({ commands }) => {
            const paragraphIndent = this.editor.getAttributes('paragraph').indent;
            const headingIndent = this.editor.getAttributes('heading').indent;
            const indent = paragraphIndent ?? headingIndent ?? 0;
            const maxIndent = Math.min(this.options.maxIndent, (this.editor.view.dom.offsetWidth / this.options.indentStep) - 2); // Calculate max indent based on editor width or at most the max indent
            // Prevent exceeding max indent
            if (indent >= maxIndent) {
              return false;
            }
            return commands.updateAttributes(Number.isInteger(paragraphIndent) ? 'paragraph' : 'heading', {
              indent: Math.min(indent + 1, maxIndent),
            });
          },
      decreaseIndent:
        () =>
          ({ commands }) => {
            const paragraphIndent = this.editor.getAttributes('paragraph').indent;
            const headingIndent = this.editor.getAttributes('heading').indent;
            const indent = paragraphIndent ?? headingIndent ?? 0;
            return commands.updateAttributes(Number.isInteger(paragraphIndent) ? 'paragraph' : 'heading', {
              indent: Math.max(indent - 1, 0),
            });
          },
    };
  },
  addKeyboardShortcuts() {
    return {
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('codeBlock')) return false;
        if (editor.isActive('bulletedList') || editor.isActive('orderList')) {
          return editor.chain().focus().liftListItem('listItem').run();
        }
        console.log('Shift+Tab pressed in shortcuts');

        try {
          // Ottieni la selezione corrente
          const { selection } = editor.state;
          if (selection instanceof TextSelection && selection.empty) {
            // Ottieni la posizione del paragrafo contenente il cursore
            const $pos = selection.$from;
            const node = $pos.parent;

            // Definisci il tipo per gli elementi del contenuto
            interface ContentNode {
              type: string;
              text?: string;
            }

            // Analizza il contenuto del paragrafo per trovare la linea corrente
            const content = node.content.toJSON() as ContentNode[];
            if (!content || !Array.isArray(content)) {
              return false;
            }

            const offset = $pos.parentOffset;

            // Trova l'indice del nodo corrente e la posizione all'interno della linea
            let currentPosition = 0;
            let currentLineStartPos = $pos.start();
            let currentTextNode: ContentNode | null = null;

            // Attraversa il contenuto per trovare la posizione del cursore
            for (let i = 0; i < content.length; i++) {
              const item = content[i];

              // Se è un hardBreak resetta la posizione corrente
              if (item.type === 'hardBreak') {
                currentPosition++;
                currentLineStartPos = $pos.start() + currentPosition;
                continue;
              }

              // Se è un nodo di testo
              if (item.type === 'text') {
                const textLength = item.text ? item.text.length : 0;

                // Controlliamo se il cursore è in questo nodo di testo
                if (currentPosition <= offset && offset <= currentPosition + textLength) {
                  currentTextNode = item;
                  break;
                }

                currentPosition += textLength;
              }
            }

            // Verifica se il nodo di testo corrente inizia con un tab
            if (currentTextNode && currentTextNode.text && currentTextNode.text.startsWith('\t')) {
              // Rimuovi il tab
              return editor.chain()
                .deleteRange({ from: currentLineStartPos, to: currentLineStartPos + 1 })
                .run();
            }
          }
        } catch (error) {
          console.error('Errore durante Shift+Tab:', error);
        }

        // Nessun tab trovato o cursore non valido
        return false;
      },
      'Backspace': ({ editor }) => {
        if (editor.isActive('bulletedList') || editor.isActive('orderList')) {
          const { selection } = editor.state;

          // Se c'è una selezione non vuota (selezione multipla), applica liftListItem a tutti gli elementi
          if (!selection.empty) {
            return editor.chain().focus().liftListItem('listItem').run();
          }

          // Per la selezione singola, controlla se siamo all'inizio dell'elemento
          const { $from } = selection;
          if ($from.parentOffset === 0) {
            // Prova a diminuire il livello di rientro
            if (editor.can().liftListItem('listItem')) {
              return editor.chain().focus().liftListItem('listItem').run();
            }
            // Se non possiamo diminuire il rientro, esci dalla lista
            return editor.chain().focus().liftListItem('listItem').run();
          }
        }
        return false;
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('handleTabIndent'),
        props: {
          handleKeyDown: (_, event) => {
            if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
              console.log('Tab pressed', this.editor.isActive('bulletedList'), this.editor.isActive('orderList'));
              if (this.editor.isActive('bulletedList') || this.editor.isActive('orderList')) {
                console.log('Tab pressed in list');
                if (!event.shiftKey) {
                  // Tab in lista - verifica se è il primo elemento
                  event.preventDefault();

                  // Ottieni lo stato e la posizione corrente
                  const { state } = this.editor;
                  const { selection } = state;
                  const { $from } = selection;

                  // Verifica se è il primo elemento della lista
                  const isFirstListItem = () => {
                    const resolvedPos = state.doc.resolve($from.pos);
                    let depth = resolvedPos.depth;

                    // Trova il nodo listItem
                    while (depth > 0) {
                      const node = resolvedPos.node(depth);
                      if (node.type.name === 'listItem') {
                        // Verifica se è il primo elemento
                        const index = resolvedPos.index(depth);
                        return index === 0;
                      }
                      depth--;
                    }
                    return false;
                  };

                  // Se è il primo elemento, usa un approccio diverso per la lista
                  if (isFirstListItem()) {
                    // Determina il tipo di lista (bulleted o order)
                    const listType = this.editor.isActive('bulletedList') ? 'bulletedList' : 'orderList';

                    // Ottieni l'indentazione corrente della lista
                    const listIndent = this.editor.getAttributes(listType).indent || 0;
                    const maxIndent = Math.min(this.options.maxIndent, (this.editor.view.dom.offsetWidth / this.options.indentStep) - 2);

                    console.log('Indenting list:', listType, 'current indent:', listIndent);

                    // Aumenta l'indentazione della lista completa usando updateAttributes e forceRender
                    try {
                      const newIndent = Math.min(listIndent + 1, maxIndent);
                      console.log('Setting new indent:', newIndent);

                      // Usiamo questo approccio più diretto
                      const tr = this.editor.state.tr;
                      const selection = this.editor.state.selection;
                      let found = false;

                      // Trova il nodo della lista contenente la selezione
                      this.editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                        if ((node.type.name === 'bulletedList' || node.type.name === 'orderList') && !found) {
                          found = true;
                          console.log(`Found ${node.type.name} at pos ${pos}, setting indent=${newIndent}`);
                          tr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            indent: newIndent
                          });
                          return false;
                        }
                        return true;
                      });

                      if (found) {
                        this.editor.view.dispatch(tr);
                        return true;
                      }

                      // Fallback all'approccio standard
                      return this.editor.chain().focus()
                        .updateAttributes(listType, { indent: newIndent })
                        .run();
                    } catch (e) {
                      console.error('Error indenting list:', e);
                      // Fallback: usa il comportamento standard
                      return this.editor.chain().focus()
                        .splitListItem('listItem')
                        .sinkListItem('listItem')
                        .run();
                    }
                  } else {
                    // Comportamento normale per elementi successivi
                    return this.editor.chain().focus()
                      .splitListItem('listItem')
                      .sinkListItem('listItem')
                      .run();
                  }
                }
                // Shift+Tab gestito in addKeyboardShortcuts
                return false;
              }

              // Gestione per paragrafi normali
              if (this.editor.isActive('codeBlock')) return false;

              if (event.shiftKey) {
                event.preventDefault();
                return true;
              } else {
                // Tab normale - inserisce \t come in MS Word
                event.preventDefault();

                // Check if text is selected
                const { selection } = this.editor.state;
                if (!selection.empty) {
                  // Handle multi-line selection by analyzing the structure
                  const { from, to } = selection;

                  // Find all paragraphs in the selection
                  const doc = this.editor.state.doc;
                  const affectedRanges: { start: number; hasTab: boolean }[] = [];

                  // Traverse nodes in selection to find line starts
                  doc.nodesBetween(from, to, (node, pos) => {
                    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                      // Analyze paragraph content to find lines
                      const content = node.content.toJSON() as any[];
                      if (content && Array.isArray(content)) {
                        let currentPos = pos + 1; // +1 to skip paragraph node

                        // First line of paragraph
                        if (currentPos >= from && currentPos <= to) {
                          const firstTextNode = content.find(item => item.type === 'text');
                          const hasTab = firstTextNode?.text?.startsWith('\t') || false;
                          affectedRanges.push({ start: currentPos, hasTab });
                        }

                        // Find subsequent lines after hardBreaks
                        for (let i = 0; i < content.length; i++) {
                          const item = content[i];

                          if (item.type === 'hardBreak') {
                            // Next position after hardBreak
                            currentPos += 1;

                            // Check if this line start is in selection
                            if (currentPos >= from && currentPos <= to) {
                              // Find next text node to check for tab
                              const nextTextNode = content.slice(i + 1).find(nextItem => nextItem.type === 'text');
                              const hasTab = nextTextNode?.text?.startsWith('\t') || false;
                              affectedRanges.push({ start: currentPos, hasTab });
                            }
                          } else if (item.type === 'text') {
                            currentPos += item.text ? item.text.length : 0;
                          }
                        }
                      }
                    }
                    return false; // Don't recurse into child nodes
                  });

                  // Apply tabs to all line starts (in reverse order to maintain positions)
                  let chain = this.editor.chain();
                  for (let i = affectedRanges.length - 1; i >= 0; i--) {
                    const range = affectedRanges[i];
                    if (!range.hasTab) { // Only add tab if not already present
                      chain = chain.insertContentAt(range.start, '\t');
                    }
                  }

                  return chain.run();
                }

                // No selection, just insert tab
                return this.editor.commands.insertContent('\t');
              }
            }
            return false;
          }
        }
      })
    ];
  }
});

export { CustomTextStyle, CustomLetterSpacing, Capitalization, IndentExtension }