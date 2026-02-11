import { Content, Editor, generateJSON } from "@tiptap/core";
import { useCallback } from "react";
import { Node } from 'prosemirror-model';
import { LigatureType } from "@/lib/tiptap/ligature-mark";
import generateInlineCitationText from "@/utils/generateInlineCitationText";
import { getSectionRange } from "@/lib/utils";
import { useEditorState } from "@tiptap/react";
import { orderedListStyleToType, bulletStyleToType } from "@/lib/utils/list-type-mappers";
import { bulletStyleSet, orderedStyleSet } from "@/utils/listUtils";
import { sortBibliographicEntries } from "@/utils/sortBibliographicEntries";

interface UseMainTextEditorReturn {
  textNotes: { noteId: string, noteContent: string }[];
  comments: { id: string, content: string }[];
  bookmarks: { id: string, content: string }[];
  currentSection: string;
  currentNodeTypeName: string;
  selectedNodes: Node[];
  selectedNodesTypeNames: string[];
  undo: () => void;
  redo: () => void;
  forceUpdate: () => void;
  setBody: (style?: Style) => void;
  setHeading: (style: Style) => void;
  setCustomStyle: (style: Style) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: string) => void;
  boldState: () => boolean;
  setBold: (bold: boolean) => void;
  toggleBold: () => void;
  unsetBold: () => void;
  italicState: () => boolean;
  setItalic: (italic: boolean) => void;
  unsetItalic: () => void;
  setUnderline: (underline: boolean) => void;
  unsetUnderline: () => void;
  setTextColor: (color: string) => void;
  setHighlightColor: (color: string) => void;
  setBlockquote: (value: boolean) => void;
  setTextAlignment: (alignment: Alignment) => void;
  setLineSpacing: (spacing: Spacing) => void;
  setListStyle: (style: ListStyle) => void;
  setShowNonPrintingCharacters: (visible: boolean) => void;
  setListNumbering: (numbering: number) => void;
  setOrderedListType: (type: '1' | 'a' | 'A' | 'i' | 'I') => void;
  continuePreviousNumbering: () => void;
  getSuggestedStartNumber: () => { number: number; listType: OrderedListType } | null;
  setStrikeThrough: (value: boolean) => void;
  setPageBreak: (style: Style) => void;
  setSuperscript: (value: boolean) => void;
  unsetSuperscript: () => void;
  setSubscript: (value: boolean) => void;
  unsetSubscript: () => void;
  setLigature: (ligature: LigatureType) => void;
  setCase: (caseType: CasingType) => void;
  increaseIndent: () => void;
  decreaseIndent: () => void;
  increaseCharacterSpacing: () => void;
  decreaseCharacterSpacing: () => void;
  unsetCharacterSpacing: () => void;
  selectedText: () => string;
  selectedContentJSON: () => any;
  selectedContentString: () => string;
  addBookmark: (color: string) => void;
  scrollToBookmark: (id: string) => void;
  addComment: (color: string) => void;
  scrollToComment: (id: string) => void;
  getCommentsIds: () => string[];
  scrollToSection: (id: string, position?: 'top' | 'bottom') => void;
  scrollToHeadingIndex: (index: number, sectionType?: string) => void;
  selectedInnerHtmlString: () => string;
  addSiglum: (siglum: Siglum, highlightColor: string) => void;
  setNote: (highlightColor: string) => void;
  unsetNoteWithId: (id: string) => void;
  scrollToNoteWithId: (id: string) => void;
  insertCharacter: (character: number) => void;
  insertNodeContentsFromContent: (content: string) => void;
  insertContent: (content: string) => void;
  setLink: (url: string) => void;
  removeLink: () => void;
  unsetAllMarks: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  setContent: (content: Content) => void;
  insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style, isBibliographySection: boolean) => void;
  insertBibliographies: (style: Style, otherEntries: InsertBibliography[]) => void;
}

