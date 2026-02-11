import { mergeAttributes, Node } from '@tiptap/core'


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lemma: {
      /**
       * Add a note mention
       */
      setLemma: (lemma: Lemma, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => ReturnType,
      /**
       * Update a lemma style
       */
      updateLemmaStyleAndSeparators: (lemmaStyle: LemmaStyle, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => ReturnType,
      /*
       * Update a lemma highlight color
       */
      updateLemmaHighlightColor: (highlightColor: string) => ReturnType,
      /**
       * Update a lemma
       */
      updateLemmaContent: (from: number, to: number, content: string) => ReturnType,
      /**
       * Remove a note mention
       */
      unsetLemma: () => ReturnType,
    }
  }
}

export interface LemmaOptions {
  HTMLAttributes: Record<string, unknown>
}

const Lemma = Node.create<LemmaOptions>({
  name: 'lemma',
  group: 'inline',
  inline: true,
  draggable: false,
  selectable: false,
  contentEditable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      lemma: {
        default: null,
      },
      separator: {
        default: null,
      },
      fromToSeparator: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="lemma"]',
        getAttrs: element => {
          return {
            id: element.getAttribute('data-id'),
            lemma: element.getAttribute('data-lemma'),
            separator: element.getAttribute('data-lemma-separator'),
            fromToSeparator: element.getAttribute('data-lemma-fromToSeparator'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const lemmaAttributes = HTMLAttributes.lemma as Lemma;
    const fromToSeparatorAttributes = HTMLAttributes.fromToSeparator as LemmaFromToSeparator;
    const separatorAttributes = HTMLAttributes.separator as LemmaSeparator;

    const lemmaContent = lemmaAttributes.content ?? '';
    const lemmaStyle = lemmaAttributes.style;
    const fromToSeparatorContent = fromToSeparatorAttributes.content
    const fromToSeparatorStyle = fromToSeparatorAttributes.style
    const separatorContent = separatorAttributes.content
    const separatorStyle = separatorAttributes.style

    const words = lemmaContent
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
    const wordCount = words.length

    const content: any[] = []

    // FIRST PART OF THE LEMMA
    const firstPart = wordCount > 6
      ? words.slice(0, 3).join(' ')
      : wordCount > 2
        ? words[0]
        : lemmaContent;

    let firstWords = [
      'content', {},
      firstPart,
    ] as any

    if (lemmaStyle.italic)
      firstWords = ['em', {}, firstWords];
    if (lemmaStyle.bold)
      firstWords = ['strong', {}, firstWords];
    content.push(firstWords)

    // FROM TO SEPARATOR AND LAST WORD
    if (wordCount > 2) {
      let fromToSeparator = [
        'fromToSeparator', {},
        " " + fromToSeparatorContent + " ",
      ] as any

      if (fromToSeparatorStyle.underline)
        fromToSeparator = ['u', {}, fromToSeparator];
      if (fromToSeparatorStyle.italic)
        fromToSeparator = ['em', {}, fromToSeparator];
      if (fromToSeparatorStyle.bold)
        fromToSeparator = ['strong', {}, fromToSeparator];

      content.push(fromToSeparator)

      // Last words
      const lastPart = wordCount > 6
        ? words.slice(-3).join(' ')
        : words[words.length - 1];

      let lastWords = [
        'content', {},
        lastPart,
      ] as any

      if (lemmaStyle.italic)
        lastWords = ['em', {}, lastWords];
      if (lemmaStyle.bold)
        lastWords = ['strong', {}, lastWords];

      content.push(lastWords)
    }

    // SUFFIX | LEMMA SEPARATOR
    let suffix = [
      'suffix', {},
      separatorContent,
    ] as any

    if (separatorStyle.underline)
      suffix = ['u', {}, suffix];
    if (separatorStyle.italic)
      suffix = ['em', {}, suffix];
    if (separatorStyle.bold)
      suffix = ['strong', {}, suffix];

    content.push(suffix)

    // @WARNING: LEMMA FONT FAMILY SHOULD BE DISABLED LIKE THE REST OF APPARATUS DATA (SIGLA, SEPARATORS ETC.)

    return [
      'lemma',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'lemma',
          'data-id': HTMLAttributes.id,
          'data-lemma-content': lemmaContent,
          style: `
            font-style: normal;
            font-weight: normal;
            user-select: none;
            border-radius: 2px;
            background-color: ${lemmaStyle.highlightColor};
            color: ${lemmaStyle.textColor};
            font-size: ${lemmaStyle.fontSize};
            font-family: ${lemmaStyle.fontFamily};
            cursor: pointer;
          `
        }
      ),
      ...content,
    ]
  },

  addCommands() {
    return {
      setLemma: (lemma: Lemma, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => ({ chain, state }) => {
        const { from, to } = state.selection;

        return chain()
          .focus()
          .insertContentAt(from, {
            type: this.name,
            attrs: {
              lemma: lemma,
              fromToSeparator: fromToSeparator,
              separator: separator,
            },
          })
          .deleteRange({
            from: from + 1,
            to: to + 1,
          })
          .run();
      },
      updateLemmaStyleAndSeparators: (lemmaStyle: LemmaStyle, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => ({ chain, state }) => {
        const { from } = state.selection;
        return chain()
          .updateAttributes(this.name, {
            ...state.doc.nodeAt(from)?.attrs,
            lemma: {
              ...((state.doc.nodeAt(from)?.attrs?.lemma ?? {}) as Lemma),
              style: lemmaStyle,
            },
            fromToSeparator: fromToSeparator,
            separator: separator,
          }).run();
      },
      updateLemmaHighlightColor: (highlightColor: string) => ({ chain, state }) => {
        const { from } = state.selection;
        return chain()
          .updateAttributes(this.name, {
            ...state.doc.nodeAt(from)?.attrs,
            lemma: {
              ...((state.doc.nodeAt(from)?.attrs?.lemma ?? {}) as Lemma),
              style: {
                ...((state.doc.nodeAt(from)?.attrs?.lemma?.style ?? {}) as LemmaStyle),
                highlightColor,
              },
            },
          })
          .run();
      },
      updateLemmaContent: (from: number, to: number, content: string) => ({ chain, state }) => {
        return chain()
          .insertContentAt({ from, to }, {
            type: this.name,
            attrs: {
              ...state.doc.nodeAt(from)?.attrs,
              lemma: {
                ...((state.doc.nodeAt(from)?.attrs?.lemma ?? {}) as Lemma),
                content: content,
              },
              fromToSeparator: {
                ...((state.doc.nodeAt(from)?.attrs?.fromToSeparator ?? {}) as LemmaFromToSeparator),
              },
              separator: {
                ...((state.doc.nodeAt(from)?.attrs?.separator ?? {}) as LemmaSeparator),
              },
            }
          })
          .run();
      },
      unsetLemma:
        () => ({ commands }) => {
          return commands.deleteSelection()
        },
    }
  },
})

export default Lemma
