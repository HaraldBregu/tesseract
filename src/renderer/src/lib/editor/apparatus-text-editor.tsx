import { Content, Editor, EditorContent, useEditor } from '@tiptap/react';
import { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ApparatusEntry from './extensions/apparatus-entry';
import { cn, getShortcutForMenuItem, matchesShortcut, isMenuShortcut, shortcutLabel } from '../utils';
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Lemma from './extensions/lemma';
import ReadingSeparator from './extensions/reading-separator';
import ReadingType from './extensions/reading-type';
import Siglum from './extensions/siglum';
import Italic from '@tiptap/extension-italic'
import Bold from '@tiptap/extension-bold'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextStyle from '@tiptap/extension-text-style'
import { Node } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state';
import AppButton from '@/components/app/app-button';
import IconBold from '@/components/app/icons/IconBold';
import IconUnderline from '@/components/app/icons/IconUnderline';
import IconItalic from '@/components/app/icons/IconItalic';
import FontFamily from '@tiptap/extension-font-family';
import { NonPrintableCharacters } from '../tiptap/non-printable-character';
import { CitationMark } from '@/lib/tiptap/marks/citation-mark';
import Link from '@/lib/tiptap/marks/link-mark';
import Strikethrough from '@tiptap/extension-strike';
import CommentMark from './extensions/comment-mark';
import { ApparatusPluginsExtension } from './editor-plugins-extensions';
import { HTMLTextEditorElement } from './common';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { VirtualSearchHighlight } from './extensions/search';
import { FIND_WHOLE_DOC } from '@/utils/constants';
import { useSearch } from '@/hooks/use-search';
import IconCommentAdd from '@/components/app/icons/IconCommentAdd';
import { useApparatusTextEditor } from './hooks/use-apparatus-text-editor';
import { EditorBubbleMenu, EditorBubbleMenuElement } from './components/editor-bubble-menu';
import IconLinkAdd from '@/components/app/icons/IconLinkAdd';
import IconCitation from '@/components/app/icons/IconCitation';
import IconSiglum from '@/components/app/icons/IconSiglum';
import { EditorContextMenu, EditorContextMenuList, EditorContextMenuItemButton, EditorContextMenuSeparator, EditorContextMenuElement, EditorContextMenuToolbar } from './components/editor-context-menu';
import IconReadingSeparator from '@/components/app/icons/IconReadingSeparator';
import IconReadingType from '@/components/app/icons/IconReadingType';
import { AppNavigatableList } from '@/components/app/app-navigatable-list';
import { EditorOptionMenu, EditorOptionMenuHeader, EditorOptionMenuFooter, EditorOptionMenuElement } from './components/editor-option-menu';
import { useApparatusTextEditorClipboard } from './hooks/use-apparatus-text-editor-clipboard';
import { useTranslation } from 'react-i18next';
import ApparatusParagraph from './extensions/apparatus-paragraph';
import { useApparatusTextEditorHistory } from './hooks/use-apparatus-text-editor-history';
import { MessageCircle } from 'lucide-react';

export interface HTMLApparatusTextEditorElement extends HTMLTextEditorElement {
  disableReplace: () => boolean;
  setActiveSearch: (searchIndex: number) => void;
  clearActiveSearch: () => void;
  find: (apparatusId: string, options: SearchCriteria) => void;
  replace: (replacement: string, searchIndex: number, criteria: SearchCriteria) => Promise<number | boolean> | undefined;
  replaceAll: (replacement: string, searchTerm: string) => void;
  focus: () => void;
  insertApparatusEntryFromNodes: (type: string, nodes: Node[], style: Style) => void;
  insertApparatusesEntriesFromNodes: (type: string, nodes: Node[], style: Style) => void;
  updateApparatusEntries: (entries: ApparatusEntryContent[]) => void;
  deleteAllApparatusesEntries: () => void;
  deleteApparatusEntryWithId: (id: string) => void;
  deleteApparatusesEntryWithIds: (ids: string[]) => void;
  getApparatusesIds: () => string[];
  getApparatusesEntriesNodes: () => Node[];
  getApparatusEntryNodesWithId: (id: string) => Node[];
  swapApparatusEntriesInnerOuterMarginType: () => void;
  getApparatusIdFromCommentId: (commentId: string) => string | undefined;
  updateApparatusesLemma: (data: { id: string, content: string }[]) => void;
  addReadingSeparator: (data: ReadingSeparator) => void;
  addReadingTypeAdd: (data: ReadingTypeAdd) => void;
  addReadingTypeOm: (data: ReadingTypeOm) => void;
  addReadingTypeTr: (data: ReadingTypeTr) => void;
  addReadingTypeDel: (data: ReadingTypeDel) => void;
  addReadingTypeCustom: (data: string, style: ReadingTypeCustomStyle) => void;
  addSiglum: (siglum: Siglum, highlightColor: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: string) => void;
  setSuperscript: (superscript: boolean) => void;
  setSubscript: (subscript: boolean) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
  setUnderline: (underline: boolean) => void;
  setStrikeThrough: (strikeThrough: boolean) => void;
  getCommentsIds: () => string[];
  scrollToCommentId: (id: string) => void;
  selectCommentId: (id: string) => void;
  setCommentCategoryId: (categoryId?: string) => void;
  setComment: (color: string) => void;
  unsetCommentsWithIds: (ids: string[]) => void;
  scrollToApparatusId: (id: string) => void;
  focusToApparatusId: (id: string) => void;
  setShowNonPrintingCharacters: (visible: boolean) => void;
  insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style) => void;
  setLink: (link: string) => void;
  removeLink: () => void;
  undo: () => void;
  redo: () => void;
  insertCharacter: (character: number) => void;
  updateReadingType: (readingTypeAdd: ReadingTypeAdd, readingTypeOm: ReadingTypeOm, readingTypeTr: ReadingTypeTr, readingTypeDel: ReadingTypeDel) => void;
  updateReadingSeparator: (readingSeparator: ReadingSeparator) => void;
  updateLemmaStyleAndSeparator: (lemmaStyle: LemmaStyle, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => void;
  getExportData: (title: string, extractReadingData: boolean, readingHeader: string) => ExportApparatus;
  getInsertedBibliographyEntries: (existingEntries: InsertBibliography[]) => InsertBibliography[];
}

interface TextEditorProps {
  itemId: string;
  className?: string;
  style?: React.CSSProperties;
  keyboardShortcuts: KeyboardShortcutCategory[];
  commentHighlightColor: string;
  lemmaHighlightColor: string;
  readingTypeAndSeparatorHighlightColor: string;
  siglaHighlightColor: string;
  lemmaVisible: boolean;
  commentsVisible: boolean;
  content: Content | null;
  collapsed: boolean;
  commentCategories: CommentCategory[] | null;
  readingSeparator: ReadingSeparator;
  emphasis: ApparatusNoteEmphasis;
  textStyle: ApparatusEntryStyle;
  onFocus: (itemId: string, editor: Editor, event: FocusEvent, transaction: Transaction) => void
  onCanUpdate: () => void;
  onUpdate: (editor: Editor, transaction: Transaction) => void
  onTextStyleChange: (style: ApparatusTextStyle) => void;
  onDeleteApparatusWithId?: (id: string) => void;
  onSwapMarginApparatusEntry?: (data: { id: string, type: "INNER_MARGIN" | "OUTER_MARGIN" }) => void;
  onClickLemmaWithId?: (id: string) => void;
  onSelectionUpdate?: (editor: Editor) => void;
  onCommentCreated: (id: string, content: string, categoryId: string | undefined) => void;
  onClickCommentWithId?: (id: string) => void;
  onCommentsChanged?: (data: { id: string, content: string }[]) => void;
  onCommentWithIdsDeleted?: (ids: string[]) => void;
  onUpdateTotalSearchCount: (itemId: string, count: number) => void;
  onUpdateReplaceMode: (itemId: string, isReplacing: boolean) => void;
  onApparatusEntryNodesChanged: (data: { noteId: string, nodes: Node[], style: ApparatusEntryStyle }[]) => void;
  onInsertReadingType: () => void;
  onClickAddLink: () => void;
  onClickAddSiglum: () => void;
  onClickAddCitation: () => void;
  onClickAddReferenceToChat: (text: string) => void
}

const ApparatusTextEditor = forwardRef((currentProps: TextEditorProps,
  ref: ForwardedRef<HTMLApparatusTextEditorElement>) => {
  const {
    itemId,
    className,
    style,
    keyboardShortcuts,
    commentHighlightColor,
    lemmaHighlightColor,
    readingTypeAndSeparatorHighlightColor,
    siglaHighlightColor,
    lemmaVisible,
    commentsVisible,
    content,
    collapsed,
    commentCategories,
    readingSeparator,
    emphasis,
    textStyle,
    onFocus,
    onCanUpdate,
    onUpdate,
    onTextStyleChange,
    onDeleteApparatusWithId,
    onSwapMarginApparatusEntry,
    onClickLemmaWithId,
    onSelectionUpdate,
    onCommentCreated,
    onClickCommentWithId,
    onCommentsChanged,
    onCommentWithIdsDeleted,
    onUpdateTotalSearchCount,
    onUpdateReplaceMode,
    onApparatusEntryNodesChanged,
    onInsertReadingType,
    onClickAddLink,
    onClickAddSiglum,
    onClickAddCitation,
    onClickAddReferenceToChat,
  } = currentProps;

  const { t } = useTranslation();
  const bubbleMenuRef = useRef<EditorBubbleMenuElement>(null);
  const contextMenuRef = useRef<EditorContextMenuElement>(null);
  const commentCategoryListMenuRef = useRef<EditorOptionMenuElement>(null)
  const commentCategoryIdRef = useRef<string | undefined>(undefined);
  const [commentHighlightColorActive, setCommentHighlightColorActive] = useState(true)

  const handleFocus = useCallback((editor: Editor, event: FocusEvent, transaction: Transaction) => {
    onFocus?.(itemId, editor, event, transaction);
  }, [itemId]);

  const clipboard = useApparatusTextEditorClipboard();

  useEffect(() => {
    const timer = setTimeout(() => {
      onCanUpdate()
    }, 2000);
    return () => clearTimeout(timer);
  }, [onCanUpdate]);

  const update = useCallback((editor: Editor, transaction: Transaction) => {
    onUpdate(editor, transaction);
  }, [onUpdate]);

  const editor = useEditor({
    autofocus: false,
    extensions: [
      ApparatusPluginsExtension,
      Document.extend({
        content: 'apparatusEntry*',
      }).configure({
        HTMLAttributes: {
          class: 'apparatuses-container'
        }
      }),
      ApparatusParagraph,
      Text,
      TextStyle.extend({
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
          }
        },
      }),
      FontFamily.configure({
        types: ['textStyle']
      }),
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          color: 'white'
        }
      }),
      Italic,
      Bold,
      Underline,
      Strikethrough,
      Superscript,
      Subscript,
      ApparatusEntry,
      Lemma,
      ReadingSeparator,
      ReadingType,
      NonPrintableCharacters.extend(),
      Siglum,
      CitationMark,
      CommentMark,
      VirtualSearchHighlight,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        linkOnPaste: true,
        shouldAutoLink: (url: string) => url.startsWith('http://') || url.startsWith('https://'),
        autolink: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 h-full'
      },
      handleDOMEvents: {
        keydown: (_view, event) => {
          if (event.ctrlKey && (event.key === 'x' || event.key === 'X') && editor) {
            event.preventDefault();
            clipboard.cut(editor)
            return true;
          }

          if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && editor) {
            event.preventDefault();
            clipboard.copy(editor)
            return true;
          }

          if (event.ctrlKey && (event.key === 'v' || event.key === 'V') && editor) {
            event.preventDefault();
            if (event.shiftKey) {
              clipboard.pasteWithoutFormatting(editor)
            } else {
              clipboard.paste(editor)
            }
            return true;
          }

          if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
            event.preventDefault()
            apparatusTextEditor.undo()
            return true
          }

          if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z') {
            event.preventDefault()
            apparatusTextEditor.redo()
            return true
          }

          // Handle apparatus-specific F-key shortcuts
          const editorHandledShortcuts = ['insertReadingType'];
          if (isMenuShortcut(event, keyboardShortcuts, editorHandledShortcuts)) {
            return true;
          }
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        const insertReadingTypeShortcut = getShortcutForMenuItem(keyboardShortcuts, 'insertReadingType');
        if (insertReadingTypeShortcut && matchesShortcut(event, insertReadingTypeShortcut) && view.state.selection.empty) {
          event.preventDefault();
          if (editor?.isFocused) {
            onInsertReadingType();
          }
          return true;
        }

        return false;
      }
    },
    content,
    onFocus: ({ editor, event, transaction }) => handleFocus(editor, event, transaction),
    onUpdate: ({ editor, transaction }) => update(editor, transaction),
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor)
    },
    onTransaction: ({ editor, transaction }) => {
      history.add(transaction, editor);
    },
  })

  if (!editor)
    throw new Error("Editor not found");

  useEffect(() => {
    const dom = editor.view.dom;
    if (lemmaVisible)
      dom.classList.remove('hide-lemma-highlights')
    else
      dom.classList.add('hide-lemma-highlights')
  }, [lemmaVisible, editor.view.dom]);

  useEffect(() => {
    const dom = editor.view.dom;
    if (commentsVisible)
      dom.classList.remove('hide-apparatus-comment-highlights')
    else
      dom.classList.add('hide-apparatus-comment-highlights')
  }, [commentsVisible, editor.view.dom]);

  const dispatchSearch = useSearch(editor);
  const history = useApparatusTextEditorHistory(10, itemId);
  const apparatusTextEditor = useApparatusTextEditor(editor, history, emphasis, textStyle);

  useEffect(() => {
    const updateTotalSearchCount = onUpdateTotalSearchCount.bind(null, itemId, 0);
    editor.on('onDisposedSearch', updateTotalSearchCount);

    return () => {
      editor.off('onDisposedSearch', updateTotalSearchCount);
    }
  }, [editor, itemId]);

  useEffect(() => {
    onTextStyleChange(apparatusTextEditor.currentTextStyle)
  }, [apparatusTextEditor.currentTextStyle, editor.state.selection])

  useEffect(() => {
    onUpdateTotalSearchCount(itemId, dispatchSearch.count ?? 0);
  }, [itemId, dispatchSearch.count])

  useEffect(() => {
    onUpdateReplaceMode(itemId, dispatchSearch.isInReplaceMode ?? false);
  }, [itemId, dispatchSearch.isInReplaceMode]);

  const handleFind = useCallback((apparatusId: string, { searchTerm, caseSensitive, wholeWords, documentCriteria }: SearchCriteria) => {
    dispatchSearch.dispose();
    if (!searchTerm || (!documentCriteria.includes(FIND_WHOLE_DOC) && !documentCriteria.includes(apparatusId))) return;

    dispatchSearch.search(searchTerm, caseSensitive, wholeWords);
  }, [editor]);

  const handleActiveSearch = useCallback((searchIndex: number) => {
    dispatchSearch.setActiveSearch(searchIndex);
  }, [dispatchSearch.setActiveSearch]);

  const handleClearActiveSearch = useCallback(() => {
    dispatchSearch.clearActiveSearch();
  }, [dispatchSearch.clearActiveSearch]);

  const handleDisableReplace = useCallback(() => {
    return dispatchSearch.disableReplace();
  }, [dispatchSearch.disableReplace]);

  const handleReplaceOne = useCallback((replacement: string, searchIndex: number, criteria: SearchCriteria) => {
    return dispatchSearch.replaceOne(replacement, searchIndex, criteria);
  }, [dispatchSearch.replaceOne]);

  const handleReplaceAll = useCallback((replacement: string, searchTerm: string) => {
    dispatchSearch.replaceAll(replacement, searchTerm);
  }, [dispatchSearch.replaceAll]);

  useEffect(() => {
    const colors: string[] = []
    editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
      if (parent.type.name === 'paragraph' && node.type.name === 'text') {
        const mark = node.marks.find(mark => mark.type.name === 'comment');
        const highlightColor = mark?.attrs.highlightColor
        colors.push(highlightColor)
      }
    })

    const filteredColors = [...new Set(colors.filter(color => color !== undefined))];
    if (filteredColors.length === 1) {
      setCommentHighlightColorActive(filteredColors[0] === commentHighlightColor)
    }
  }, [editor, commentHighlightColor])

  useImperativeHandle(ref, () => ({
    name: 'APPARATUS_TEXT_EDITOR',
    commentHighlightColorActive,
    editor,
    focus: apparatusTextEditor.focus,
    getJSON: apparatusTextEditor.getJSON,
    getHTML: apparatusTextEditor.getHTML,
    setContent: apparatusTextEditor.setContent,
    insertApparatusEntryFromNodes: apparatusTextEditor.insertApparatusEntryFromNodes, // SWAP MARGIN APPARATUS ENTRIES
    insertApparatusesEntriesFromNodes: apparatusTextEditor.insertApparatusesEntriesFromNodes, // SWAP MARGIN APPARATUS ENTRIES
    updateApparatusEntries: apparatusTextEditor.updateApparatusEntries,
    deleteAllApparatusesEntries: apparatusTextEditor.deleteAllApparatusesEntries,
    deleteApparatusEntryWithId: apparatusTextEditor.deleteApparatusEntryWithId,
    deleteApparatusesEntryWithIds: apparatusTextEditor.deleteApparatusesEntryWithIds,
    getApparatusesIds: apparatusTextEditor.getApparatusesIds,
    getApparatusesEntriesNodes: apparatusTextEditor.getApparatusesEntriesNodes,
    getApparatusEntryNodesWithId: apparatusTextEditor.getApparatusEntryNodesWithId,
    swapApparatusEntriesInnerOuterMarginType: apparatusTextEditor.swapApparatusEntriesInnerOuterMarginType,
    getApparatusIdFromCommentId: apparatusTextEditor.getApparatusIdFromCommentId,
    updateApparatusesLemma: apparatusTextEditor.updateApparatusesLemma,
    addReadingSeparator: apparatusTextEditor.addReadingSeparator,
    addReadingTypeAdd: apparatusTextEditor.addReadingTypeAdd,
    addReadingTypeOm: apparatusTextEditor.addReadingTypeOm,
    addReadingTypeTr: apparatusTextEditor.addReadingTypeTr,
    addReadingTypeDel: apparatusTextEditor.addReadingTypeDel,
    addReadingTypeCustom: apparatusTextEditor.addReadingTypeCustom,
    disableReplace: handleDisableReplace,
    setActiveSearch: handleActiveSearch,
    clearActiveSearch: handleClearActiveSearch,
    find: handleFind,
    replace: handleReplaceOne,
    replaceAll: handleReplaceAll,
    addSiglum: apparatusTextEditor.addSiglum,
    setFontFamily: apparatusTextEditor.setFontFamily,
    setFontSize: apparatusTextEditor.setFontSize,
    setSuperscript: apparatusTextEditor.setSuperscript,
    setSubscript: apparatusTextEditor.setSubscript,
    setBold: apparatusTextEditor.setBold,
    setItalic: apparatusTextEditor.setItalic,
    setUnderline: apparatusTextEditor.setUnderline,
    setStrikeThrough: apparatusTextEditor.setStrikeThrough,
    setTextColor: apparatusTextEditor.setTextColor,
    setHighlightColor: apparatusTextEditor.setHighlightColor,
    setCommentCategoryId: (categoryId?: string) => {
      commentCategoryIdRef.current = categoryId;
    },
    setComment: (color: string) => {
      apparatusTextEditor.addComment(color)
    },
    getCommentsIds: apparatusTextEditor.getCommentsIds,
    scrollToCommentId: apparatusTextEditor.scrollToCommentId,
    selectCommentId: apparatusTextEditor.selectCommentId,
    unsetCommentsWithIds: apparatusTextEditor.unsetCommentsWithIds,
    scrollToApparatusId: apparatusTextEditor.scrollToApparatusId,
    focusToApparatusId: apparatusTextEditor.focusToApparatusId,
    setShowNonPrintingCharacters: apparatusTextEditor.setShowNonPrintingCharacters,
    insertCitation: apparatusTextEditor.insertCitation,
    setLink: apparatusTextEditor.setLink,
    removeLink: apparatusTextEditor.removeLink,
    undo: apparatusTextEditor.undo,
    redo: apparatusTextEditor.redo,
    insertCharacter: apparatusTextEditor.insertCharacter,
    updateReadingType: apparatusTextEditor.updateReadingType,
    updateReadingSeparator: apparatusTextEditor.updateReadingSeparator,
    updateLemmaStyleAndSeparator: apparatusTextEditor.updateLemmaStyleAndSeparator,
    selectAll: apparatusTextEditor.selectAll,
    deselectAll: apparatusTextEditor.deselectAll,
    deleteSelection: apparatusTextEditor.deleteSelection,
    getExportData: apparatusTextEditor.getExportData,
    getInsertedBibliographyEntries: apparatusTextEditor.getInsertedBibliographyEntries,
    cut: () => clipboard.cut(editor),
    copy: () => clipboard.copy(editor),
    paste: () => clipboard.paste(editor),
    pasteWithoutFormatting: () => clipboard.pasteWithoutFormatting(editor)
  }), [editor, commentHighlightColorActive, apparatusTextEditor, commentHighlightColor])

  useEffect(() => {

    const handleDeleteApparatusWithId = (id) => {
      onDeleteApparatusWithId?.(id);
    };

    const handleSwapMarginApparatusEntry = (data: { id: string, type: "INNER_MARGIN" | "OUTER_MARGIN" }) => {
      onSwapMarginApparatusEntry?.(data);
    };

    const handleCommentApparatusCreated = ({ id, selectedText }) => {
      onCommentCreated(id, selectedText, commentCategoryIdRef.current);
      commentCategoryIdRef.current = undefined;
    };

    const handleClickLemmaWithId = (id: string) => {
      onClickLemmaWithId?.(id);
    };

    const handleClickCommentWithId = (id: string) => {
      onClickCommentWithId?.(id);
    };

    const handleCustomMarksDeleted = (marks: { id: string, type: string, content: string }[]) => {
      onCommentWithIdsDeleted?.(marks.map(mark => mark.id));
    };

    editor.on('commentApparatusCreated', handleCommentApparatusCreated);
    editor.on('deleteApparatusWithId', handleDeleteApparatusWithId);
    editor.on('swapMarginApparatusEntry', handleSwapMarginApparatusEntry);
    editor.on('clickLemmaWithId', handleClickLemmaWithId);
    editor.on('clickCommentWithId', handleClickCommentWithId);
    editor.on('customMarksDeleted', handleCustomMarksDeleted);

    return () => {
      editor.off('commentApparatusCreated', handleCommentApparatusCreated);
      editor.off('deleteApparatusWithId', handleDeleteApparatusWithId);
      editor.off('swapMarginApparatusEntry', handleSwapMarginApparatusEntry);
      editor.off('clickLemmaWithId', handleClickLemmaWithId);
      editor.off('clickCommentWithId', handleClickCommentWithId);
      editor.off('customMarksDeleted', handleCustomMarksDeleted);
    }
  }, [onDeleteApparatusWithId, onSwapMarginApparatusEntry, onCommentCreated, onClickLemmaWithId, onClickCommentWithId, onCommentWithIdsDeleted, editor, commentCategoryIdRef.current]);

  useEffect(() => {
    onCommentsChanged?.(apparatusTextEditor.comments);
  }, [onCommentsChanged, apparatusTextEditor.comments]);

  useEffect(() => {
    onApparatusEntryNodesChanged(apparatusTextEditor.apparatusEntryNodes);
  }, [apparatusTextEditor.apparatusEntryNodes]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'siglum') {
        const highlightColor = siglaHighlightColor
        editor.chain().setNodeSelection(pos).updateAttributes('siglum', { highlightColor }).run();
      }
      return true;
    });
  }, [editor, siglaHighlightColor]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      const mark = node.marks.find(mark => mark.type.name === 'comment');
      const highlightColor = commentHighlightColor
      if (mark && mark.attrs.highlightColor !== highlightColor) {
        editor
          .chain()
          .setTextSelection({
            from: pos,
            to: pos + node.nodeSize
          })
          .updateComment({ highlightColor })
          .run()
      }
      return true;
    });
  }, [editor, commentHighlightColor]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'lemma') {
        editor
          .chain()
          .setNodeSelection(pos)
          .updateLemmaHighlightColor(lemmaHighlightColor)
          .run();
      } else if (node.type.name === 'readingType') {
        editor.chain().setNodeSelection(pos).updateReadingTypeHighlightColor(readingTypeAndSeparatorHighlightColor).run()
      }
      return true;
    });
  }, [lemmaHighlightColor, readingTypeAndSeparatorHighlightColor, editor]);

  const onContextMenuVisibilityChange = useCallback((visible: boolean) => {
    bubbleMenuRef.current?.activate(!visible)
  }, [bubbleMenuRef]);

  const commentCategoriesOptions = useMemo(() => {
    const noCategory: CommentCategory = {
      id: undefined,
      name: "Uncategorised"
    }
    return (commentCategories && commentCategories?.length > 0) ? [
      noCategory,
      ...commentCategories ?? []
    ] : []
  }, [commentCategories]);

  const addComment = useCallback(() => {
    bubbleMenuRef.current?.hide()
    commentCategoryListMenuRef.current?.hide();
    apparatusTextEditor.addComment(commentHighlightColor)
  }, [editor, commentHighlightColor]);

  const selectCommentCategory = useCallback((commentCategory: CommentCategory, _index: number) => {
    commentCategoryIdRef.current = commentCategory.id;
    addComment()
  }, [addComment, commentCategoryIdRef.current]);

  const clickAddComment = useCallback(() => {
    if (commentCategories?.length === 0) {
      addComment()
      return;
    }
    bubbleMenuRef.current?.hide()
    commentCategoryListMenuRef.current?.show()
  }, [addComment, bubbleMenuRef, commentCategoryListMenuRef, commentCategories]);

  const clickAddReferenceToChat = useCallback(() => {
    bubbleMenuRef.current?.hide()
    const text = apparatusTextEditor.selectedText()
    onClickAddReferenceToChat(text)
  }, [editor, apparatusTextEditor, bubbleMenuRef, onClickAddReferenceToChat]);


  return (
    <>
      {apparatusTextEditor.content.length > 0 && (
        <>
          <EditorBubbleMenu
            ref={bubbleMenuRef}
            editor={editor}>
            <div className="flex gap-2 bg-white dark:bg-grey-20 p-2 rounded border border-grey-70 dark:border-grey-30 shadow-lg">
              <AppButton
                variant={editor.isActive('bold') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => editor.chain().focus().toggleBold().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.bubble_menu.bold')}>
                <IconBold />
              </AppButton>
              <AppButton
                variant={editor.isActive('italic') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.bubble_menu.italic')}>
                <IconItalic />
              </AppButton>
              <AppButton
                variant={editor.isActive('underline') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.bubble_menu.underline')}>
                <IconUnderline />
              </AppButton>
              <AppButton
                variant={'toolbar'}
                onClick={clickAddComment}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.bubble_menu.comment')}>
                <IconCommentAdd />
              </AppButton>
              <AppButton
                variant={'toolbar'}
                onClick={onClickAddLink}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.bubble_menu.link')}>
                <IconLinkAdd />
              </AppButton>
              <AppButton
                variant="toolbar"
                onClick={clickAddReferenceToChat}
                disabled={false}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.link")}>
                <MessageCircle className="h-2 w-2" />
              </AppButton>
            </div>
          </EditorBubbleMenu>

          <EditorOptionMenu
            ref={commentCategoryListMenuRef}
            editor={editor}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md w-64 flex flex-col">
            <EditorOptionMenuHeader>
              {t('apparatus_editor.comment_category.title')}
            </EditorOptionMenuHeader>
            {commentCategoriesOptions && <AppNavigatableList
              items={commentCategoriesOptions}
              onSelect={selectCommentCategory}
              onEscape={() => commentCategoryListMenuRef.current?.hide()}
              renderItem={(commentCategory) => (
                <div className="p-2 text-xs">
                  {commentCategory.name}
                </div>
              )}
              className="max-h-64 overflow-auto"
              selectedItemClassName="bg-grey-40 text-white"
            />}
            <EditorOptionMenuFooter>
              <span>{commentCategories?.length} {t('apparatus_editor.comment_category.items')}</span>
              <span className="text-grey-50 dark:text-grey-80">{t('apparatus_editor.comment_category.escape_to_close')}</span>
            </EditorOptionMenuFooter>
          </EditorOptionMenu>

          <EditorContextMenu
            ref={contextMenuRef}
            editor={editor}
            onVisibilityChange={onContextMenuVisibilityChange}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md">
            <EditorContextMenuToolbar>
              <AppButton
                variant={editor.isActive('bold') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => {
                  editor.chain().focus().toggleBold().run()
                }}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.context_menu.formatting.bold')}>
                <IconBold />
              </AppButton>
              <AppButton
                variant={editor.isActive('italic') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.context_menu.formatting.italic')}>
                <IconItalic />
              </AppButton>
              <AppButton
                variant={editor.isActive('underline') ? 'toolbar-selected' : 'toolbar'}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t('apparatus_editor.context_menu.formatting.underline')}>
                <IconUnderline />
              </AppButton>
            </EditorContextMenuToolbar>
            <EditorContextMenuList>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty}
                onClick={() => {
                  onClickAddSiglum();
                  contextMenuRef.current?.hide()
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconSiglum className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.siglum')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "addSiglum"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty}
                onClick={() => {
                  onClickAddCitation();
                  contextMenuRef.current?.hide()
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconCitation className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.citation')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "addCitation"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty}
                onClick={() => {
                  contextMenuRef.current?.hide()
                  onInsertReadingType();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconReadingType className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.reading_type')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertReadingType"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty}
                onClick={() => {
                  apparatusTextEditor.addReadingSeparator(readingSeparator);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconReadingSeparator className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.reading_separator')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "addReadingSeparator"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                aria-label={t('apparatus_editor.context_menu.actions.comment')}
                onClick={() => {
                  clickAddComment();
                  contextMenuRef.current?.hide()
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconCommentAdd className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.comment')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertComment"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                aria-label={t('apparatus_editor.context_menu.actions.link')}
                onClick={() => {
                  onClickAddLink();
                  contextMenuRef.current?.hide()
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconLinkAdd className="w-4 h-4" />
                  <span>{t('apparatus_editor.context_menu.actions.link')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertLink"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                aria-label={t("add chat text citation")}
                onClick={() => {
                  clickAddReferenceToChat();
                  contextMenuRef.current?.hide();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{t("Add text to chat")}</span>
                </div>
              </EditorContextMenuItemButton>
              <EditorContextMenuSeparator />
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                onClick={() => {
                  contextMenuRef.current?.hide()
                  clipboard.cut(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t('apparatus_editor.context_menu.actions.cut')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "cut"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                onClick={() => {
                  contextMenuRef.current?.hide()
                  clipboard.copy(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t('apparatus_editor.context_menu.actions.copy')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "copy"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                onClick={() => {
                  contextMenuRef.current?.hide()
                  clipboard.paste(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t('apparatus_editor.context_menu.actions.paste')}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "paste"))}
                </span>
              </EditorContextMenuItemButton>
            </EditorContextMenuList>
          </EditorContextMenu>
        </>
      )}

      <EditorContent
        style={style}
        className={cn(
          "dark:!bg-grey-20 flex-1 overflow-auto relative w-full h-full px-1",
          collapsed && "h-0",
          className,
        )}
        editor={editor}
        spellCheck={false}
      />
    </>
  )
});

export default memo(ApparatusTextEditor);
