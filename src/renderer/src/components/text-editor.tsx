import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Button from './ui/button';
import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { defaultEditorConfig } from '@/lib/tiptap/editor-configs';
import { HistoryState } from '@/pages/editor/hooks';
import { useEditorHistory } from '@/hooks/use-editor-history';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { extractSectionsFromGlobalText } from '@/lib/tocTreeMapper';
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next';
import { ScissorsIcon, CopyIcon, ClipboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LigatureType } from '@/lib/tiptap/ligature-mark';

export interface EditorData {
  json: JSONContent;
  html: string;
  text: string;
  characters: number;
  words: number;
}

export interface HTMLTextEditorElement {
  setHeadingLevel: (level: number) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
  setUnderline: (underline: boolean) => void;
  setTextColor: (color: string) => void;
  setHighlightColor: (color: string) => void;
  setBlockquote: (isBlockquote: boolean) => void;
  setTextAlignment: (alignment: string) => void;
  setLineSpacing: (lineSpacing: Spacing) => void;
  setListStyle: (bulletStyle: BulletStyle) => void;
  toggleNonPrintingCharacters: () => void;
  setListNumbering: (numbering: number) => void;
  continuePreviousNumbering: () => void;
  setStrikeThrough: (value: boolean) => void;
  setSuperscript: (superscript: boolean) => void;
  setSubscript: (subscript: boolean) => void;
  undo: (action?: HistoryAction) => void;
  redo: () => void;
  addBookmark: () => void;
  unsetBookmark: () => void;
  deleteBookmarks: (bookmarks: Bookmark[]) => void;
  scrollToBookmark: (id: string) => void;
  addComment: () => void;
  unsetComment: () => void;
  deleteComments: (comments: AppComment[]) => void;
  scrollToComment: (id: string) => void;
  scrollToSection: (id: string) => void;
  setLigature: (ligature: LigatureType) => void;
  setCapitalization: (capitalization: string) => void;
  getCapitalization: () => string;
  increaseIndent: () => void;
  decreaseIndent: () => void;
  increaseCharacterSpacing: () => void;
  decreaseCharacterSpacing: () => void;
  unsetCharacterSpacing: () => void;
  scrollToHeading: (id: string) => void;
  focus: () => void;
  chain: () => any;
  getState: () => any;
  getJSON: () => any;
  getHTML: () => string | undefined;
  setJSON: (data?: any) => void;
  state: EditorData | undefined;
}

interface TextEditorProps {
  className?: string;
  isMainText?: boolean;
  bubbleToolbarItems?: BubbleToolbarItem[];
  canEdit?: boolean;
  onUpdate?: (data: EditorData) => void;
  onEmphasisStateChange?: (emphasisState: EmphasisState) => void;
  onHistoryStateChange?: (historyState: HistoryState) => void;
  onSelectedContentChange?: (selectedContent: string) => void;
  onCanUndo?: (value: boolean) => void;
  onCanRedo?: (value: boolean) => void;
  onSelectionMarks?: (selectedMarks: any[]) => void;
  bookmarkHighlighted?: boolean;
  onChangeBookmarks?: (bookmarks: any[]) => void;
  onChangeComments?: (comments: any[]) => void;
  onChangeBookmark?: (bookmark: any) => void;
  commentHighlighted?: boolean;
  onChangeComment?: (comment: any) => void;
  onSelectedContent?: (selectedContent: string) => void;
  onFocusEditor?: () => void;
  onBookmarkStateChange?: (active: boolean) => void;
  onCommentStateChange?: (active: boolean) => void;
  onBookmarkCreated?: (id: string, content: string) => void;
  onCommentCreated?: (id: string, content: string) => void;
  onCurrentSection?: (section?: string) => void;
}