export function useMainTextEditor(editor: Editor): UseMainTextEditorReturn {

  const currentNodeTypeName = editor.state.selection.$head.parent.type.name;

  const textNotes = useEditorState({
    editor,
    selector: ({ editor }) => {
      const marksMap: Record<string, { noteId: string; noteContent: string[] }> = {}
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'text') {
          const textNoteMarks = node.marks.filter(mark => mark.type.name === "textNote");
          if (textNoteMarks.length > 0) {
            const from = pos;
            const to = pos + node.nodeSize;
            const noteContent = editor.state.doc.textBetween(from, to, ' ');
            textNoteMarks.forEach(mark => {
              const noteId = mark.attrs?.id;
              if (noteId) {
                if (!marksMap[noteId]) {
                  marksMap[noteId] = { noteId, noteContent: [] };
                }
                marksMap[noteId].noteContent.push(noteContent);
              }
            });
          }
        }
        return true
      });

      const marks = Object.values(marksMap).map(mark => ({
        noteId: mark.noteId,
        noteContent: mark.noteContent.join(' ')
      }));

      return marks
    }
  })

  const comments = useEditorState({
    editor,
    selector: ({ editor }) => {
      const result: any[] = []
      const { from } = editor.state.selection;
      const $from = editor.state.doc.resolve(from);
      const commentMarksAtCursor = $from.marks().filter(mark => mark.type.name === "comment");
      const commentIds = commentMarksAtCursor.map(mark => mark.attrs?.id).filter(Boolean);

      if (commentIds.length === 0)
        return result;

      const commentMarkRanges = new Map<string, Array<{ from: number; to: number }>>();
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'text')
          return true;
        const commentMarks = node.marks.filter(mark => mark.type.name === "comment");
        for (const commentMark of commentMarks) {
          if (commentMark) {
            const id = commentMark.attrs?.id;
            if (id && commentIds.includes(id)) {
              const markRange = {
                from: pos,
                to: pos + node.nodeSize
              };
              if (!commentMarkRanges.has(id)) {
                commentMarkRanges.set(id, []);
              }
              commentMarkRanges.get(id)?.push(markRange);
            }
          }
        }
        return true;
      });

      for (const [id, ranges] of commentMarkRanges) {
        if (ranges.length > 0) {
          const firstMark = ranges[0];
          const lastMark = ranges.reduce(
            (a, b) => (b.to > a.to ? b : a),
            ranges[0]
          );
          const content = editor.state.doc.textBetween(firstMark.from, lastMark.to, ' ');
          result.push({ id, content });
        }
      }

      return result
    }
  })

  const bookmarks = useEditorState({
    editor,
    selector: ({ editor }) => {
      const result: any[] = []
      const { from } = editor.state.selection;
      const $from = editor.state.doc.resolve(from);
      const bookmarkMarksAtCursor = $from.marks().filter(mark => mark.type.name === "bookmark");
      const bookmarkIds = bookmarkMarksAtCursor.map(mark => mark.attrs?.id).filter(Boolean);

      if (bookmarkIds.length === 0)
        return result;

      const bookmarkMarkRanges = new Map<string, Array<{ from: number; to: number }>>();
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'text')
          return true;
        const bookmarkMarks = node.marks.filter(mark => mark.type.name === "bookmark");
        for (const bookmarkMark of bookmarkMarks) {
          if (bookmarkMark) {
            const id = bookmarkMark.attrs?.id;
            if (id && bookmarkIds.includes(id)) {
              const markRange = {
                from: pos,
                to: pos + node.nodeSize
              };
              if (!bookmarkMarkRanges.has(id)) {
                bookmarkMarkRanges.set(id, []);
              }
              bookmarkMarkRanges.get(id)?.push(markRange);
            }
          }
        }
        return true;
      });

      for (const [id, ranges] of bookmarkMarkRanges) {
        if (ranges.length > 0) {
          const firstMark = ranges[0];
          const lastMark = ranges.reduce(
            (a, b) => (b.to > a.to ? b : a),
            ranges[0]
          );
          const content = editor.state.doc.textBetween(firstMark.from, lastMark.to, ' ');
          result.push({ id, content });
        }
      }

      return result
    }
  })

  const currentSection = useEditorState({
    editor,
    selector: ({ editor }) => {
      const { from } = editor.state.selection;
      let minDistance = Infinity;
      let currentSection = '';
      editor.state.doc.nodesBetween(0, from, (node, pos) => {
        const distance = Math.abs(pos - from)
        if (node.type.name === 'sectionDivider' && distance < minDistance) {
          minDistance = distance
          currentSection = node.attrs.sectionType;
          return false;
        }
        return true;
      });
      return currentSection;
    }
  })

  const selectedNodes = useEditorState({
    editor,
    selector: (ctx) => {
      const { from, to } = ctx.editor.state.selection;
      const nodes: Node[] = [];

      ctx.editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isBlock) {
          nodes.push(node);
        }
        return false;
      });

      return nodes;
    }
  });

  const selectedNodesTypeNames = selectedNodes.map(node => node.type.name);

  const undo = useCallback(() => {
    if (editor.can().undo()) {
      editor
        .chain()
        .focus()
        .undo()
        .run()
    }
  }, [editor])

  const redo = useCallback(() => {
    const canRedo = editor.can().redo();
    if (!canRedo) return;

    editor
      .chain()
      .focus()
      .redo()
      .run()
  }, [editor])

  const forceUpdate = useCallback(() => {
    editor.view.dispatch(editor.state.tr.setMeta('forceUpdate', true))
  }, [editor])

  const setBody = useCallback((style?: Style) => {
    if (!style)
      return;

    const textAlign = (align?: NodeTextAlign | undefined) => {
      if (!align) return 'left';
      switch (align) {
        case 'left':
          return 'left';
        case 'center':
          return 'center';
        case 'right':
          return 'right';
        case 'justify':
          return 'justify';
        default:
          return 'left';
      }
    };

    const elementAttributes = {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: style.color,
      textAlign: textAlign(style.align),
      marginTop: style.marginTop || '0px',
      marginBottom: style.marginBottom || '0px',
      lineHeight: style.lineHeight || '1',
      marginLeft: '0px',
      marginRight: '0px',
    } satisfies ElementAttribute;

    editor
      .chain()
      .focus()
      .setParagraphStyle(elementAttributes)
      .run();
  }, [editor])

  const setHeading = useCallback((style: Style) => {
    const textAlign = (align: NodeTextAlign) => {
      switch (align) {
        case 'left':
          return 'left';
        case 'center':
          return 'center';
        case 'right':
          return 'right';
        case 'justify':
          return 'justify';
        default:
          return 'left';
      }
    };

    const elementAttributes = {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: style.color,
      textAlign: textAlign(style.align || 'left'),
      marginTop: style.marginTop || '0px',
      marginBottom: style.marginBottom ?? '0px',
      lineHeight: style.lineHeight ?? '1',
      marginLeft: '0px',
      marginRight: "0px",
    } satisfies ElementAttribute;

    const { from, to } = editor.state.selection;
    const blockNodes: { pos: number }[] = [];
    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isBlock && (node.type.name === 'paragraph' || node.type.name === 'heading'))
        blockNodes.push({ pos });
      return true;
    });

    blockNodes.forEach(({ pos }) => {
      const resolvedPos = editor.state.doc.resolve(pos + 1); // +1 to get inside the node
      editor
        .chain()
        .setTextSelection(resolvedPos.pos)
        .selectParentNode()
        .unsetAllMarks()
        .setHeadingStyle(style.level as 1 | 2 | 3 | 4 | 5 | 6, elementAttributes)
        .run();
    });
  }, [editor])

  const setCustomStyle = useCallback((style: Style) => {
    const chain = editor.chain().focus();

    // Set align (on parent node)
    if (style.align && style.align !== 'left') {
      chain.setTextAlign(style.align);
    }

    // Helper function to parse margin values
    const parseMarginValue = (marginValue: string | number | undefined): number => {
      if (marginValue === undefined) return 0;
      if (typeof marginValue === 'string') {
        return Number.parseFloat(marginValue.replace(/(pt|px)$/i, ''));
      }
      return marginValue;
    };

    // Set line spacing (on parent node)
    chain.setLineSpacing({
      line: style.lineHeight === undefined
        ? 1
        : Number(style.lineHeight) || 1,
      before: parseMarginValue(style.marginTop),
      after: parseMarginValue(style.marginBottom),
    });

    chain
      .setCustomStyleMark({
        styleId: style.id,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.color,
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        lineHeight: style.lineHeight || '1',
      })
      .run()
  }, [editor])

  const setFontFamily = useCallback((fontFamily: string) => {
    editor
      .chain()
      .focus()
      .setMark("textStyle", {
        fontFamily,
      })
      .run();
  }, [editor])

  const setFontSize = useCallback((fontSize: string) => {
    editor
      .chain()
      .focus()
      .setMark("textStyle", {
        fontSize,
      })
      .run();
  }, [editor])

  const boldState = useCallback((): boolean => {
    const { state } = editor;
    const { from, to } = state.selection;
    const customStyleMark = editor.getAttributes("customStyleMark");

    // Cursore position: check if the current node or parent node has bold styling
    if (from === to) {
      const $pos = state.selection.$from;
      if (editor.isActive("bold") || customStyleMark.bold) {
        return true;
      }

      // Check parent nodes for bold styling (heading o paragraph)
      for (let d = $pos.depth; d >= 0; d--) {
        const parentNode = $pos.node(d);
        if (
          (parentNode.type.name === 'heading' || parentNode.type.name === 'paragraph') &&
          // parentNode.attrs?.fontWeight === 'bold'
          parentNode.attrs?.bold === true
        ) {
          return true;
        }
      }
      return false;
    }

    // Check if the selection contains only bold text or custom styles
    let hasBold = false;
    let hasNotBold = false;

    state.doc.nodesBetween(from, to, (node, _pos, parent) => {
      if (node.isText && node.text) {
        const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");
        const isBoldMark = node.marks?.some(mark => mark.type.name === "bold");
        // const isBoldAttr = customStyleMark?.attrs.fontWeight === 'bold';
        const isBoldAttr = customStyleMark?.attrs.bold;
        let isBoldParent = false;
        // Check if the parent is a heading or paragraph with bold fontWeight
        if (
          parent &&
          (parent.type.name === 'heading' || parent.type.name === 'paragraph') &&
          // parent.attrs?.fontWeight === 'bold'
          parent.attrs?.bold === true
        ) {
          isBoldParent = true;
        }
        if (isBoldMark || isBoldAttr || isBoldParent) {
          hasBold = true;
        } else {
          hasNotBold = true;
        }
      }
    });

    if (hasBold && hasNotBold)
      return false;
    if (hasBold)
      return true;
    return false;
  }, []);

  const setBold = useCallback((bold: boolean) => {
    editor
      .chain()
      .focus()[bold ? 'setBold' : 'unsetBold']()
      .run();
  }, [editor])

  const toggleBold = useCallback(() => {
    editor
      .chain()
      .focus()
      .toggleBold()
      .run();
  }, [editor])

  const unsetBold = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetBold()
      .run();
  }, [editor])

  const italicState = useCallback((): boolean => {
    const { state } = editor;
    const { from, to } = state.selection;
    const customStyleMark = editor.getAttributes("customStyleMark");

    // Cursore position: check if the current node or parent node has italic styling
    if (from === to) {
      const $pos = state.selection.$from;
      if (editor.isActive("italic") || customStyleMark.fontStyle === 'italic') {
        return true;
      }
      for (let d = $pos.depth; d >= 0; d--) {
        const parentNode = $pos.node(d);
        if (
          (parentNode.type.name === 'heading' || parentNode.type.name === 'paragraph') &&
          parentNode.attrs?.fontStyle === 'italic'
        ) {
          return true;
        }
      }
      return false;
    }

    // Check if the selection contains only italic text or custom styles
    let hasItalic = false;
    let hasNotItalic = false;

    state.doc.nodesBetween(from, to, (node, _pos, parent) => {
      if (node.isText && node.text) {
        const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");
        const isItalicMark = node.marks?.some(mark => mark.type.name === "italic");
        const isItalicAttr = customStyleMark?.attrs.fontStyle === 'italic';
        let isItalicParent = false;
        if (
          parent &&
          (parent.type.name === 'heading' || parent.type.name === 'paragraph') &&
          parent.attrs?.fontStyle === 'italic'
        ) {
          isItalicParent = true;
        }
        if (isItalicMark || isItalicAttr || isItalicParent) {
          hasItalic = true;
        } else {
          hasNotItalic = true;
        }
      }
    });

    if (hasItalic && hasNotItalic) return false;
    if (hasItalic) return true;
    return false;
  }, []);

  const setItalic = useCallback((italic: boolean) => {
    editor
      .chain()
      .focus()[italic ? 'setItalic' : 'unsetItalic']()
      .run();
  }, [editor])

  const unsetItalic = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetItalic()
      .run();
  }, [editor])

  const setUnderline = useCallback((underline: boolean) => {
    editor
      .chain()
      .focus()[underline ? 'setUnderline' : 'unsetUnderline']()
      .run();
  }, [editor])

  const unsetUnderline = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetUnderline()
      .run();
  }, [editor])

  const setTextColor = useCallback((color: string) => {
    editor
      .chain()
      .focus()
      .setColor(color)
      .run();
  }, [editor])

  const setHighlightColor = useCallback((color: string) => {
    editor
      .chain()
      .focus()
      .setHighlight({ color })
      .run();
  }, [editor])

  const setBlockquote = useCallback((value: boolean) => {
    editor
      .chain()
      .focus()[value ? 'setBlockquote' : 'unsetBlockquote']()
      .run();
  }, [editor])

  const setTextAlignment = useCallback((alignment: Alignment) => {
    editor
      .chain()
      .focus()
      .setTextAlign(alignment)
      .run();
  }, [editor])

  const setLineSpacing = useCallback((lineSpacing: Spacing) => {
    editor
      .chain()
      .focus()
      .setLineSpacing(lineSpacing)
      .run();
  }, [editor])

  const setListStyle = useCallback((listStyle: ListStyle) => {
    // Check if selection contains sectionDividers - if so, abort
    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;

    let hasSectionDividers = false;
    state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'sectionDivider') {
        hasSectionDividers = true;
        return false;
      }
      return true;
    });

    if (hasSectionDividers) {
      console.warn('[setListStyle] Cannot apply list style: selection contains sectionDividers');
      return;
    }

    if (bulletStyleSet.has(listStyle)) {
      const bulletType = bulletStyleToType[listStyle] || 'disc';

      if (editor.isActive('bulletList')) {
        // Update existing bullet list type
        editor.chain().focus().updateAttributes('bulletList', { bulletType }).run();
      } else {
        // Create new bullet list with type
        editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { bulletType }).run();
      }
    } else if (orderedStyleSet.has(listStyle)) {
      const listType = orderedListStyleToType[listStyle] || '1';

      if (editor.isActive('orderedList')) {
        // Update existing list
        editor.chain().focus().updateAttributes('orderedList', { listType }).run();
      } else {
        // Create new list with type
        editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { listType }).run();
      }
    } else if (listStyle === '') {
      if (editor.isActive('bulletList')) {
        editor.chain().focus().toggleBulletList().run();
      } else if (editor.isActive('orderedList')) {
        editor.chain().focus().toggleOrderedList().run();
      }
    }
  }, [editor])

  const setShowNonPrintingCharacters = useCallback((visible: boolean) => {
    editor
      .chain()
      .focus()
      .setShowNonPrintingCharacters(visible);
  }, [editor])

  const setListNumbering = useCallback((numbering: number) => {
    if (editor.isActive('orderedList')) {
      editor
        .chain()
        .focus()
        .updateAttributes('orderedList', { start: numbering })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .toggleOrderedList()
        .updateAttributes('orderedList', { start: numbering })
        .run();
    }
  }, [editor])

  const setOrderedListType = useCallback((type: '1' | 'a' | 'A' | 'i' | 'I') => {
    if (editor.isActive('orderedList')) {
      // Update existing list
      editor
        .chain()
        .focus()
        .updateAttributes('orderedList', { listType: type })
        .run();
    } else {
      // Create new list with the specified type
      editor
        .chain()
        .focus()
        .toggleOrderedList()
        .updateAttributes('orderedList', { listType: type })
        .run();
    }
  }, [editor])

  const continuePreviousNumbering = useCallback(() => {
    if (!editor.isActive('orderedList')) {
      console.warn('[continuePreviousNumbering] Not in an ordered list');
      return;
    }

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    // Find the current ordered list node and its attributes
    let currentListDepth = -1;
    let currentListNode: Node | undefined = undefined;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'orderedList') {
        currentListDepth = d;
        currentListNode = $from.node(d);
        break;
      }
    }

    if (currentListDepth === -1 || !currentListNode) {
      console.warn('[continuePreviousNumbering] Could not find current list');
      return;
    }

    const currentListPos = $from.before(currentListDepth);
    const currentListType = currentListNode.attrs.listType || '1';

    // Search backwards for the previous ordered list at the same depth and same type
    let previousListStart = 1;
    let previousListItemCount = 0;
    let foundPreviousList = false;

    state.doc.nodesBetween(0, currentListPos, (node, pos) => {
      if (node.type.name === 'orderedList' && pos < currentListPos) {
        // Calculate depth from the position
        const $pos = state.doc.resolve(pos + 1); // +1 to get inside the node
        const listDepth = $pos.depth;

        const nodeListType = node.attrs.listType || '1';

        // Only consider lists at the exact same depth level and same list type
        // This matches Microsoft Word behavior: continue from the same type of list
        if (listDepth === currentListDepth && nodeListType === currentListType) {
          previousListStart = node.attrs.start || 1;
          // Count list items in this list
          previousListItemCount = 0;
          node.descendants((child) => {
            if (child.type.name === 'listItem') {
              previousListItemCount++;
            }
          });
          foundPreviousList = true;
        }
      }
      return true;
    });

    if (!foundPreviousList) {
      console.warn('[continuePreviousNumbering] No previous ordered list found with the same type');
      return;
    }

    const newStart = previousListStart + previousListItemCount;

    // Get the position inside the current list to ensure we update the right one
    const targetPos = currentListPos + 1; // +1 to be inside the list node

    // Update the current list's start attribute by setting selection inside it first
    editor
      .chain()
      .setTextSelection(targetPos)
      .updateAttributes('orderedList', { start: newStart })
      .run();

  }, [editor])

  const getSuggestedStartNumber = useCallback((): { number: number; listType: OrderedListType } | null => {
    if (!editor.isActive('orderedList')) {
      return null;
    }

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    // Find the current ordered list node and its attributes
    let currentListDepth = -1;
    let currentListNode: Node | undefined = undefined;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'orderedList') {
        currentListDepth = d;
        currentListNode = $from.node(d);
        break;
      }
    }

    if (currentListDepth === -1 || !currentListNode) {
      return null;
    }

    const currentListPos = $from.before(currentListDepth);
    const currentListType = currentListNode.attrs.listType || '1';

    // Search backwards for the previous ordered list at the same depth and same type
    let previousListStart = 1;
    let previousListItemCount = 0;
    let foundPreviousList = false;

    state.doc.nodesBetween(0, currentListPos, (node, pos) => {
      if (node.type.name === 'orderedList' && pos < currentListPos) {
        // Calculate depth from the position
        const $pos = state.doc.resolve(pos + 1); // +1 to get inside the node
        const listDepth = $pos.depth;

        const nodeListType = node.attrs.listType || '1';

        // Only consider lists at the exact same depth level and same list type
        if (listDepth === currentListDepth && nodeListType === currentListType) {
          previousListStart = node.attrs.start || 1;
          previousListItemCount = 0;
          node.descendants((child) => {
            if (child.type.name === 'listItem') {
              previousListItemCount++;
            }
          });
          foundPreviousList = true;
        }
      }
      return true;
    });

    // If no previous list found, return current list info with start = 1
    if (!foundPreviousList) {
      return {
        number: 1,
        listType: currentListType as '1' | 'a' | 'A' | 'i' | 'I'
      };
    }

    return {
      number: previousListStart + previousListItemCount,
      listType: currentListType as '1' | 'a' | 'A' | 'i' | 'I'
    };
  }, [editor])

  const setStrikeThrough = useCallback((value: boolean) => {
    editor
      .chain()
      .focus()[value ? 'setStrike' : 'unsetStrike']()
      .run();
  }, [editor])

  const setPageBreak = useCallback((style) => {
    editor.commands.setPageBreak(style);
  }, [editor])

  const setSuperscript = useCallback((value: boolean) => {
    editor
      .chain()
      .focus()
      .unsetSubscript()
      .run()

    editor
      .chain()
      .focus()[value ? 'setSuperscript' : 'unsetSuperscript']()
      .run();
  }, [editor])

  const unsetSuperscript = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetSuperscript()
      .run();
  }, [editor])

  const setSubscript = useCallback((value: boolean) => {
    editor
      .chain()
      .focus()
      .unsetSuperscript()
      .run();

    editor
      .chain()
      .focus()[value ? 'setSubscript' : 'unsetSubscript']()
      .run();
  }, [editor])

  const unsetSubscript = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetSubscript()
      .run();
  }, [editor])

  const setLigature = useCallback((ligature: LigatureType) => {
    editor
      .chain()
      .focus()
      .setLigature(ligature)
      .run();
  }, [editor])

  const increaseIndent = useCallback(() => {
    editor
      .chain()
      .focus()
      .increaseIndent()
      .run();
  }, [editor])

  const decreaseIndent = useCallback(() => {
    editor
      .chain()
      .focus()
      .decreaseIndent()
      .run();
  }, [editor])

  const increaseCharacterSpacing = useCallback(() => {
    editor
      .chain()
      .focus()
      .increaseCharacterSpacing()
      .run();
  }, [editor])

  const decreaseCharacterSpacing = useCallback(() => {
    editor
      .chain()
      .focus()
      .decreaseCharacterSpacing()
      .run();
  }, [editor])

  const setCase = useCallback((caseType: CasingType) => {
    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;

    let commandChain = editor.chain();

    // Helper to convert text to Start Case
    const toStartCase = (text: string): string => {
      if (!text) return '';
      // Split on sentence-ending punctuation (., ?, !), keeping the delimiter
      const segments = text.split(/([.?!])/);
      let result = '';
      for (let i = 0; i < segments.length; i += 2) {
        let segment = segments[i];
        if (segment.trim().length) {
          segment = segment.trimStart();
          const diff = segments[i].length - segment.length;
          segment = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
          // If the segment was trimmed, add spaces to match original length
          segment = ((diff > 0) ? ' '.repeat(diff) : '') + segment;
        }
        result += segment;
        // Add the punctuation if it exists
        if (segments[i + 1]) {
          result += segments[i + 1];
        }
      }
      return result;
    }

    // Helper to transform text according to caseType
    const transformText = (caseType: string, text: string): string => {
      if (caseType === 'all-caps') {
        return text.toUpperCase();
      } else if (caseType === 'title-case') {
        return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      } else if (caseType === 'start-case') {
        return toStartCase(text);
      } else {
        return text.toLowerCase();
      }
    }

    // Apply transformation to all text nodes in selection, preserving marks/nodes
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText) {
        const nodeFrom = Math.max(pos, from);
        const nodeTo = Math.min(pos + node.nodeSize, to);
        const sliceFrom = nodeFrom - pos;
        const sliceTo = nodeTo - pos;
        const original = node.text?.slice(sliceFrom, sliceTo) ?? '';
        const transformed = transformText(caseType, original);

        // Create a position object for the text node
        const position = {
          from: nodeFrom,
          to: nodeTo
        }

        // Replace only the selected part of the text node
        commandChain = commandChain.insertContentAt(
          position,
          transformed
        ).setTextSelection(position);
        // If you want to support small-caps, implement it via a mark or style here.
        if (caseType === 'small-caps') {
          // Apply small-caps by setting the fontVariant property via textStyle mark
          commandChain = commandChain.setMark('textStyle', { ...editor.getAttributes('textStyle'), fontVariant: 'small-caps' });
        } else {
          // Remove small-caps by unsetting fontVariant from textStyle mark
          const attrs = { ...editor.getAttributes('textStyle') };
          delete attrs.fontVariant;
          commandChain = commandChain.unsetMark('textStyle').setMark('textStyle', attrs);
        }
      }
    });

    return commandChain
      .setTextSelection({
        from,
        to
      })
      .run();
  }, [editor])

  const addBookmark = useCallback((color: string) => {
    const selection = editor.state.selection;
    if (selection.empty)
      return

    editor
      .chain()
      .focus()
      .setBookmark({ highlightColor: color })
      .run();
  }, [editor])

  const scrollToBookmark = useCallback((id: string) => {
    const positions: { start: number, end: number }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.marks?.some(mark => mark.type.name === "bookmark" && mark.attrs.id === id)) {
        positions.push({
          start: pos,
          end: pos + node.nodeSize
        });
      }
    });

    let pos: { start: number, end: number } | null = null
    if (positions.length > 0) {
      const minStart = Math.min(...positions.map(p => p.start));
      const maxEnd = Math.max(...positions.map(p => p.end));
      pos = { start: minStart, end: maxEnd };
    }

    if (!pos)
      return;

    editor.commands.focus();
    editor.commands.setTextSelection({ from: pos.start, to: pos.end });
    editor.commands.scrollIntoView();
  }, [editor])

  const addSiglum = useCallback((siglum: Siglum, highlightColor: string) => {
    if (currentSection === 'toc')
      return

    const node = editor.schema.nodeFromJSON(siglum.value.content)
    const manuscriptsNode = siglum.manuscripts.contentHtml

    const paragraphs: Node[] = [];
    node.descendants((node: Node) => {
      if (node?.type?.name === 'paragraph') {
        paragraphs.push(node);
      }
    });

    const firstParagraph = paragraphs[0];
    const content = firstParagraph.content;

    const siglumNodeList: SiglumNode[] = []
    content.forEach((node) => {
      if (node.type && node.text && node.type.name === 'text') {
        const textStyleAttrs = node.marks.find(mark => mark.type.name === 'textStyle')?.attrs
        const siglumNode = {
          content: node.text,
          style: {
            fontFamily: textStyleAttrs?.fontFamily ?? 'Times New Roman',
            fontSize: textStyleAttrs?.fontSize ?? '12pt',
            superscript: node.marks?.some(mark => mark.type.name === 'superscript'),
            subscript: node.marks?.some(mark => mark.type.name === 'subscript'),
            bold: node.marks?.some(mark => mark.type.name === 'bold'),
            italic: node.marks?.some(mark => mark.type.name === 'italic'),
            underline: node.marks?.some(mark => mark.type.name === 'underline'),
          }
        } satisfies SiglumNode as SiglumNode
        siglumNodeList.push(siglumNode)
      }
    })

    editor
      .chain()
      .focus()
      .addSiglumNodes(siglumNodeList, highlightColor, manuscriptsNode)
      .run()
  }, [editor, currentSection])

  const setNote = useCallback((highlightColor: string) => {
    editor
      .chain()
      .focus()
      .setTextNote({ highlightColor })
      .run()
  }, [editor])

  const unsetNoteWithId = useCallback((id: string) => {
    const transaction = editor.state.tr.setMeta('addToHistory', false)

    editor.state.doc.descendants((node: any, pos: number) => {
      const noteMarks = node.marks?.filter((mark: any) =>
        mark.type.name === 'textNote' && mark.attrs?.id === id
      ) ?? []

      if (noteMarks.length === 0) return

      for (const mark of noteMarks) {
        transaction.removeMark(
          pos,
          pos + node.nodeSize,
          mark
        )
      }
    })

    editor.view.dispatch(transaction)
  }, [editor])

  const scrollToNoteWithId = useCallback((id: string) => {
    const positions: {
      start: number,
      end: number
    }[] = [];

    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.marks?.some(mark => mark.type.name === "textNote" && mark.attrs.id === id)) {
        positions.push({
          start: pos,
          end: pos + node.nodeSize
        });
      }
    });

    let pos: {
      start: number,
      end: number,
    } | null = null

    if (positions.length > 0) {
      const minStart = Math.min(...positions.map(p => p.start));
      const maxEnd = Math.max(...positions.map(p => p.end));
      pos = { start: minStart, end: maxEnd };
    }

    if (!pos)
      return;

    editor.commands.focus();
    editor.commands.setTextSelection({ from: pos.start, to: pos.end });
    editor.commands.scrollIntoView();
  }, [editor])

  const addComment = useCallback((color: string) => {
    const selection = editor.state.selection;
    if (selection.empty)
      return

    editor
      .chain()
      .focus()
      .setComment({ highlightColor: color })
      .run();
  }, [editor])

  const scrollToComment = useCallback((id: string) => {
    const positions: { start: number, end: number }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.marks?.some(mark => mark.type.name === "comment" && mark.attrs.id === id)) {
        positions.push({
          start: pos,
          end: pos + node.nodeSize
        });
      }
    });

    let pos: { start: number, end: number } | null = null
    if (positions.length > 0) {
      const minStart = Math.min(...positions.map(p => p.start));
      const maxEnd = Math.max(...positions.map(p => p.end));
      pos = { start: minStart, end: maxEnd };
    }

    if (!pos)
      return;

    editor.commands.focus();
    editor.commands.setTextSelection({ from: pos.start, to: pos.end });
    editor.commands.scrollIntoView();
  }, [editor])

  const getCommentsIds = useCallback(() => {
    let commentsIds: string[] = [];
    editor.state.doc.descendants((node: any) => {
      const marks = node.marks.filter(mark => mark.type.name === 'comment');
      const data = marks.map(mark => mark.attrs.id);
      commentsIds.push(...data)
      return true;
    });
    return commentsIds;
  }, [editor])

  const scrollToSection = useCallback((id: string, position: 'top' | 'bottom' = 'top') => {
    const _id = id ?? "toc"

    function findNodePositionByAttribute(editor: Editor): number[] {
      const positions: number[] = [];
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'sectionDivider' && node.attrs?.sectionType === _id) {
          positions.push(pos);
        }
      });
      return positions;
    }

    const positions = findNodePositionByAttribute(editor);
    if (positions.length === 0) {
      console.warn(`No section found with type: ${_id}`);
      return;
    }

    const sectionStartPos = Math.min(...positions);
    let targetPos = sectionStartPos + 1; // Default to top of section

    // If position is 'bottom', find the end of the section
    if (position === 'bottom') {
      let sectionEndPos = editor.state.doc.content.size;

      // Find all section dividers after the current section
      const nextSectionPositions: number[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (pos > sectionStartPos && node.type.name === 'sectionDivider') {
          nextSectionPositions.push(pos);
        }
      });

      // If there's a next section, use its position, otherwise use document end
      if (nextSectionPositions.length > 0) {
        sectionEndPos = Math.min(...nextSectionPositions);
      }

      // Find the last content position in the section by searching backwards
      let lastContentPos = sectionStartPos + 1;
      editor.state.doc.nodesBetween(sectionStartPos, sectionEndPos, (node, pos) => {
        // Skip the section divider itself
        if (node.type.name !== 'sectionDivider' && pos > sectionStartPos) {
          // Update to the furthest position we've seen
          lastContentPos = Math.max(lastContentPos, pos + node.nodeSize - 1);
        }
      });

      targetPos = lastContentPos;
    }

    const coords = editor.view.coordsAtPos(targetPos);
    const element = editor.view.dom;

    // For bottom position, we want to align the bottom of the content with the viewport
    let scrollTop: number;
    if (position === 'bottom') {
      scrollTop = coords.bottom - element.getBoundingClientRect().top + element.scrollTop - element.clientHeight;
    } else {
      scrollTop = coords.top - element.getBoundingClientRect().top + element.scrollTop;
    }

    element.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });

    setTimeout(() => {
      editor.commands.setTextSelection(targetPos);
      editor.commands.focus();
    }, 600);
  }, [editor])

  const unsetCharacterSpacing = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetCharacterSpacing()
      .run();
  }, [editor])

  const scrollToHeadingIndex = useCallback((index: number, sectionType?: string) => {
    // Se non è specificata una sezione, usa il comportamento originale
    const targetSection = sectionType || "maintext";

    // Trova le posizioni degli heading nella sezione specificata
    let positions: number[] = [];
    let sectionStartPos = 0;
    let sectionEndPos = 0;
    let foundSection = false;

    // Prima trova i limiti della sezione nel documento
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'sectionDivider' && node.attrs?.sectionType === targetSection) {
        sectionStartPos = pos;
        foundSection = true;
        return false; // Ferma la ricerca al primo match
      }
      return true;
    });

    if (!foundSection) {
      console.warn(`Section ${targetSection} not found`);
      return;
    }

    // Trova la fine della sezione
    let foundEnd = false;
    editor.state.doc.descendants((node, pos) => {
      if (pos > sectionStartPos && node.type.name === 'sectionDivider' && !foundEnd) {
        sectionEndPos = pos;
        foundEnd = true;
        return false;
      }
      return true;
    });

    if (!foundEnd) {
      sectionEndPos = editor.state.doc.content.size;
    }

    // Ora cerca TUTTI gli heading nella sezione specificata
    editor.state.doc.nodesBetween(sectionStartPos, sectionEndPos, (node, pos) => {
      if (node.type.name === 'heading') {
        positions.push(pos);
      }
      return true;
    });

    if (positions.length === 0) {
      console.warn(`No headings found in section ${targetSection}`);
      return;
    }

    if (index >= positions.length) {
      console.warn(`Index ${index} out of bounds for section headings (found ${positions.length} headings)`);
      return;
    }

    const position = positions[index];
    const headingNode = editor.state.doc.nodeAt(position);
    const safeStart = Math.min(position + 1, editor.state.doc.content.size);
    const safeEnd = headingNode ? Math.min(position + headingNode.nodeSize - 1, editor.state.doc.content.size) : safeStart;

    editor
      .chain()
      .focus()
      .setTextSelection({
        from: safeStart,
        to: Math.max(safeStart, safeEnd)
      })
      .run();

    const resolveScrollableContainer = (node: HTMLElement | null): HTMLElement | null => {
      let current: HTMLElement | null = node;
      while (current) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const isScrollable = current.scrollHeight > current.clientHeight + 2;
        if (isScrollable && (overflowY === 'auto' || overflowY === 'scroll')) {
          return current;
        }
        current = current.parentElement;
      }
      return node;
    };

    window.requestAnimationFrame(() => {
      try {
        const element = editor.view.dom as HTMLElement | null;
        if (!element) {
          return;
        }

        const coords = editor.view.coordsAtPos(safeStart);
        const scrollContainer = resolveScrollableContainer(element) ?? element;
        const containerRect = scrollContainer.getBoundingClientRect();
        const SCROLL_OFFSET = 32;
        const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const targetTop = coords.top - containerRect.top + scrollContainer.scrollTop - SCROLL_OFFSET;
        const nextScrollTop = Math.min(Math.max(0, targetTop), Math.max(0, maxScrollTop));

        scrollContainer.scrollTo({
          top: nextScrollTop,
          behavior: 'smooth'
        });

        editor.emit('suppressBubbleToolbar');
      } catch (error) {
        console.warn('[scrollToHeadingIndex] Failed to align heading', error);
      }
    });
  }, [editor])

  const selectedInnerHtmlString = useCallback(() => {
    const { from, to } = editor.state.selection;
    if (from === to)
      return "";

    const fragment = editor.state.selection.content();
    const domSerializer = editor.schema.cached.domSerializer;
    const temp = document.createElement('div');
    const slice = fragment.content;
    domSerializer.serializeFragment(slice, { document }, temp);
    const selectedHtml = temp.innerHTML;

    return selectedHtml
  }, [editor])

  const selectedText = useCallback(() => {
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const text = editor.state.doc.textBetween(from, to, ' ');
    return text
  }, [editor])

  const selectedContentJSON = useCallback(() => {
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const selectedContent = editor.state.doc.cut(from, to).toJSON();
    return selectedContent
  }, [editor])

  const selectedContentString = useCallback(() => {
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const selectedContent = editor.state.doc.cut(from, to).toString()
    return selectedContent
  }, [editor])

  // const setTextSelection = useCallback((currentPosition: TTextPosition) => {
  //   editor.commands.setTextSelection(currentPosition);
  // }, [editor])

  const insertCharacter = useCallback((character: number) => {
    editor
      .chain()
      .focus()
      .insertContent(String.fromCharCode(character))
      .run();
  }, [editor])

  const insertNodeContentsFromContent = useCallback((content: string) => {
    const extensions = editor.extensionManager.extensions
    const json = generateJSON(content, extensions);
    const contentList = json.content
    if (contentList.length === 0) return;
    const contentToAdd: any[] = []

    contentList.forEach(item => {
      const contentToAddItem = item.content
      contentToAdd.push(contentToAddItem)
    })

    const flatContent = contentToAdd.flat()

    editor
      .chain()
      .focus()
      .insertContent(flatContent)
      .run()
  }, [editor])

  const insertContent = useCallback((content: string) => {
    editor
      .chain()
      .focus()
      .insertContent(content)
      .run();
  }, [editor])

  const setLink = useCallback((url: string) => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor])

  const removeLink = useCallback(() => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
  }, [editor])

  const unsetAllMarks = useCallback(() => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .run();
  }, [editor])

  const selectAll = useCallback(() => {
    if (editor && editor.isFocused) {
      editor.commands.selectAll();
    }
  }, [editor])

  const deselectAll = useCallback(() => {
    if (editor && editor.isFocused) {
      editor.commands.blur();
    }
  }, [editor])

  const setContent = useCallback((content: Content) => {
    editor
      .chain()
      .setMeta('addToHistory', false)
      .setContent(content, true)
      .run();
  }, [editor])

  const insertCitation = useCallback((citationStyle: CITATION_STYLES, citation: BibReference, style: Style, isBibliographySection: boolean) => {
    if (!citation.id)
      return

    editor
      .chain()
      .focus()
      .setCitation(citation, citationStyle, style)
      .insertContent(generateInlineCitationText(citation, citationStyle, isBibliographySection), {
        updateSelection: true
      })
      .insertContent(' ', {
        updateSelection: true
      })
      .run();
  }, [editor])

  const insertBibliographies = useCallback((style: Style, otherEntries: InsertBibliography[]) => {
    const entriesMap: { [key: string]: InsertBibliography } = otherEntries.reduce((map, entry) => {
      const key = `${entry.bib.id}`;
      if (map[key]) {
        map[key].citationStyle = entry.citationStyle;
        return map;
      }
      map[key] = entry;
      return map;
    }, {} as { [key: string]: InsertBibliography });
    const introductionTextPosition = getSectionRange(editor.state.doc, 'introduction');

    const criticalTextPosition = getSectionRange(editor.state.doc, 'maintext');

    const bibliographyTextPosition = getSectionRange(editor.state.doc, 'bibliography');

    if (!criticalTextPosition || !bibliographyTextPosition) return

    const editorChain = editor.chain().focus();

    const currentPos = editor.state.selection.from;

    //.setTextSelection(bibliographyTextPosition).deleteSelection();
    // bibliographyTextPosition.to = bibliographyTextPosition.from;

    editor.state.doc.nodesBetween(introductionTextPosition ? introductionTextPosition.from : criticalTextPosition.from, criticalTextPosition.to, (node) => {
      if (node.isText) {
        const { marks } = node;
        const mark = marks.find(mark => mark.type.name === 'citation');
        if (mark && mark.attrs.bibliography) {
          const { bibliography, citationStyle } = mark.attrs;
          const key = `${bibliography.id}`;
          if (entriesMap[key]) {
            entriesMap[key].citationStyle = citationStyle;
            return true;
          }
          entriesMap[key] = { bib: bibliography, citationStyle };
        }
      }
      return true
    });

    const finalEntries = sortBibliographicEntries(Object.values(entriesMap));

    for (const entry of finalEntries) {
      const text = generateInlineCitationText(entry.bib, entry.citationStyle, true);
      editorChain.insertContentAt(currentPos, {
        type: 'paragraph',
        attrs: style,
        text: ''
      }).setCitation(entry.bib, entry.citationStyle, style).insertContent(text, {
        updateSelection: true
      });
    }
    editorChain.run();
  }, [editor])

  return {
    textNotes,
    comments,
    bookmarks,
    currentSection,
    currentNodeTypeName,
    selectedNodes,
    selectedNodesTypeNames,
    undo,
    redo,
    forceUpdate,
    setBody,
    setHeading,
    setCustomStyle,
    setFontFamily,
    setFontSize,
    boldState,
    setBold,
    toggleBold,
    unsetBold,
    italicState,
    setItalic,
    unsetItalic,
    setUnderline,
    unsetUnderline,
    setTextColor,
    setHighlightColor,
    setBlockquote,
    setTextAlignment,
    setLineSpacing,
    setListStyle,
    setShowNonPrintingCharacters,
    setListNumbering,
    setOrderedListType,
    continuePreviousNumbering,
    getSuggestedStartNumber,
    setStrikeThrough,
    setPageBreak,
    setSuperscript,
    unsetSuperscript,
    setSubscript,
    unsetSubscript,
    setLigature,
    setCase,
    increaseIndent,
    decreaseIndent,
    increaseCharacterSpacing,
    decreaseCharacterSpacing,
    unsetCharacterSpacing,
    addBookmark,
    scrollToBookmark,
    addComment,
    scrollToComment,
    getCommentsIds,
    scrollToSection,
    scrollToHeadingIndex,
    selectedInnerHtmlString,
    selectedText,
    selectedContentJSON,
    selectedContentString,
    addSiglum,
    setNote,
    unsetNoteWithId,
    scrollToNoteWithId,
    insertCharacter,
    insertNodeContentsFromContent,
    insertContent,
    setLink,
    removeLink,
    unsetAllMarks,
    selectAll,
    deselectAll,
    setContent,
    insertCitation,
    insertBibliographies,
  };
}