const TextEditor = forwardRef(({
  className,
  isMainText = false,
  bubbleToolbarItems,
  canEdit = true,
  onUpdate,
  onEmphasisStateChange,
  onHistoryStateChange,
  onSelectedContentChange,
  onCanUndo,
  onCanRedo,
  bookmarkHighlighted,
  onChangeBookmarks,
  onChangeComments,
  onSelectionMarks,
  onChangeBookmark,
  commentHighlighted,
  onChangeComment,
  onSelectedContent,
  onFocusEditor,
  onBookmarkStateChange,
  onCommentStateChange,
  onBookmarkCreated,
  onCommentCreated,
  onCurrentSection,
}: TextEditorProps,
  ref: ForwardedRef<HTMLTextEditorElement>) => {

  useImperativeHandle(ref, () => {
    return {
      setHeadingLevel: (level: number) => {
        if (!editor) return;
        if (level < 1) {
          editor?.chain().focus().setParagraph().run();
          editorHistory.trackHistoryActions("paragraphStyle", `Changed heading level to pharagraph`);
        } else {
          editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).unsetMark("textStyle").run()
          editorHistory.trackHistoryActions("paragraphStyle", `Changed heading level to ${level}`);
        }
      },
      setFontFamily: (fontFamily: string) => {
        if (!editor) return;
        editor?.chain().focus().setFontFamily(fontFamily).run();
        editorHistory.trackHistoryActions("characterStyle", `Changed font family to ${fontFamily}`);
      },
      setFontSize: (fontSize: number) => {
        if (!editor) return;
        editor.chain().focus().setMark("textStyle", { fontSize: `${fontSize}pt` }).run();
        editorHistory.trackHistoryActions("characterStyle", `Changed font size to ${fontSize}pt`);
      },
      setBold: (bold: boolean) => {
        if (!editor) return;
        editor.chain().focus()[bold ? 'setBold' : 'unsetBold']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied bold style`);
      },
      setItalic: (italic: boolean) => {
        if (!editor) return;
        editor.chain().focus()[italic ? 'setItalic' : 'unsetItalic']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied italic style`);
      },
      setUnderline: (underline: boolean) => {
        if (!editor) return;
        editor.chain().focus()[underline ? 'setUnderline' : 'unsetUnderline']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied underline style`);
      },
      setTextColor: (color: string) => {
        if (!editor) return;
        editor.chain().focus().setColor(color).run();
        editorHistory.trackHistoryActions("characterStyle", `Applied text color`);
      },
      setHighlightColor: (color: string) => {
        if (!editor) return;
        editor.chain().focus().setHighlight({ color: color }).run();
        editorHistory.trackHistoryActions("characterStyle", `Applied highlight color`);
      },
      setBlockquote: (isBlockquote: boolean) => {
        if (!editor) return;
        editor.chain().focus()[isBlockquote ? 'setBlockquote' : 'unsetBlockquote']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied blockquote style`);
      },
      setTextAlignment: (alignment: string) => {
        if (!editor) return;
        editor.chain().focus().setTextAlign(alignment).run();
        editorHistory.trackHistoryActions("characterStyle", `Applied font alignment`);
      },
      setLineSpacing: (lineSpacing: Spacing) => {
        if (!editor) return;
        editor.chain().focus().setLineSpacing(lineSpacing).run();
        editorHistory.trackHistoryActions("characterStyle", `Applied line spacing`);
      },
      setListStyle: (bulletStyle: BulletStyle) => {
        const { type, style } = bulletStyle;
        if (type === 'BULLET') {
          if (editor?.isActive('bulletedList')) {
            editor?.chain().focus().updateAttributes('bulletedList', { listStyle: style }).run();
          } else {
            editor?.chain().focus().toggleBulletedList(style).run();
          }
        } else if (type === 'ORDER') {
          if (editor?.isActive('orderList')) {
            editor?.chain().focus().updateAttributes('orderList', { listStyle: style }).run();
          } else {
            editor?.chain().focus().toggleOrderList(style).run();
          }
        } else if (editor?.isActive('bulletedList')) {
          editor?.chain().focus().unsetBulletList().run();
        } else if (editor?.isActive('orderList')) {
          editor?.chain().focus().unsetOrderList().run();
        }
        editorHistory.trackHistoryActions("characterStyle", `Applied ${type.toLowerCase()} list with ${style} style`);
      },
      toggleNonPrintingCharacters: () => {
        if (!editor) return;

        editor?.chain().focus().toggleNonPrintingCharacters();
      },
      setListNumbering: (numbering: number) => {
        if (!editor) return;

        if (editor.isActive('orderList')) {
          editor.chain().focus().updateAttributes('orderList', { start: numbering }).run();
        } else {
          editor.chain().focus().toggleOrderList('decimal').updateAttributes('orderList', { start: numbering }).run();
        }
        editorHistory.trackHistoryActions("characterStyle", `Applied list numbering resuming from ${numbering}`);
      },
      continuePreviousNumbering: () => {
        if (!editor) return;

        editor.chain().focus().continueFromPreviousNumber().run();
        editorHistory.trackHistoryActions("characterStyle", `Continued previous numbering`);
      },
      setStrikeThrough: (value: boolean) => {
        if (!editor) return;
        editor.chain().focus()[value ? 'setStrike' : 'unsetStrike']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied strikethrough style`);
      },
      setSuperscript: (superscript: boolean) => {
        if (!editor) return;
        editor.chain().focus()[superscript ? 'setSuperscript' : 'unsetSuperscript']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied superscript style`);

      },
      setSubscript: (subscript: boolean) => {
        if (!editor) return;
        editor.chain().focus()[subscript ? 'setSubscript' : 'unsetSubscript']().run();
        editorHistory.trackHistoryActions("characterStyle", `Applied subscript style`);
      },
      undo: (action?: HistoryAction) => {
        if (action && action.id) {
          editorHistory.restoreToAction(action)
          editor?.commands.setContent(action.content, false);
        } else if (editor?.can().undo()) {
          editor?.chain().focus().undo().run()
        }
      },
      redo: () => {
        const canRedo = editor?.can().redo();
        if (!canRedo) return;
        editor?.chain().focus().redo().run()
      },

      // BOOKMARKS
      addBookmark: () => {
        if (!editor) return;

        editor.chain().focus().unsetHighlight().run();

        const bookmarkColor = bookmarkHighlighted ? '#E5E5E5' : '#ffffff';
        const id = uuidv4();
        editor.chain().focus().setBookmark({ id: id, color: bookmarkColor }).run();

        const { from, to } = editor.state.selection;
        const selectedContent = editor.state.doc.textBetween(from, to, ' ');

        if (selectedContent.length > 0) {
          onBookmarkCreated?.(id, selectedContent)
        }
      },
      unsetBookmark: () => {
        if (!editor) return;
        editor.chain().focus().unsetBookmark().run();
      },
      deleteBookmarks: (bookmarks: Bookmark[]) => {
        if (!editor) return;
        const bookmarkIds = bookmarks.map(bookmark => bookmark.id)
        deleteMarks(editor, bookmarkIds, 'bookmark')
      },
      scrollToBookmark: (id: string) => {
        if (!editor) return;

        function findNodePositionByAttribute(editor: Editor, nodeTypeName: string, attrValue: string): { start: number, end: number }[] {
          const positions: { start: number, end: number }[] = [];
          editor.state.doc.descendants((node: any, pos: number) => {
            if (node.marks?.some(mark => mark.type.name === nodeTypeName && mark.attrs.id === attrValue)) {
              positions.push({
                start: pos,
                end: pos + node.nodeSize
              });
            }
          });
          return positions;
        }

        const positions = findNodePositionByAttribute(editor, 'bookmark', id);

        let pos: { start: number, end: number } | null = null
        if (positions.length > 0) {
          const minStart = Math.min(...positions.map(p => p.start));
          const maxEnd = Math.max(...positions.map(p => p.end));
          pos = { start: minStart, end: maxEnd };
        }

        if (!pos) return;

        editor?.commands.scrollIntoView();

        setTimeout(() => {
          editor?.commands.setTextSelection({ from: pos.start, to: pos.end });
          editor?.commands.focus();
        }, 100);
      },

      // COMMENTS
      addComment: () => {
        if (!editor) return;

        editor.chain().focus().unsetHighlight().run();

        const commentColor = commentHighlighted ? '#A9BFFF' : '#ffffff';

        const id = uuidv4();
        editor.chain().focus().setComment({ id: id, color: commentColor }).run();

        const { from, to } = editor.state.selection;
        const selectedContent = editor.state.doc.textBetween(from, to, ' ');

        if (selectedContent.length > 0) {
          onCommentCreated?.(id, selectedContent)
        }
      },
      unsetComment: () => {
        if (!editor) return;
        editor.chain().focus().unsetComment().run();
      },
      deleteComments: (comments: AppComment[]) => {
        if (!editor) return;
        const commentIds = comments.map(comment => comment.id)
        deleteMarks(editor, commentIds, 'comment')
      },
      scrollToComment: (id: string) => {
        if (!editor) return;

        function findNodePositionByAttribute(editor: Editor, nodeTypeName: string, attrValue: string): { start: number, end: number }[] {
          const positions: { start: number, end: number }[] = [];
          editor.state.doc.descendants((node: any, pos: number) => {
            if (node.marks?.some(mark => mark.type.name === nodeTypeName && mark.attrs.id === attrValue)) {
              positions.push({
                start: pos,
                end: pos + node.nodeSize
              });
            }
          });
          return positions;
        }

        const positions = findNodePositionByAttribute(editor, 'comment', id);

        let pos: { start: number, end: number } | null = null
        if (positions.length > 0) {
          const minStart = Math.min(...positions.map(p => p.start));
          const maxEnd = Math.max(...positions.map(p => p.end));
          pos = { start: minStart, end: maxEnd };
        }

        if (!pos) return;

        editor?.commands.scrollIntoView();

        setTimeout(() => {
          editor?.commands.setTextSelection({ from: pos.start, to: pos.end });
          editor?.commands.focus();
        }, 100);
      },
      scrollToSection: (id: string) => {
        if (!editor) return;
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

        const pos = Math.min(...positions);

        editor?.commands.setTextSelection(pos + 1);
        editor?.commands.focus();
        setTimeout(() => {
          editor?.commands.scrollIntoView();
        }, 50);
      },
      setLigature: (ligature: LigatureType) => {
        if (!editor) return;
        editor.chain().focus().setLigature(ligature).run();
      },
      setCapitalization: (capitalization: string) => {
        if (!editor) return;
        editor.chain().focus().setCapitalization(capitalization).run();
      },
      getCapitalization: () => {
        return editor?.getAttributes("capitalization")?.style || 'none';
      },
      increaseIndent: () => {
        editor?.chain().focus().increaseIndent().run();
      },
      decreaseIndent: () => {
        editor?.chain().focus().decreaseIndent().run();
      },
      increaseCharacterSpacing: () => {
        editor?.chain().focus().increaseCharacterSpacing().run();
      },
      decreaseCharacterSpacing: () => {
        editor?.chain().focus().decreaseCharacterSpacing().run();
      },
      unsetCharacterSpacing: () => {
        editor?.chain().focus().unsetCharacterSpacing().run();
      },
      scrollToHeading: (id: string) => {
        if (!editor) return;

        const mainTextNodes = extractSectionsFromGlobalText(editor.getJSON().content || [], "maintext");

        if (!mainTextNodes || mainTextNodes.length === 0) {
          console.warn("Nessun nodo trovato nella sezione maintext");
          return;
        }

        const headings = extractHeadingsFromNodes(mainTextNodes);

        if (headings.length === 0) {
          console.warn("Nessun heading trovato nella sezione maintext");
          return;
        }

        const target = findTargetHeading(headings, id);
        if (!target) {
          console.warn(`Heading con ID ${id} non trovato`);
          return;
        }

        editor.commands.setTextSelection(target.pos);
        editor.commands.focus();

        setTimeout(() => performScrollToHeading(editor, target), 150);

        function extractHeadingsFromNodes(nodes: any[]) {
          const result: { level: number, pos: number, text: string }[] = [];

          editor?.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
              const matchedNode = nodes.find(n =>
                n.type === 'heading' &&
                n.attrs?.level === node.attrs.level &&
                n.content?.[0]?.text === node.textContent
              );

              if (matchedNode) {
                result.push({
                  level: node.attrs.level,
                  pos,
                  text: node.textContent
                });
              }
            }
            return true;
          });

          return result.sort((a, b) => a.pos - b.pos);
        }

        function findTargetHeading(headings: { level: number, pos: number, text: string }[], targetId: string) {
          const orderedHeadings = [...headings].sort((a, b) => a.pos - b.pos);
          const headingsByLevel: Record<number, { id: string; heading: typeof headings[0]; parentId: string | null }[]> = {};
          const lastHeadingByLevel: Record<number, { id: string; heading: typeof headings[0] }> = {};

          let counter = 1;

          for (const heading of orderedHeadings) {
            const level = heading.level;

            if (!headingsByLevel[level]) {
              headingsByLevel[level] = [];
            }

            let parentId: string | null = null;
            if (level > 1) {
              for (let parentLevel = level - 1; parentLevel >= 1; parentLevel--) {
                if (lastHeadingByLevel[parentLevel]) {
                  parentId = lastHeadingByLevel[parentLevel].id;
                  break;
                }
              }
            }

            let currentId: string;

            if (level === 1) {
              currentId = String(counter++);
            } else if (parentId) {
              const siblings = headingsByLevel[level].filter(h => h.parentId === parentId);
              const siblingCount = siblings.length + 1;
              currentId = `${parentId}.${siblingCount}`;
            } else {
              currentId = String(counter++);
            }

            headingsByLevel[level].push({ id: currentId, heading, parentId });
            lastHeadingByLevel[level] = { id: currentId, heading };

            for (let deeperLevel = level + 1; deeperLevel <= 6; deeperLevel++) {
              delete lastHeadingByLevel[deeperLevel];
            }

            if (currentId === targetId) {
              return heading;
            }
          }

          return null;
        }

        function performScrollToHeading(editor: Editor, target: { level: number, pos: number, text: string }) {
          // Prima selezione e focus - necessario per posizionare il cursore
          editor.commands.setTextSelection(target.pos);
          editor.commands.focus();
          editor.commands.scrollIntoView();

          // Dopo un breve ritardo, scroll aggiuntivo per garantire la visibilità
          setTimeout(() => {
            const editorElement = document.querySelector('.ProseMirror');
            if (!editorElement) return;

            // Trova tutti i titoli nel documento
            const headings = Array.from(editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));

            // Trova il titolo specifico corrispondente al testo target
            const targetHeading = headings.find(el => {
              const text = el.textContent?.trim();
              return text === target.text.trim();
            });

            if (targetHeading) {
              const headerOffset = 100;
              const headingPosition = targetHeading.getBoundingClientRect().top;
              const offsetPosition = headingPosition - headerOffset + window.scrollY;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });

              if (Math.abs(window.scrollY - offsetPosition) > 100) {
                targetHeading.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            } else {
              const range = window.getSelection()?.getRangeAt(0);
              if (range) {
                const rect = range.getBoundingClientRect();
                window.scrollTo({
                  top: rect.top + window.scrollY - 100,
                  behavior: 'smooth'
                });
              }
            }
          }, 150);
        }
      },
      focus: () => {
        editor?.commands.focus()
      },
      chain: () => editor?.chain(),
      getState: () => editor?.state,
      getJSON: () => editor?.getJSON(),
      getHTML: () => editor?.getHTML(),
      setJSON: (data?: any) => {
        editor?.commands.setContent(data, true);
      },
      state: getEditorState()
    }
  }, [])


  function getEditorState() {
    if (!editor) return;
    const newState = currentEditorState(editor)
    return newState
  }

  // () => {
  //   if (!editor) return;
  //   const newState = currentEditorState(editor)
  //   return newState
  // },

  const handleMarks = useHandleMarks()
  const deleteMarks = useDeleteMarks()
  const getSelectionMarks = useGetSelectionMarks();

  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null)

  const updateEmphasisState = useCallback((editor: Editor) => {
    const { from, to } = editor.state.selection;

    const getUniqueAttribute = <T extends number | string | null>(type: string, attributeName: string, defaultValue: T, nullReplacement: any = null): T => {
      const attrs = new Set<T>();
      const markAttributes = editor.getAttributes(type);
      let attrValue = attributeName in markAttributes && markAttributes[attributeName] ? markAttributes[attributeName] : defaultValue;
      if (from !== to) {
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (node.marks) {
            node.marks.forEach((mark) => {
              if (mark.type.name === type && mark.attrs[attributeName]) {
                //set fontSize to null if more than one unique value is found
                let valueToAdd = mark.attrs[attributeName];
                if (attributeName === 'fontSize' && typeof valueToAdd === 'string') {
                  const numericValue = parseFloat(valueToAdd);
                  if (!isNaN(numericValue)) {
                    valueToAdd = numericValue as unknown as T;
                  }
                }
                attrs.add(valueToAdd as T);
              }
            });
          }
        });
        attrValue = attrs.size === 1 ? Array.from(attrs)[0] : attrs.size === 0 ? attrValue : nullReplacement;
      }
      if (typeof defaultValue === 'number' && attrValue !== null) {
        attrValue = parseFloat(attrValue as unknown as string) as T;
      }
      return attrValue;
    };

    const bulletStyle = editor.getAttributes("bulletedList")?.listStyle || '';
    const orderListStyle = editor.getAttributes("orderList")?.listStyle || '';

    const newEmphasisState: EmphasisState = {
      headingLevel: editor.isActive('heading') ? editor.getAttributes("heading")?.level || 0 : 0,
      fontFamily: getUniqueAttribute<string>("textStyle", 'fontFamily', "Times New Roman", ''),
      fontSize: getUniqueAttribute<number>("textStyle", 'fontSize', 12, null),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      textColor: getUniqueAttribute<string>("textStyle", 'color', "black", ''),
      highlight: getUniqueAttribute<string>("highlight", 'color', "white", ''),

      // REVIEW THIS PART
      strikethrough: editor.isActive("strike"),
      alignment: getUniqueAttribute<string>("paragraph", 'textAlign', "left", ''),
      blockquote: editor.isActive("blockquote"),
      isCodeBlock: editor.isActive("codeBlock"),
      showNonPrintingCharacters: editor.storage.nonPrintingCharacter.visibility(),
      bulletStyle: {
        type: editor.isActive("bulletedList") ? 'BULLET' : editor.isActive("orderList") ? 'ORDER' : '',
        style: bulletStyle || orderListStyle,
        previousType: '',
      },
      superscript: editor.isActive("superscript"),
      subscript: editor.isActive("subscript"),
      spacing: {
        before: getUniqueAttribute<number | null>("paragraph", 'marginTop', null, null),
        after: getUniqueAttribute<number | null>("paragraph", 'marginBottom', null, null),
        line: getUniqueAttribute<number>("paragraph", 'lineHeight', 1, null),
      },
    };

    onEmphasisStateChange?.(newEmphasisState);
  }, [])

  const withSectionDividers: boolean = isMainText;
  const withEditableFilter: boolean = isMainText;

  const editor = useEditor({
    ...defaultEditorConfig(
      withSectionDividers,
      withEditableFilter,
    ),
    onCreate: ({ editor }) => {
      if (editor) {
        editor.commands.setMark('textStyle', {
          fontSize: '12pt',
          fontFamily: 'Times New Roman',
          color: '#000000',
        })
      }
    },
    onUpdate: ({ editor }) => {
      const newState = currentEditorState(editor)
      onUpdate?.(newState);

      const bookmarks = handleMarks(editor, 'bookmark')
      onChangeBookmarks?.(bookmarks)

      const comments = handleMarks(editor, 'comment')
      onChangeComments?.(comments)

      updateEmphasisState(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!editor) return;

      const { selection } = editor.state;
      const currentPos = selection.from;
      let sections: string[] = [];
      editor.state.doc.nodesBetween(0, currentPos, (node, _) => {
        if (node.type.name === 'sectionDivider') {
          sections.push(node.attrs.sectionType);
          return false;
        }
        return true;
      });
      const { from, to } = editor.state.selection;
      const selectedContent = editor.state.doc.textBetween(from, to, ' ');

      const currentSection = sections[sections.length - 1]
      onCurrentSection?.(sections.length > 0 ? currentSection : undefined)

      // Usa la nuova funzione getSelectionMarks per ottenere tutti i mark nella selezione
      const selectedMarks = getSelectionMarks(editor);

      if (selectedContent.length === 0) {
        const hasBookmark = selectedMarks.some(mark => mark.type === 'bookmark')
        const hasComment = selectedMarks.some(mark => mark.type === 'comment')

        if (hasComment && commentHighlighted) {
          onSelectionMarks?.(selectedMarks.filter(mark => mark.type === 'comment'))
        } else if (hasBookmark && bookmarkHighlighted) {
          onSelectionMarks?.(selectedMarks.filter(mark => mark.type === 'bookmark'))
        } else {
          onSelectionMarks?.([])
        }
      } else {
        // Qui puoi aggiungere la logica per passare i marks quando c'è una selezione
        onSelectionMarks?.(selectedMarks);
      }

      const comments = handleMarks(editor, 'comment')
      onChangeComments?.(comments)

      const bookmarks = handleMarks(editor, 'bookmark')
      onChangeBookmarks?.(bookmarks)

      // SELECT COMMENT
      const selectedComment = comments.find(comment => {
        return selectedMarks.some(mark =>
          mark.type === 'comment' &&
          mark.attrs?.id === comment.id
        );
      });

      if (selectedComment) {
        onChangeComment?.(selectedComment)
      }

      // SELECT BOOKMARK
      const selectedBookmark = bookmarks.find(bookmark => {
        return selectedMarks.some(mark =>
          mark.type === 'bookmark' &&
          mark.attrs?.id === bookmark.id
        );
      });

      if (selectedBookmark) {
        onChangeBookmark?.(selectedBookmark)
      }

      onSelectedContent?.(selectedContent)
      onSelectedContentChange?.(selectedContent)

      if (from === to) {
        setPopoverOpen(false)
      }

      onCanUndo?.(editor.can().undo());
      onCanRedo?.(editor.can().redo());

      updateEmphasisState(editor);

      onBookmarkStateChange?.(editor.isActive("bookmark"))
      onCommentStateChange?.(editor.isActive("comment"))
    },
    onTransaction: ({ editor, transaction }) => {
      onHistoryStateChange?.(editorHistory.current);

      const selectionStart = transaction.getMeta("selectionStart")
      const selectionEnd = transaction.getMeta("selectionEnd")

      if (selectionStart) {
        setPopoverOpen(false)
      }

      if (selectionEnd) {
        updateEmphasisState(editor);
        if (editor) {
          setTimeout(() => {
            positionPopover()
            setPopoverOpen(true)
          }, 0)
        }
      }
    },
    onFocus: (data) => {
      const editor = data.editor;
      onFocusEditor?.();
      onCanUndo?.(editor.can().undo());
      onCanRedo?.(editor.can().redo());
    },
  })


  const currentEditorState = useCallback((editor: Editor) => {
    const characters = editor.storage.characterCount.characters()
    const words = editor.storage.characterCount.words()

    return {
      json: editor.getJSON(),
      html: editor.getHTML(),
      text: editor.getText(),
      characters,
      words,
    }
  }, [editor])

  useEffect(() => {
    if (canEdit) {
      editor?.setEditable(canEdit)
    } else {
      editor?.setEditable(false)
    }
  }, [canEdit])

  useEffect(() => {
    editor?.on('updateEmphasisState', () => updateEmphasisState(editor));

    return () => {
      editor?.off('updateEmphasisState');
    }
  }, [editor]);

  const { t } = useTranslation()
  const positionPopover = useCallback(() => {
    if (!editor || !editorRef.current) return

    const { view } = editor
    const { state } = view
    const { from, to } = state.selection

    if (from === to) return

    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)
    const editorRect = editorRef.current.getBoundingClientRect()
    const selectionCenter = (start.left + end.left) / 2
    const editorWidth = editorRect.width
    const isNearRightEdge = editorWidth - (selectionCenter - editorRect.left) < editorWidth / 2
    const top = start.top - editorRect.top - 70

    if (isNearRightEdge) {
      const right = editorWidth - (end.left - editorRect.left)
      setPopoverPosition({ top, right, left: undefined })
    } else {
      const left = selectionCenter - editorRect.left
      setPopoverPosition({ top, left, right: undefined })
    }
  }, [editor])

  const editorHistory = useEditorHistory(editor);

  const editorRef = useRef<HTMLDivElement>(null)
  const popoverTriggerRef = useRef<HTMLDivElement>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number
    left?: number
    right?: number
  }>({ top: 0, left: 0 })
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (!editor || !canEdit) return;

    event.preventDefault();

    setContextMenuPosition({
      top: event.clientY,
      left: event.clientX,
    });

    // disabled for further info in future
    // setContextMenuOpen(true);
  }, [editor, canEdit]);

  const handleCopy = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) return;

    const plainText = editor.state.doc.textBetween(from, to, ' ');
    if (plainText.length === 0) return;

    const fragment = editor.state.selection.content();

    const domSerializer = editor.schema.cached.domSerializer;
    const temp = document.createElement('div');
    const slice = fragment.content;
    domSerializer.serializeFragment(slice, { document }, temp);
    const selectedHtml = temp.innerHTML;

    navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([selectedHtml], { type: 'text/html' }),
      }),
    ]).catch(err => {
      console.error('Clipboard write failed:', err);
      // Fallback sul metodo tradizionale
      document.execCommand('copy');
    });

    setContextMenuOpen(false);
  }, [editor]);

  const handleCut = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) return;

    handleCopy();
    setTimeout(() => {
      editor.commands.deleteSelection();
    }, 0);

    setContextMenuOpen(false);
  }, [editor, handleCopy]);

  const handlePaste = useCallback(async () => {
    if (!editor) return;

    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes('text/html')) {
          const blob = await clipboardItem.getType('text/html');
          const html = await blob.text();

          editor.commands.focus();
          editor.commands.insertContent(html, {
            parseOptions: {
              preserveWhitespace: 'full',
            },
          });
          break;
        }
        else if (clipboardItem.types.includes('text/plain')) {
          const blob = await clipboardItem.getType('text/plain');
          const text = await blob.text();
          editor.commands.focus();
          editor.commands.insertContent(text);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to paste with rich content:', error);

      try {
        const text = await navigator.clipboard.readText();
        if (text.length > 0) {
          editor.commands.focus();
          editor.commands.insertContent(text);
        }
      } catch (fallbackError) {
        console.error('Clipboard paste failed:', fallbackError);
        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const pasteKey = isMac ? 'Cmd+V' : 'Ctrl+V';
        alert(`Non è stato possibile incollare automaticamente. Utilizza ${pasteKey} per incollare.`);
      }
    }

    setContextMenuOpen(false);
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuOpen) {
        setContextMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!editor || !selectionRange) return

    if ((event.key === "Delete" || event.key === "Backspace") && popoverOpen) {
      event.preventDefault()
      editor.commands.focus()
      const { from, to } = selectionRange
      editor.commands.deleteRange({ from, to })
      setPopoverOpen(false)
      setSelectionRange(null)
    }
  }, [editor, selectionRange, popoverOpen])

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && editor?.isFocused) {
      e.preventDefault();
    }
  }, [editor]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (popoverOpen && editor) {
      setTimeout(() => {
        editor.commands.focus()
      }, 10)
    }
  }, [popoverOpen, editor])


  useEffect(() => {
    if (!editor) return;

    editor.state.doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name == 'comment') {
            const commentColor = commentHighlighted ? '#A9BFFF' : 'transparent';
            editor.chain().setTextSelection({ from: pos, to: pos + node.nodeSize }).updateCommentColor({ color: commentColor }).run()
          }
          if (mark.type.name == 'bookmark') {
            const bookmarkColor = bookmarkHighlighted ? '#E5E5E5' : 'transparent';
            editor.chain().setTextSelection({ from: pos, to: pos + node.nodeSize }).updateBookmarkColor({ color: bookmarkColor }).run()
          }

        });
      }
      return true;
    });
  }, [commentHighlighted, bookmarkHighlighted, editor])

  return (
    <>
      <div
        ref={editorRef}
        className={cn("relative w-full h-full", className)}>
        {bubbleToolbarItems && bubbleToolbarItems.length > 0 &&
          <div
            ref={popoverTriggerRef}
            style={{
              position: "absolute",
              top: `${popoverPosition.top}px`,
              left: popoverPosition.left !== undefined ? `${popoverPosition.left}px` : undefined,
              right: popoverPosition.right !== undefined ? `${popoverPosition.right}px` : undefined,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
            }}
          >
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="w-1 h-1" />
              </PopoverTrigger>
              <PopoverContent className="w-auto px-4 py-3" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2">
                  {bubbleToolbarItems?.map((item, index) => (
                    <div key={`${index}-${item.type}`}>
                      {item.type === "button" && (
                        <Button
                          key={`${index}-${item.type}`}
                          intent="secondary"
                          variant="icon"
                          size="iconSm"
                          icon={item.icon}
                          onClick={() => {
                            item.onClick?.(item)
                            setPopoverOpen(false)
                          }}
                          disabled={item.disabled}
                        />
                      )}
                      {item.type === "dropdown" && (!item.options || item.options.length < 2) && (
                        <Button
                          key={`${index}-${item.type}`}
                          intent="secondary"
                          variant="icon"
                          size="iconSm"
                          icon={item.icon}
                          onClick={() => {
                            item.onClick?.(item)
                            setPopoverOpen(false)
                          }}
                          disabled={item.disabled}
                        />
                      )}
                      {item.type === "dropdown" && item.options && item.options.length > 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              intent="secondary"
                              variant="icon"
                              size="iconSm"
                              icon={item.icon}
                              disabled={item.disabled}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className='w-[100px]'
                            onCloseAutoFocus={(e) => {
                              e.preventDefault()
                              editor?.commands.focus()
                            }}>
                            {item.options?.map((option, index) => (
                              <DropdownMenuItem
                                key={`${index}-${option.label}`}
                                onClick={() => {
                                  item.onClick?.(option)
                                  setPopoverOpen(false)
                                }}>
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>}

        {/* Menu contestuale */}
        {contextMenuOpen && (
          <div
            className="fixed z-50 w-56 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
            style={{
              top: `${contextMenuPosition.top}px`,
              left: `${contextMenuPosition.left}px`,
            }}
          >
            <div className="py-1">
              <button
                className="relative text-primary-20 flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground "
                onClick={handleCut}
              >
                <ScissorsIcon className="mr-2 h-4 w-4" />
                <span>{t('buttons.cut')}</span>
                <span className="ml-auto text-secondary-70 text-xs text-muted-foreground">
                  {navigator.platform.includes('Mac') ? '⌘X' : 'Ctrl+X'}
                </span>
              </button>
              <button
                className="relative text-primary-20 flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground "
                onClick={handleCopy}
              >
                <CopyIcon className="mr-2 h-4 w-4" />
                <span>{t('buttons.copy')}</span>
                <span className="ml-auto text-secondary-70 text-xs text-muted-foreground">
                  {navigator.platform.includes('Mac') ? '⌘C' : 'Ctrl+C'}
                </span>
              </button>
              <div className="h-px my-1 bg-muted"></div>
              <button
                className="relative text-primary-20 flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={handlePaste}
              >
                <ClipboardIcon className="mr-2 h-4 w-4" />
                <span>{t('buttons.paste')}</span>
                <span className="ml-auto text-secondary-70 text-xs text-muted-foreground">
                  {navigator.platform.includes('Mac') ? '⌘V' : 'Ctrl+V'}
                </span>
              </button>
            </div>
          </div>
        )}

        <EditorContent
          className="h-full"
          editor={editor}
          spellCheck={false}
          onContextMenu={handleContextMenu}
          onKeyDown={handleEditorKeyDown}
        />
      </div>

      {/* <TextEditorLayout className={cn(className)}>
        {children} */}
      {/* <TextEditorContent className={cn(className)}>
       
      </TextEditorContent> */}
      {/* </TextEditorLayout> */}
    </>
  )
});

export default TextEditor;


const useHandleMarks = () => {
  return useCallback((editor: Editor, typeName: string) => {
    let marks: any[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'text' && node.marks.some(mark => mark.type.name === typeName)) {
        const from = pos;
        const to = pos + node.nodeSize;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        const bookmarkId = node.marks.find(mark => mark.type.name === typeName)?.attrs?.id;
        marks.push({
          id: bookmarkId,
          content: selectedText,
        })
        return true
      }
      return true
    });

    return marks
  }, [])
}

const useDeleteMarks = () => {
  return useCallback((editor: Editor, marksIds: string[], typeName: string) => {
    if (!editor) return;

    const transaction = editor.state.tr;

    editor.state.doc.descendants((node, pos) => {
      const marks = node.marks.filter(mark =>
        mark.type.name === typeName && marksIds.some(id => id === mark.attrs.id)
      );

      if (marks.length > 0) {
        transaction.removeMark(
          pos,
          pos + node.nodeSize,
          editor.schema.marks[typeName]
        );
      }
    });

    editor.view.dispatch(transaction);
  }, [])
}

const useGetSelectionMarks = () => {
  return useCallback((editor: Editor) => {
    const { from, to } = editor.state.selection;

    if (from === to) {
      return editor.state.selection.$from.marks().map(mark => ({
        type: mark.type.name,
        attrs: mark.attrs
      }));
    }

    const allMarks: { type: string, attrs: any }[] = [];

    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText || node.marks.length === 0) {
        return true;
      }

      const nodeFrom = Math.max(from, pos);
      const nodeTo = Math.min(to, pos + node.nodeSize);

      if (nodeFrom < nodeTo) {
        node.marks.forEach(mark => {
          if (mark.attrs.id) {
            const exists = allMarks.some(existingMark =>
              existingMark.type === mark.type.name &&
              existingMark.attrs.id === mark.attrs.id
            );
            if (!exists) {
              allMarks.push({
                type: mark.type.name,
                attrs: { ...mark.attrs }
              });
            }
          } else {
            const exists = allMarks.some(existingMark =>
              existingMark.type === mark.type.name &&
              JSON.stringify(existingMark.attrs) === JSON.stringify(mark.attrs)
            );
            if (!exists) {
              allMarks.push({
                type: mark.type.name,
                attrs: { ...mark.attrs }
              });
            }
          }
        });
      }

      return true;
    });

    return allMarks;
  }, []);
};

