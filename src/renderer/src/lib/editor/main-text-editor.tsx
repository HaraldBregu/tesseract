import { Editor, EditorContent, FocusPosition, useEditor } from '@tiptap/react';
import { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import Ligature, { LigatureType } from '@/lib/tiptap/ligature-mark';
import { Mark, Node } from 'prosemirror-model';
import { TextSelection, Transaction } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import CustomSuperscript from '@/lib/tiptap/custom-superscript';
import CustomSubscript from '@/lib/tiptap/custom-subscript';
import Strikethrough from '@tiptap/extension-strike';
import { Color } from '@tiptap/extension-color';
import { ExtendedListItem } from '@/lib/tiptap/extended-list-item';
import { ExtendedBulletList } from '@/lib/tiptap/extended-bullet-list';
import { ExtendedOrderedList } from '@/lib/tiptap/extended-ordered-list';
import TextStyleExtended from '@/lib/tiptap/text-style-extended';
import BookmarkMark from './extensions/bookmark-mark';
import CommentMark from './extensions/comment-mark';
import { LineNumbers } from '@/lib/tiptap/line-number-extension';
import { CharacterSpacing } from '@/lib/tiptap/character-spacing-extension';
import LineSpacing from '@/lib/tiptap/line-spacing-extension';
import { NonPrintableCharacters } from '@/lib/tiptap/non-printable-character';
import { ExtendedParagraph } from '@/lib/tiptap/extensions/paragraph-extension';
import IndentExtension from '@/lib/tiptap/indent-extension';
import { ExtendedHeading } from '@/lib/tiptap/heading-extension';
import { CustomStyleMark } from '@/lib/tiptap/marks/custom-style-mark';
import Link from '@/lib/tiptap/marks/link-mark';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Siglum from '@/lib/editor/extensions/siglum';
import Bold from '@tiptap/extension-bold'
import TextNote from '@/lib/editor/extensions/text-note';
import { defaultHeadingStyles, defaultParagraphStyle, FIND_MAIN_TEXT, FIND_WHOLE_DOC } from '@/utils/constants';
import { VirtualSearchHighlight } from '@/lib/editor/extensions/search';
import { CitationMark } from '@/lib/tiptap/marks/citation-mark';
import { ListMarkerSyncExtension } from '@/lib/tiptap/list-marker-sync-extension';
import { useDispatch } from 'react-redux';
import { setSelectedNodeType } from '@/pages/editor/store/editor/editor.slice';
import { MainTextPluginsExtension } from '@/lib/editor/editor-plugins-extensions';
import { HTMLTextEditorElement } from '@/lib/editor/common';
import { useSearch } from '@/hooks/use-search';
import { useTranslation } from 'react-i18next';
import { useMainTextEditor } from './hooks/use-main-text-editor';
import { CustomTextAlign } from './extensions/custom-text-align';
import AppButton from '@/components/app/app-button';
import IconCommentAdd from '@/components/app/icons/IconCommentAdd';
import { EditorBubbleMenu, EditorBubbleMenuElement } from './components/editor-bubble-menu';
import IconHistoryEdu from '@/components/app/icons/IconHistoryEdu';
import IconBookmark from '@/components/app/icons/IconBookmark';
import IconLinkAdd from '@/components/app/icons/IconLinkAdd';
import { EditorOptionMenu, EditorOptionMenuElement, EditorOptionMenuFooter, EditorOptionMenuHeader } from './components/editor-option-menu';
import { AppNavigatableList } from '@/components/app/app-navigatable-list';
import { EditorContextMenu, EditorContextMenuElement, EditorContextMenuItemButton, EditorContextMenuList, EditorContextMenuSeparator, EditorContextMenuToolbar } from './components/editor-context-menu';
import IconBold from '@/components/app/icons/IconBold';
import IconItalic from '@/components/app/icons/IconItalic';
import IconUnderline from '@/components/app/icons/IconUnderline';
import IconSiglum from '@/components/app/icons/IconSiglum';
import IconCitation from '@/components/app/icons/IconCitation';
import IconAlignLeft from '@/components/app/icons/IconAlignLeft';
import IconAlignCenter from '@/components/app/icons/IconAlignCenter';
import IconAlignRight from '@/components/app/icons/IconAlignRight';
import IconAlignJustify from '@/components/app/icons/IconAlignJustify';
import { useMainTextEditorClipboard } from './hooks/use-main-text-editor-clipboard';
import { getShortcutForMenuItem, matchesShortcut, isMenuShortcut, cn, shortcutLabel } from '../utils';
import { orderedListTypeToStyle } from '@/lib/utils/list-type-mappers';
import { LetterSpacingMark } from '../tiptap/marks/letter-spacing-mark';
import SectionDivider from '../tiptap/section-divider';
import TocParagraph from './extensions/toc-paragraph';
import PageBreak from './extensions/page-break';
import { paragraphTemplate } from './shared/templates-mock';
import { MessageCircle } from 'lucide-react';

declare module '@tiptap/core' {
  interface EditorEvents {
    suppressBubbleToolbar: void;
  }
}

export interface HTMLMainTextEditorElement extends HTMLTextEditorElement {
  editor: Editor;
  disableReplace: () => boolean;
  setActiveSearch: (searchIndex: number) => void;
  clearActiveSearch: () => void;
  find: (options: SearchCriteria) => void;
  replace: (replacement: string, searchIndex: number, searchCriteria: SearchCriteria) => Promise<number | boolean> | undefined;
  replaceAll: (replacement: string, searchTerm: string) => void;
  addSiglum: (siglum: Siglum, highlightColor: string) => void;
  setHeading: (style: Style) => void;
  setBody: (style?: Style) => void;
  setNote: (highlightColor: string, apparatusId: string) => void;
  unsetNoteWithId: (id: string) => void;
  scrollToNoteWithId: (id: string) => void;
  setCustomStyle: (style: Style) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: string) => void;
  setBold: (bold: boolean) => void;
  toggleBold: () => void;
  unsetBold: () => void;
  setItalic: (italic: boolean) => void;
  unsetItalic: () => void;
  setUnderline: (underline: boolean) => void;
  unsetUnderline: () => void;
  setBlockquote: (isBlockquote: boolean) => void;
  setTextAlignment: (alignment: Alignment) => void;
  setLineSpacing: (lineSpacing: Spacing) => void;
  setListStyle: (style: ListStyle) => void;
  setShowNonPrintingCharacters: (visible: boolean) => void;
  setListNumbering: (numbering: number) => void;
  setOrderedListType: (type: '1' | 'a' | 'A' | 'i' | 'I') => void;
  continuePreviousNumbering: () => void;
  getSuggestedStartNumber: () => { number: number; listType: OrderedListType } | null;
  setStrikeThrough: (value: boolean) => void;
  setSuperscript: (superscript: boolean) => void;
  unsetSuperscript: () => void;
  setSubscript: (subscript: boolean) => void;
  unsetSubscript: () => void;
  undo: () => void;
  redo: () => void;
  addBookmark: (color: string, categoryId?: string) => void; // BOOKMARKS
  unsetBookmarksWithIds: (ids: string[]) => void;
  scrollToBookmark: (id: string) => void;
  addComment: (color: string, categoryId?: string) => void; // COMMENTS
  unsetCommentsWithIds: (ids: string[]) => void;
  scrollToComment: (id: string) => void;
  getCommentsIds: () => string[];
  scrollToSection: (id: string, position?: 'top' | 'bottom') => void;
  setLigature: (ligature: LigatureType) => void;
  setCase: (caseType: CasingType) => void;
  increaseIndent: () => void;
  decreaseIndent: () => void;
  increaseCharacterSpacing: () => void;
  decreaseCharacterSpacing: () => void;
  unsetCharacterSpacing: () => void;
  scrollToHeadingIndex: (index: number, sectionType?: string) => void;
  setPageBreak: (style) => void;
  focus: (position?: FocusPosition) => void;
  insertCharacter: (character: number) => void;
  insertContent: (content: string) => void;
  insertNodeContentsFromContent: (content: string) => void;
  setLink: (url: string) => void;
  selectedInnerHtmlString: () => string;
  selectedText: () => string;
  selectedContentJSON: () => any;
  selectedContentString: () => string;
  removeLink: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  unsetAllMarks: () => void;
  chain: () => any;
  getState: () => any;
  insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style, isBibliographySection: boolean) => void;
  insertBibliographies: (style: Style, otherEntries: InsertBibliography[]) => void;
}

interface MainTextEditorProps {
  styles: Style[];
  className?: string;
  zoomStyle?: React.CSSProperties;
  editable: boolean;
  keyboardShortcuts: KeyboardShortcutCategory[];
  apparatuses: Apparatus[];
  commentCategories: CommentCategory[] | null;
  bookmarkCategories: BookmarkCategory[] | null;
  commentsVisible: boolean;
  bookmarksVisible: boolean;
  onCanUpdate: () => void;
  onUpdate?: (editor: Editor) => void;
  onEmphasisStateChange: (emphasisState: EmphasisState) => void;
  onCanUndo?: (value: boolean) => void;
  onCanRedo?: (value: boolean) => void;
  notesVisible: boolean;
  bookmarkHighlightColor: string;
  onBookmarksChanged: (data: { id: string, content: string }[]) => void;
  onBookmarksWithIdsDeleted?: (ids: string[]) => void;
  commentHighlightColor: string;
  siglaHighlightColor: string;
  lemmaHighlightColor: string;
  onSelectedContent?: (selectedContent: string) => void;
  onFocus: (editor: Editor) => void;
  onFontFamilyChange?: (fontFamily: string) => void;
  onFontSizeChange?: (fontSize: string) => void;
  onClickNoteWithId: (id: string) => void;
  onCommentCreated: (id: string, content: string, categoryId: string | undefined) => void;
  onClickCommentWithId: (id: string) => void;
  onBookmarkCreated: (id: string, content: string, categoryId: string | undefined) => void;
  onClickBookmarkWithId: (id: string) => void;
  onCommentsChanged: (data: { id: string, content: string }[]) => void;
  onCommentWithIdsDeleted?: (ids: string[]) => void;
  onCurrentSection: (section: string) => void;
  onSelectionUpdate?: (editor: Editor) => void;
  onBlur?: (editor: Editor, event: FocusEvent, transaction: Transaction) => void;
  onTextNoteCreated: (id: string, content: string, apparatusId: string) => void;
  onTextNotesChanged: (data: { noteId: string, noteContent: string }[]) => void;
  onTextNoteWithIdsDeleted: (ids: string[]) => void;
  onUpdateTotalSearchCount: (count: number) => void;
  onUpdateReplaceMode: (isInReplaceMode: boolean) => void;
  onClickAddLink: () => void;
  onClickAddReferenceToChat: (text: string) => void
  onClickAddSiglum: () => void;
  onClickAddCitation: () => void;
}

const MainTextEditor = forwardRef(({
  styles,
  className,
  zoomStyle,
  editable = true,
  keyboardShortcuts,
  apparatuses,
  commentCategories,
  bookmarkCategories,
  commentsVisible,
  bookmarksVisible,
  onCanUpdate,
  onUpdate,
  onEmphasisStateChange,
  onCanUndo,
  onCanRedo,
  notesVisible,
  bookmarkHighlightColor,
  commentHighlightColor,
  siglaHighlightColor,
  lemmaHighlightColor,
  onSelectedContent,
  onFocus,
  onFontFamilyChange,
  onFontSizeChange,
  onClickNoteWithId,
  onCommentCreated,
  onClickCommentWithId,
  onBookmarkCreated,
  onClickBookmarkWithId,
  onBookmarksChanged,
  onBookmarksWithIdsDeleted,
  onCommentsChanged,
  onCommentWithIdsDeleted,
  onCurrentSection,
  onSelectionUpdate,
  onBlur,
  onTextNoteCreated,
  onTextNotesChanged,
  onTextNoteWithIdsDeleted,
  onUpdateTotalSearchCount,
  onUpdateReplaceMode,
  onClickAddLink,
  onClickAddReferenceToChat,
  onClickAddSiglum,
  onClickAddCitation,
}: MainTextEditorProps,
  ref: ForwardedRef<HTMLMainTextEditorElement>) => {

  const { t } = useTranslation();
  const bubbleMenuRef = useRef<EditorBubbleMenuElement>(null);
  const apparatusListMenuRef = useRef<EditorOptionMenuElement>(null)
  const apparatusIdRef = useRef<string | undefined>(undefined);
  const commentCategoryListMenuRef = useRef<EditorOptionMenuElement>(null)
  const commentCategoryIdRef = useRef<string | undefined>(undefined);
  const bookmarkCategoryListMenuRef = useRef<EditorOptionMenuElement>(null)
  const bookmarkCategoryIdRef = useRef<string | undefined>(undefined);
  const contextMenuRef = useRef<EditorContextMenuElement>(null);

  const handleFocus = useCallback((data: any) => {
    const editor = data.editor;
    onFocus(editor);
    onCanUndo?.(editor.can().undo());
    onCanRedo?.(editor.can().redo());
  }, [onFocus, onCanUndo, onCanRedo])

  const clipboard = useMainTextEditorClipboard();

  const editor = useEditor({
    autofocus: false,
    extensions: [
      TocParagraph,
      MainTextPluginsExtension,
      VirtualSearchHighlight,
      CustomStyleMark,
      IndentExtension.configure({
        maxIndent: 8
      }),
      StarterKit.configure({
        codeBlock: false,
        history: {
          depth: 100,
          newGroupDelay: 500
        },
        bulletList: false,
        orderedList: false,
        heading: false, // Disable heading in StarterKit to avoid conflicts
        paragraph: false,
        bold: false,
        gapcursor: false,
      }),
      Bold,
      ExtendedListItem,
      ExtendedBulletList.configure({
        keepMarks: true,
        keepAttributes: true,
      }),
      ExtendedOrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
      }),
      CustomTextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      FontFamily.configure({
        types: ['textStyle']
      }),
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        linkOnPaste: true,
        shouldAutoLink: (url: string) => url.startsWith('http://') || url.startsWith('https://'),
        autolink: true,
      }),
      ExtendedHeading,
      ExtendedParagraph,
      CharacterSpacing.extend({
        addKeyboardShortcuts() {
          return {};
        },
      }),
      TextStyleExtended,
      LetterSpacingMark,
      LineSpacing,
      Underline,
      CodeBlock,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          color: 'white'
        }
      }),
      BookmarkMark,
      CommentMark,
      TextNote,
      Color,
      Strikethrough,
      Ligature.configure({
        ligatureTypes: {
          standard: 'common-ligatures',
          all: 'common-ligatures discretionary-ligatures historical-ligatures contextual',
          none: 'none'
        }
      }),
      LineNumbers.configure({
        show: false,
        frequency: 5,
        type: 'arabic',
      }),
      PageBreak,
      CustomSuperscript,
      CustomSubscript,
      NonPrintableCharacters,
      HorizontalRule,
      Siglum,
      SectionDivider,
      CitationMark,
      ListMarkerSyncExtension,
    ],
    editorProps: {
      handleDOMEvents: {
        keydown: (_view, event) => {
          // Block all shortcuts in TOC section or on tocParagraph nodes - only navigation allowed
          const isTocSection = mainTextEditor.currentSection === 'toc';
          const currentNodeType = _view.state.selection.$head.parent.type.name;
          const isTocParagraph = currentNodeType === 'tocParagraph';

          if (isTocSection || isTocParagraph) {
            const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown'];
            if (!allowedKeys.includes(event.key)) {
              event.preventDefault();
              event.stopPropagation();
              return true;
            }
          }

          if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey && editor && bodyStyle) {
            const state = _view.state;
            const from = state.selection.from;
            const pos = state.doc.resolve(from);
            const currentNode = pos.node();

            // Check if we're inside a list - let TipTap handle Enter key in lists
            const isInsideList = (() => {
              for (let d = pos.depth; d >= 0; d--) {
                const ancestor = pos.node(d);
                if (ancestor.type.name === 'bulletList' || ancestor.type.name === 'orderedList') {
                  return true;
                }
              }
              return false;
            })();

            if (isInsideList) {
              return false;
            }

            const $pos = state.doc.resolve(from);
            const parentEnd = $pos.end();

            const hasContentAfter = (() => {
              if (from >= parentEnd)
                return false;

              let found = false;
              state.doc.nodesBetween(from, parentEnd, (node, _pos) => {
                if (node.isText) {
                  if (node.text && node.text.trim().length > 0) {
                    found = true;
                    return false;
                  }
                } else if (node.isLeaf) {
                  found = true;
                  return false;
                }
                return true;
              });
              return found;
            })();

            if (currentNode.type.name === 'heading' || (currentNode.type.name === 'paragraph' && !hasContentAfter)) {
              event.preventDefault();
              event.stopPropagation();
              editor.commands.insertContent(paragraphTemplate(bodyStyle))
            }

            editor.commands.unsetTextNote();
            editor.commands[bodyStyle.bold ? 'setBold' : 'unsetBold']()
            editor.commands[bodyStyle.italic ? 'setItalic' : 'unsetItalic']()
          }

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
            const pasteOperation = event.shiftKey
              ? clipboard.pasteWithoutFormatting(editor)
              : clipboard.paste(editor);

            pasteOperation.then(() => {
              // Force TipTap to trigger update after paste
              mainTextEditor.forceUpdate();
            });
            return true;
          }

          // Handle editor-specific F-key shortcuts
          const editorHandledShortcuts = [
            'insertNote', 'selectAll', 'fontBold',
            'fontItalic', 'fontUnderline', 'textAlignLeft',
            'textAlignCenter', 'textAlignRight', 'textAlignJustify',
          ];
          if (isMenuShortcut(event, keyboardShortcuts, editorHandledShortcuts)) {
            return true;
          }
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        const isTocSection = mainTextEditor.currentSection === 'toc';

        if (isTocSection)
          return true;

        // Skip list handling - let ListItem extension handle it
        if (editor && (editor.isActive('bulletList') || editor.isActive('orderedList'))) {
          if (event.key === 'Enter' || event.key === 'Tab' || event.key === 'Backspace') {
            return false; // Let ListItem shortcuts handle this
          }
        }

        if ((event.key === 'Delete' || event.key === 'Backspace')) {
          const { from, to } = view.state.selection;
          const wasHandled = handleDeletion(view, from, to);
          if (wasHandled) {
            event.preventDefault();
            return true;
          }
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          if (editor?.isFocused) {
            editor?.commands.selectAll();
          }
          return true;
        }

        const insertNoteShortcut = getShortcutForMenuItem(keyboardShortcuts, 'insertNote');
        const insertNoteEnabled = editor?.state.selection.$head.parent.type.name !== 'heading';
        if (insertNoteShortcut && matchesShortcut(event, insertNoteShortcut) && insertNoteEnabled) {
          event.preventDefault();
          if (editor?.isFocused) {
            clickAddNote();
          }
          return true;
        }

        const setBoldShortcut = getShortcutForMenuItem(keyboardShortcuts, 'fontBold');
        if (setBoldShortcut && matchesShortcut(event, setBoldShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            const isBold = editor.isActive('bold');
            editor.commands[isBold ? 'unsetBold' : 'setBold']()
          }
          return true;
        }

        const setItalicShortcut = getShortcutForMenuItem(keyboardShortcuts, 'fontItalic');
        if (setItalicShortcut && matchesShortcut(event, setItalicShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            const isItalic = editor.isActive('italic');
            editor.commands[isItalic ? 'unsetItalic' : 'setItalic']()
          }
          return true;
        }

        const setUnderlineShortcut = getShortcutForMenuItem(keyboardShortcuts, 'fontUnderline');
        if (setUnderlineShortcut && matchesShortcut(event, setUnderlineShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            const isUnderline = editor.isActive('underline');
            editor.commands[isUnderline ? 'unsetUnderline' : 'setUnderline']()
          }
          return true;
        }

        const setTextAlignmentLeftShortcut = getShortcutForMenuItem(keyboardShortcuts, 'textAlignLeft');
        if (setTextAlignmentLeftShortcut && matchesShortcut(event, setTextAlignmentLeftShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            editor.commands.setTextAlign('left')
          }
          return true;
        }

        const setTextAlignmentCenterShortcut = getShortcutForMenuItem(keyboardShortcuts, 'textAlignCenter');
        if (setTextAlignmentCenterShortcut && matchesShortcut(event, setTextAlignmentCenterShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            editor.commands.setTextAlign('center')
          }
          return true;
        }

        const setTextAlignmentRightShortcut = getShortcutForMenuItem(keyboardShortcuts, 'textAlignRight');
        if (setTextAlignmentRightShortcut && matchesShortcut(event, setTextAlignmentRightShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            editor.commands.setTextAlign('right')
          }
          return true;
        }

        const setTextAlignmentJustifyShortcut = getShortcutForMenuItem(keyboardShortcuts, 'textAlignJustify');
        if (setTextAlignmentJustifyShortcut && matchesShortcut(event, setTextAlignmentJustifyShortcut)) {
          event.preventDefault();
          if (editor?.isFocused && !mainTextEditor.selectedNodesTypeNames.includes("heading")) {
            editor.commands.setTextAlign('justify')
          }
          return true;
        }

        return false
      },
    },
    onUpdate: ({ editor }) => handleOnUpdate(editor),
    onSelectionUpdate: ({ editor }) => {
      const state = editor.state;
      const { selection } = state;
      const { from, to } = selection;
      const selectedContent = state.doc.textBetween(from, to, ' ');

      onSelectedContent?.(selectedContent)
      onCanUndo?.(editor.can().undo());
      onCanRedo?.(editor.can().redo());
      onSelectionUpdate?.(editor)
      updateEmphasisState(editor);
    },
    onTransaction: ({ editor, transaction }) => {
      const selectionEnd = transaction.getMeta("selectionEnd")

      if (selectionEnd) {
        updateEmphasisState(editor);
      }
    },
    onFocus: handleFocus,
    onBlur: ({ editor, event, transaction }) => {
      onBlur?.(editor, event, transaction)
    },
  })

  if (!editor)
    throw new Error("Main Text Editor not found")

  const mainTextEditor = useMainTextEditor(editor)

  const bodyStyle = styles.find((style) => style?.type?.toString() === "P");

  const { count, isInReplaceMode, search, dispose, setActiveSearch, replaceOne, replaceAll, disableReplace, clearActiveSearch } = useSearch(editor);

  useEffect(() => {
    const updateTotalSearchCount = onUpdateTotalSearchCount.bind(null, 0);
    editor.on('onDisposedSearch', updateTotalSearchCount);

    return () => {
      editor.off('onDisposedSearch', updateTotalSearchCount);
    }
  }, [editor]);

  useEffect(() => {
    onUpdateTotalSearchCount(count ?? 0);
  }, [count]);

  useEffect(() => {
    onUpdateReplaceMode(isInReplaceMode ?? false);
  }, [isInReplaceMode]);

  const handleFind = useCallback(({ searchTerm, caseSensitive, wholeWords, documentCriteria }: SearchCriteria) => {
    dispose();

    if (!searchTerm || (!documentCriteria.includes(FIND_WHOLE_DOC) && !documentCriteria.includes(FIND_MAIN_TEXT))) return;

    search(searchTerm, caseSensitive, wholeWords);
  }, [editor]);

  const handleActiveSearch = useCallback((searchIndex: number) => {
    setActiveSearch(searchIndex);
  }, [setActiveSearch]);

  const handleClearActiveSearch = useCallback(() => {
    clearActiveSearch();
  }, [clearActiveSearch]);

  const handleDisableReplace = useCallback(() => {
    return disableReplace();
  }, [disableReplace]);

  const handleReplaceOne = useCallback((replacement: string, searchIndex: number, searchCriteria: SearchCriteria) => {
    return replaceOne(replacement, searchIndex, searchCriteria);
  }, [replaceOne]);

  const handleReplaceAll = useCallback((replacement: string, searchTerm: string) => {
    replaceAll(replacement, searchTerm);
  }, [replaceAll]);

  useImperativeHandle(ref, () => ({
    name: 'MAIN_TEXT_EDITOR',
    editor,
    disableReplace: handleDisableReplace,
    setActiveSearch: handleActiveSearch,
    clearActiveSearch: handleClearActiveSearch,
    find: handleFind,
    replace: handleReplaceOne,
    replaceAll: handleReplaceAll,
    undo: mainTextEditor.undo,
    redo: mainTextEditor.redo,
    addSiglum: mainTextEditor.addSiglum,
    setNote: (highlightColor: string, apparatusId: string) => {
      apparatusIdRef.current = apparatusId
      mainTextEditor.setNote(highlightColor)
    },
    unsetNoteWithId: mainTextEditor.unsetNoteWithId,
    scrollToNoteWithId: mainTextEditor.scrollToNoteWithId,
    setHeading: mainTextEditor.setHeading,
    setBody: mainTextEditor.setBody,
    setCustomStyle: mainTextEditor.setCustomStyle,
    setFontFamily: mainTextEditor.setFontFamily,
    setFontSize: mainTextEditor.setFontSize,
    setBold: mainTextEditor.setBold,
    toggleBold: mainTextEditor.toggleBold,
    unsetBold: mainTextEditor.unsetBold,
    setItalic: mainTextEditor.setItalic,
    unsetItalic: mainTextEditor.unsetItalic,
    setUnderline: mainTextEditor.setUnderline,
    unsetUnderline: mainTextEditor.unsetUnderline,
    setTextColor: mainTextEditor.setTextColor,
    setHighlightColor: mainTextEditor.setHighlightColor,
    setBlockquote: mainTextEditor.setBlockquote,
    setTextAlignment: mainTextEditor.setTextAlignment,
    setLineSpacing: mainTextEditor.setLineSpacing,
    setListStyle: mainTextEditor.setListStyle,
    setShowNonPrintingCharacters: mainTextEditor.setShowNonPrintingCharacters,
    setListNumbering: mainTextEditor.setListNumbering,
    setOrderedListType: mainTextEditor.setOrderedListType,
    continuePreviousNumbering: mainTextEditor.continuePreviousNumbering,
    getSuggestedStartNumber: mainTextEditor.getSuggestedStartNumber,
    setStrikeThrough: mainTextEditor.setStrikeThrough,
    setPageBreak: mainTextEditor.setPageBreak,
    setSuperscript: (value: boolean) => {
      mainTextEditor.setSuperscript(value)

      // @REFACTOR: THIS IS A WORKAROUND AND SHOULD BE MOVED IN ANOTHER FUNCTION
      setTimeout(() => {
        if (editor) {
          updateEmphasisState(editor);
        }
      });
    },
    unsetSuperscript: mainTextEditor.unsetSuperscript,
    setSubscript: (value: boolean) => {
      mainTextEditor.setSubscript(value)

      // @REFACTOR: THIS IS A WORKAROUND AND SHOULD BE MOVED IN ANOTHER FUNCTION
      setTimeout(() => {
        if (editor) {
          updateEmphasisState(editor);
        }
      });
    },
    unsetSubscript: mainTextEditor.unsetSubscript,
    addBookmark: (color: string, categoryId?: string) => {
      bookmarkCategoryIdRef.current = categoryId;
      mainTextEditor.addBookmark(color)
    },
    unsetBookmarksWithIds: (ids: string[]) => {
      editor.commands.unsetBookmarksWithIds(ids)
    },
    scrollToBookmark: mainTextEditor.scrollToBookmark,
    addComment: (color: string, categoryId?: string) => {
      commentCategoryIdRef.current = categoryId;
      mainTextEditor.addComment(color)
    },
    unsetCommentsWithIds: (ids: string[]) => {
      editor.commands.unsetCommentsWithIds(ids)
    },
    scrollToComment: mainTextEditor.scrollToComment,
    getCommentsIds: mainTextEditor.getCommentsIds,
    scrollToSection: mainTextEditor.scrollToSection,
    setLigature: mainTextEditor.setLigature,
    setCase: mainTextEditor.setCase,
    increaseIndent: mainTextEditor.increaseIndent,
    decreaseIndent: mainTextEditor.decreaseIndent,
    increaseCharacterSpacing: mainTextEditor.increaseCharacterSpacing,
    decreaseCharacterSpacing: mainTextEditor.decreaseCharacterSpacing,
    unsetCharacterSpacing: mainTextEditor.unsetCharacterSpacing,
    scrollToHeadingIndex: mainTextEditor.scrollToHeadingIndex,
    selectedInnerHtmlString: mainTextEditor.selectedInnerHtmlString,
    selectedText: mainTextEditor.selectedText,
    selectedContentJSON: mainTextEditor.selectedContentJSON,
    selectedContentString: mainTextEditor.selectedContentString,
    deleteSelection: () => {
      const { from, to } = editor.state.selection;
      const wasHandled = handleDeletion(editor.view, from, to);
      if (!wasHandled) {
        editor.commands.deleteSelection();
      }
    },
    focus: () => {
      editor.commands.focus()
    },
    insertCharacter: mainTextEditor.insertCharacter,
    insertNodeContentsFromContent: mainTextEditor.insertNodeContentsFromContent,
    insertContent: mainTextEditor.insertContent,
    setLink: mainTextEditor.setLink,
    removeLink: mainTextEditor.removeLink,
    unsetAllMarks: mainTextEditor.unsetAllMarks,
    selectAll: mainTextEditor.selectAll,
    deselectAll: mainTextEditor.deselectAll,
    chain: () => editor?.chain(),
    getState: () => editor.state,
    getJSON: (styles) => {
      let jsonContent = editor.getJSON()

      const headingOneStyle = styles.find(style => style.type === 'H1') // Title
      const headingTwoStyle = styles.find(style => style.type === 'H2') // Heading 1
      const headingThreeStyle = styles.find(style => style.type === 'H3') // Heading 2
      const headingFourStyle = styles.find(style => style.type === 'H4') // Heading 3
      const headingFiveStyle = styles.find(style => style.type === 'H5') // Heading 4
      const headingSixStyle = styles.find(style => style.type === 'H6') // Heading 5

      jsonContent = {
        ...jsonContent,
        content: jsonContent.content?.map(data => {
          if (data.type === 'heading' && data.attrs?.level === 1) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingOneStyle?.fontSize,
                fontWeight: headingOneStyle?.bold ? "bold" : "normal",
                fontStyle: headingOneStyle?.italic ? "italic" : "normal",
                color: headingOneStyle?.color,
                fontFamily: headingOneStyle?.fontFamily,
                textAlign: headingOneStyle?.align,
                lineHeight: headingOneStyle?.lineHeight,
              }
            }
          }
          else if (data.type === 'heading' && data.attrs?.level === 2) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingTwoStyle?.fontSize,
                fontWeight: headingTwoStyle?.bold ? "bold" : "normal",
                fontStyle: headingTwoStyle?.italic ? "italic" : "normal",
                color: headingTwoStyle?.color,
                fontFamily: headingTwoStyle?.fontFamily,
                textAlign: headingTwoStyle?.align,
                lineHeight: headingTwoStyle?.lineHeight,
              }
            }
          }
          else if (data.type === 'heading' && data.attrs?.level === 3) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingThreeStyle?.fontSize,
                fontWeight: headingThreeStyle?.bold ? "bold" : "normal",
                fontStyle: headingThreeStyle?.italic ? "italic" : "normal",
                color: headingThreeStyle?.color,
                fontFamily: headingThreeStyle?.fontFamily,
                textAlign: headingThreeStyle?.align,
                lineHeight: headingThreeStyle?.lineHeight,
              }
            }
          }
          else if (data.type === 'heading' && data.attrs?.level === 4) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingFourStyle?.fontSize,
                fontWeight: headingFourStyle?.bold ? "bold" : "normal",
                fontStyle: headingFourStyle?.italic ? "italic" : "normal",
                color: headingFourStyle?.color,
                fontFamily: headingFourStyle?.fontFamily,
                textAlign: headingFourStyle?.align,
                lineHeight: headingFourStyle?.lineHeight,
              }
            }
          }
          else if (data.type === 'heading' && data.attrs?.level === 5) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingFiveStyle?.fontSize,
                fontWeight: headingFiveStyle?.bold ? "bold" : "normal",
                fontStyle: headingFiveStyle?.italic ? "italic" : "normal",
                color: headingFiveStyle?.color,
                fontFamily: headingFiveStyle?.fontFamily,
                textAlign: headingFiveStyle?.align,
                lineHeight: headingFiveStyle?.lineHeight,
              }
            }
          }
          else if (data.type === 'heading' && data.attrs?.level === 6) {
            return {
              ...data,
              attrs: {
                ...data.attrs,
                fontSize: headingSixStyle?.fontSize,
                fontWeight: headingSixStyle?.bold ? "bold" : "normal",
                fontStyle: headingSixStyle?.italic ? "italic" : "normal",
                color: headingSixStyle?.color,
                fontFamily: headingSixStyle?.fontFamily,
                textAlign: headingSixStyle?.align,
                lineHeight: headingSixStyle?.lineHeight,
              }
            }
          }
          return data
        })
      }

      return jsonContent
    },
    getHTML: () => editor.getHTML(),
    setContent: mainTextEditor.setContent,
    insertCitation: mainTextEditor.insertCitation,
    insertBibliographies: mainTextEditor.insertBibliographies,
    cut: () => clipboard.cut(editor),
    copy: () => clipboard.copy(editor),
    paste: () => clipboard.paste(editor),
    pasteWithoutFormatting: () => clipboard.pasteWithoutFormatting(editor),
  }), [commentCategoryIdRef.current, bookmarkCategoryIdRef.current, mainTextEditor, styles])

  const dispatch = useDispatch();

  const dataForNodeType = (editor: Editor, type: string) => {
    const { state } = editor
    const { from, to } = state.selection;

    if (from === to)
      return {
        nodes: [],
        uniqueNodes: [],
        childNodes: [],
        uniqueChildNodes: [],
        marks: [],
        uniqueMarks: [],
      }

    const nodes: Node[] = []
    const childNodes: Node[] = []
    const marks: Mark[] = []

    const hasUnmarkedText = (() => {
      let foundUnmarkedText = false;

      editor.state.doc.nodesBetween(from, to, (node: Node, _pos: number) => {
        if (node.isText && node.text) {
          if (node.marks.length === 0) {
            foundUnmarkedText = true;
            return false;
          }
        }
        return true;
      });

      return foundUnmarkedText;
    })();

    editor.state.doc.nodesBetween(from, to, (node: Node, _pos: number, parent: Node | null, _index) => {
      if (parent?.type.name === type) {
        nodes.push(parent)
        childNodes.push(node)
        marks.push(...node.marks)
      }
    });

    const uniqueNodes = nodes
      .filter((item, index, self) => index === self.findIndex(obj => JSON.stringify(obj.attrs) === JSON.stringify(item.attrs)));

    const uniqueChildNodes = childNodes
      .filter((item, index, self) => index === self.findIndex(obj => JSON.stringify(obj.attrs) === JSON.stringify(item.attrs)));

    const uniqueMarks = marks
      .filter((mark, index, self) => index === self.findIndex(obj => JSON.stringify(obj) === JSON.stringify(mark)));

    return {
      nodes,
      uniqueNodes,
      childNodes,
      uniqueChildNodes,
      marks,
      uniqueMarks,
      hasUnmarkedText,
    }
  }

  const handleHeadingData = (editor: Editor) => {
    const {
      uniqueNodes,
      uniqueMarks,
      hasUnmarkedText,
    } = dataForNodeType(editor, 'heading')

    const attributes = uniqueNodes.map(node => node.attrs)
    const marksTextStyle = uniqueMarks.filter(data => data.type.name === "textStyle")
    const marksCustomStyle = uniqueMarks.filter(data => data.type.name === "customStyleMark")

    const fontFamilies = attributes.map(attr => attr.fontFamily)
    const marksFontFamilies = marksTextStyle.flatMap(data => data.attrs.fontFamily)
    const marksCustomFontFamilies = marksCustomStyle.flatMap(data => data.attrs.fontFamily)
    const allFontFamilies = new Set([...fontFamilies, ...marksFontFamilies, ...marksCustomFontFamilies])

    const fontSizes = attributes.map(attr => attr.fontSize)
    const marksFontSizes = marksTextStyle.flatMap(data => data.attrs.fontSize)
    const marksCustomFontSizes = marksCustomStyle.flatMap(data => data.attrs.fontSize)
    const allFontSizes = new Set([...fontSizes, ...marksFontSizes, ...marksCustomFontSizes])

    const colors = attributes.map(attr => attr.color)
    const marksColors = marksTextStyle.flatMap(data => data.attrs.color)
    const marksCustomColors = marksCustomStyle.flatMap(data => data.attrs.color)
    const allColors = new Set([...colors, ...marksColors, ...marksCustomColors].filter(Boolean))

    const tmpFontFamilies = hasUnmarkedText ? allFontFamilies : new Set([...marksFontFamilies, ...marksCustomFontFamilies])
    const tmpFontSizes = hasUnmarkedText ? allFontSizes : new Set([...marksFontSizes, ...marksCustomFontSizes])
    const tmpColors = hasUnmarkedText ? allColors : new Set([...marksColors, ...marksCustomColors])

    return {
      headingsTypes: uniqueNodes.length,
      hasHeadings: uniqueNodes.length > 0,
      hasOneHeading: uniqueNodes.length === 1,
      hasMultipleHeadingTypes: uniqueNodes.length > 1,
      headingFontFamilies: tmpFontFamilies,
      hasMultipleHeadingFontFamilies: tmpFontFamilies.size > 1,
      headingFontSizes: tmpFontSizes,
      hasMultipleHeadingFontSizes: tmpFontSizes.size > 1,
      headingColors: tmpColors,
      hasMultipleHeadingColors: tmpColors.size > 1,
    }
  }

  const handleParagraphData = (editor: Editor) => {
    const {
      nodes,
      uniqueNodes,
      uniqueMarks,
      hasUnmarkedText,
    } = dataForNodeType(editor, 'paragraph');

    const attributes = uniqueNodes.map(node => node.attrs)
    const marksTextStyle = uniqueMarks.filter(data => data.type.name === "textStyle")
    const marksCustomStyle = uniqueMarks.filter(data => data.type.name === "customStyleMark")

    const fontFamilies = attributes.map(attr => attr.fontFamily)
    const marksFontFamilies = marksTextStyle.flatMap(data => data.attrs.fontFamily)
    const marksCustomFontFamilies = marksCustomStyle.flatMap(data => data.attrs.fontFamily)
    const allFontFamilies = new Set([...fontFamilies, ...marksFontFamilies, ...marksCustomFontFamilies])

    const fontSizes = attributes.map(attr => attr.fontSize)
    const marksFontSizes = marksTextStyle.flatMap(data => data.attrs.fontSize)
    const marksCustomFontSizes = marksCustomStyle.flatMap(data => data.attrs.fontSize)
    const allFontSizes = new Set([...fontSizes, ...marksFontSizes, ...marksCustomFontSizes])

    const colors = attributes.map(attr => attr.color)
    const marksColors = marksTextStyle.flatMap(data => data.attrs.color)
    const marksCustomColors = marksCustomStyle.flatMap(data => data.attrs.color)
    const allColors = new Set([...colors, ...marksColors, ...marksCustomColors].filter(Boolean))

    const tmpFontFamilies = hasUnmarkedText ? allFontFamilies : new Set([...marksFontFamilies, ...marksCustomFontFamilies])
    const tmpFontSizes = hasUnmarkedText ? allFontSizes : new Set([...marksFontSizes, ...marksCustomFontSizes])
    const tmpColors = hasUnmarkedText ? allColors : new Set([...marksColors, ...marksCustomColors])

    const styleIds = marksCustomStyle.map(data => data.attrs.styleId)
    const uniqueStyleIds = new Set(styleIds);

    return {
      paragraphLength: nodes.length,
      hasParagraphs: nodes.length > 0,
      paragraphFontFamilies: tmpFontFamilies,
      hasMultipleParagraphFontFamilies: tmpFontFamilies.size > 1,
      paragraphFontSizes: tmpFontSizes,
      hasMultipleParagraphFontSizes: tmpFontSizes.size > 1,
      paragraphColors: tmpColors,
      hasMultipleParagraphColors: tmpColors.size > 1,
      paragraphStyleIds: uniqueStyleIds,
      hasMultipleParagraphStyleIds: uniqueStyleIds.size > 1,
    }
  }

  const getUniqueAttribute = <T extends number | string | null>(type: string, attributeName: string, defaultValue: T, nullReplacement: any = null): T => {
    const { state } = editor
    const { from, to } = state.selection;
    const attrs = new Set<T>();
    const markAttributes = editor.getAttributes(type);
    let attrValue = attributeName in markAttributes && markAttributes[attributeName] ? markAttributes[attributeName] : defaultValue;
    if (from !== to) {
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === type && mark.attrs[attributeName]) {
              let valueToAdd = mark.attrs[attributeName];
              if (attributeName === 'fontSize' && typeof valueToAdd === 'string') {
                const numericValue = Number.parseFloat(valueToAdd);
                if (!Number.isNaN(numericValue)) {
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
      attrValue = Number.parseFloat(attrValue as unknown as string) as T;
    }
    return attrValue;
  };

  const getHeadingLevel = useCallback((editor: Editor): number | undefined => {
    const {
      hasOneHeading,
      hasMultipleHeadingTypes,
    } = handleHeadingData(editor)
    const {
      hasParagraphs,
    } = handleParagraphData(editor)

    const heading = editor.getAttributes("heading")
    const customHeading = editor.getAttributes("customHeading")
    const customStyleMark = editor.getAttributes("customStyleMark");

    const isCustomHeading = editor.isActive("customHeading");
    const isParagraph = editor.isActive("paragraph");
    const activeHeading = isCustomHeading ? customHeading : heading;

    const noHeadingLevel = (hasMultipleHeadingTypes || (hasOneHeading && hasParagraphs));
    if (customStyleMark.styleId) return undefined;
    if (noHeadingLevel) return undefined;

    if (hasParagraphs && !hasOneHeading && !hasMultipleHeadingTypes) return 0;

    if (isParagraph) return 0;

    return activeHeading?.level !== undefined ? activeHeading.level : undefined;
  }, [handleHeadingData, handleParagraphData]);

  const getStyleId = useCallback((editor: Editor): string | undefined => {
    const { state } = editor;
    const { from, to } = state.selection;

    const {
      hasOneHeading,
      hasMultipleHeadingTypes,
    } = handleHeadingData(editor);

    const {
      hasParagraphs,
      hasMultipleParagraphStyleIds,
    } = handleParagraphData(editor);

    const customStyleMark = editor.getAttributes("customStyleMark");

    if (hasMultipleHeadingTypes || (hasOneHeading && hasParagraphs) || hasMultipleParagraphStyleIds) {
      return undefined;
    }

    if (from === to) {
      return customStyleMark.styleId ?? undefined;
    }

    const styleIds = new Set<string>();
    let hasTextWithoutCustomStyle = false;

    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText && node.text) {
        const nodeStart = pos;
        const nodeEnd = pos + node.nodeSize;
        const selectionStart = Math.max(from, nodeStart);
        const selectionEnd = Math.min(to, nodeEnd);

        if (selectionStart < selectionEnd) {
          const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");

          if (customStyleMark?.attrs.styleId) {
            styleIds.add(customStyleMark.attrs.styleId);
          } else {
            hasTextWithoutCustomStyle = true;
          }
        }
      }
    });

    if (hasTextWithoutCustomStyle && styleIds.size > 0) {
      return undefined; // Mixed styling
    }

    if (styleIds.size > 1) {
      return undefined; // Multiple custom styles
    }

    if (styleIds.size === 1) {
      return Array.from(styleIds)[0];
    }

    return undefined;
  }, [handleHeadingData, handleParagraphData])

  const getFontFamily = useCallback((editor: Editor): string => {
    const { state } = editor;
    const { from, to } = state.selection;

    const {
      hasMultipleHeadingFontFamilies,
    } = handleHeadingData(editor);

    const {
      hasMultipleParagraphFontFamilies,
    } = handleParagraphData(editor);

    const textStyle = editor.getAttributes("textStyle");
    const customStyleMark = editor.getAttributes("customStyleMark");
    const heading = editor.getAttributes("heading");
    const customHeading = editor.getAttributes("customHeading");
    const paragraph = editor.getAttributes("paragraph");

    if (hasMultipleHeadingFontFamilies || hasMultipleParagraphFontFamilies) {
      return '';
    }

    if (from === to) {
      return (
        customStyleMark.fontFamily ||
        textStyle?.fontFamily ||
        customHeading?.fontFamily ||
        heading?.fontFamily ||
        paragraph?.fontFamily ||
        'Times New Roman'
      );
    }

    const fontFamilies = new Set<string>();
    const defaultFontFamily = 'Times New Roman';

    state.doc.nodesBetween(from, to, (node, pos, parent) => {
      if (node.isText && node.text) {
        const nodeStart = pos;
        const nodeEnd = pos + node.nodeSize;
        const selectionStart = Math.max(from, nodeStart);
        const selectionEnd = Math.min(to, nodeEnd);

        if (selectionStart < selectionEnd) {
          let effectiveFontFamily = defaultFontFamily;

          const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");
          const textStyleMark = node.marks?.find(mark => mark.type.name === "textStyle");

          if (customStyleMark?.attrs.fontFamily) {
            effectiveFontFamily = customStyleMark.attrs.fontFamily;
          } else if (textStyleMark?.attrs.fontFamily) {
            effectiveFontFamily = textStyleMark.attrs.fontFamily;
          } else {
            if (
              parent &&
              (parent.type.name === 'paragraph' ||
                parent.type.name === 'heading' ||
                parent.type.name === 'customHeading')
            ) {
              if (parent.attrs?.fontFamily) {
                effectiveFontFamily = parent.attrs.fontFamily;
              }
            }

            if (effectiveFontFamily === defaultFontFamily) {
              const $pos = state.doc.resolve(pos);
              for (let d = $pos.depth; d >= 0; d--) {
                const parentNode = $pos.node(d);
                if (
                  (parentNode.type.name === 'paragraph' ||
                    parentNode.type.name === 'heading' ||
                    parentNode.type.name === 'customHeading') &&
                  parentNode.attrs?.fontFamily
                ) {
                  effectiveFontFamily = parentNode.attrs.fontFamily;
                  break;
                }
              }
            }
          }

          fontFamilies.add(effectiveFontFamily);
        }
      }
    });

    if (fontFamilies.size > 1) {
      return '';
    }

    if (fontFamilies.size === 1) {
      return Array.from(fontFamilies)[0];
    }

    return defaultFontFamily;
  }, [handleHeadingData, handleParagraphData]);

  const getFontSize = useCallback((editor: Editor): string => {
    const { hasMultipleHeadingFontSizes, hasOneHeading } = handleHeadingData(editor);
    const { hasMultipleParagraphFontSizes, hasParagraphs } = handleParagraphData(editor);
    const textStyle = editor.getAttributes("textStyle");
    const customStyleMark = editor.getAttributes("customStyleMark");
    const heading = editor.getAttributes("heading");
    const customHeading = editor.getAttributes("customHeading");
    const paragraph = editor.getAttributes("paragraph");

    if (hasMultipleHeadingFontSizes || hasMultipleParagraphFontSizes || (hasOneHeading && hasParagraphs)) {
      return '0pt';
    }

    if (editor.state.selection.from === editor.state.selection.to) {
      return (
        customStyleMark?.fontSize ||
        textStyle?.fontSize ||
        customHeading?.fontSize ||
        heading?.fontSize ||
        paragraph?.fontSize ||
        defaultHeadingStyles[(customHeading?.level ?? heading?.level ?? 1) - 1]?.fontSize ||
        defaultParagraphStyle.fontSize
      );
    }

    const { state } = editor;
    const { from, to } = state.selection;
    const fontSizes = new Set<string>();

    state.doc.nodesBetween(from, to, (node, _pos, parent) => {
      if (node.isText && node.text) {
        let effectiveFontSize: string | undefined = undefined;

        const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");
        const textStyleMark = node.marks?.find(mark => mark.type.name === "textStyle");

        if (typeof customStyleMark?.attrs.fontSize === "string") {
          effectiveFontSize = customStyleMark.attrs.fontSize;
        } else if (typeof textStyleMark?.attrs.fontSize === "string") {
          effectiveFontSize = textStyleMark.attrs.fontSize;
        } else if (
          parent &&
          (parent.type.name === 'paragraph' ||
            parent.type.name === 'heading' ||
            parent.type.name === 'customHeading')
        ) {
          if (typeof parent.attrs?.fontSize === "string") {
            effectiveFontSize = parent.attrs.fontSize;
          }
        }

        if (!effectiveFontSize) {
          if (parent?.type.name === 'heading' || parent?.type.name === 'customHeading') {
            const level = parent.attrs?.level ?? 1;
            effectiveFontSize = defaultHeadingStyles[level - 1]?.fontSize ?? defaultParagraphStyle.fontSize;
          } else if (parent?.type.name === 'paragraph') {
            effectiveFontSize = defaultParagraphStyle.fontSize;
          }
        }

        if (effectiveFontSize) {
          fontSizes.add(effectiveFontSize);
        }
      }
    });

    if (fontSizes.size > 1) {
      return '';
    }
    if (fontSizes.size === 1) {
      return Array.from(fontSizes)[0];
    }

    return defaultParagraphStyle.fontSize;
  }, [handleHeadingData, handleParagraphData]);

  const getUnderlineState = useCallback((editor: Editor): boolean => {
    const { state } = editor;
    const { from, to } = state.selection;

    // Cursor position: check if the current node or parent node has underline styling
    if (from === to) {
      const $pos = state.selection.$from;
      if (editor.isActive("underline")) {
        return true;
      }
      // Controlla anche parent node per underline come attributo
      for (let d = $pos.depth; d >= 0; d--) {
        const parentNode = $pos.node(d);
        if (
          (parentNode.type.name === 'heading' || parentNode.type.name === 'paragraph') &&
          parentNode.attrs?.textDecoration === 'underline'
        ) {
          return true;
        }
      }
      return false;
    }

    // Selection: check if all text in the selection has underline styling
    let hasUnderline = false;
    let hasNotUnderline = false;

    state.doc.nodesBetween(from, to, (node, _pos, parent) => {
      if (node.isText && node.text) {
        const isUnderlineMark = node.marks?.some(mark => mark.type.name === "underline");
        let isUnderlineParent = false;
        if (
          parent &&
          (parent.type.name === 'heading' || parent.type.name === 'paragraph') &&
          parent.attrs?.textDecoration === 'underline'
        ) {
          isUnderlineParent = true;
        }
        if (isUnderlineMark || isUnderlineParent) {
          hasUnderline = true;
        } else {
          hasNotUnderline = true;
        }
      }
    });

    if (hasUnderline && hasNotUnderline) return false;
    if (hasUnderline) return true;
    return false;
  }, []);

  const getStrikeState = useCallback((editor: Editor): boolean => {
    const { state } = editor;
    const { from, to } = state.selection;

    // Cursore position: check if the current node has strike styling
    if (from === to) {
      return editor.isActive("strike");
    }

    // Selection: check if all text in the selection has strike styling
    let hasStrike = false;
    let hasNotStrike = false;

    state.doc.nodesBetween(from, to, (node) => {
      if (node.isText && node.text) {
        const isStrikeMark = node.marks?.some(mark => mark.type.name === "strike");
        if (isStrikeMark) {
          hasStrike = true;
        } else {
          hasNotStrike = true;
        }
      }
    });

    if (hasStrike && hasNotStrike) return false;
    if (hasStrike) return true;
    return false;
  }, []);

  const getAlignment = useCallback((editor: Editor): Alignment => {
    const { state } = editor;
    const { from, to } = state.selection;
    const customStyleMark = editor.getAttributes("customStyleMark");

    // Cursor position: check customStyleMark first, then parent node, then fallback
    if (from === to) {
      if (customStyleMark.align) return customStyleMark.align;
      const $pos = state.selection.$from;
      for (let d = $pos.depth; d >= 0; d--) {
        const parentNode = $pos.node(d);
        // Only consider paragraph or heading nodes with textAlign attribute
        if (
          (parentNode.type.name === "paragraph" || parentNode.type.name === "heading") &&
          parentNode.attrs?.textAlign
        ) {
          return parentNode.attrs.textAlign;
        }
      }
      // Fallback to left alignment
      return "left";
    }

    // Selection: collect all alignments from marks and parent nodes
    const alignments = new Set<string>();
    state.doc.nodesBetween(from, to, (node, _pos, parent) => {
      if (node.isText && node.text) {
        let effectiveAlign = "left";
        const customStyleMark = node.marks?.find(mark => mark.type.name === "customStyleMark");
        if (customStyleMark?.attrs.align) {
          effectiveAlign = customStyleMark.attrs.align;
        } else if (
          parent &&
          (parent.type.name === "paragraph" || parent.type.name === "heading") &&
          parent.attrs?.textAlign
        ) {
          effectiveAlign = parent.attrs.textAlign;
        }
        alignments.add(effectiveAlign);
      }
    });

    if (alignments.size > 1) return "";
    if (alignments.size === 1) return Array.from(alignments)[0] as Alignment;
    return "left";
  }, []);

  const getCurrentSpacing = useCallback((editor: Editor): Spacing => {
    const customStyleMark = editor.getAttributes("customStyleMark");

    const currentSpacing = {
      before: customStyleMark.marginTop || getUniqueAttribute<number | null>("paragraph", 'marginTop', null, null),
      after: customStyleMark.marginBottom || getUniqueAttribute<number | null>("paragraph", 'marginBottom', null, null),
      line: customStyleMark.lineHeight || getUniqueAttribute<number>("paragraph", 'lineHeight', 1, null),
    }
    return currentSpacing;
  }, [editor]);

  const updateSelectionType = useCallback((editor: Editor) => {
    const { state } = editor;
    let nodeType: string | null = null;
    let isMixed = false;
    let onlyHeading = true;
    let onlyParagraph = true;

    state.doc.nodesBetween(state.selection.from, state.selection.to, (node) => {
      if (node.isText) return;
      if (node.type.name !== 'paragraph' && node.type.name !== 'heading') return;
      if (!nodeType) nodeType = node.type.name;
      if (node.type.name !== nodeType) isMixed = true;
      if (node.type.name !== 'heading') onlyHeading = false;
      if (node.type.name !== 'paragraph') onlyParagraph = false;
    });

    let selectionType: 'heading' | 'paragraph' | 'mixed' | null = null;
    if (isMixed) {
      selectionType = 'mixed';
    } else if (onlyHeading) {
      selectionType = 'heading';
    } else if (onlyParagraph) {
      selectionType = 'paragraph';
    }

    dispatch(setSelectedNodeType(selectionType));
  }, [dispatch]);

  const updateEmphasisState = useCallback((editor: Editor) => {
    const state = editor.view.state;
    const from = state.selection.from;
    const pos = state.doc.resolve(from);
    const currentNode = pos.node();
    const currentNodeAttributes = currentNode.attrs;

    const customStyleMarkAttributes = editor.getAttributes("customStyleMark")
    const textStyleAttributes = editor.getAttributes("textStyle")

    // Workaround to remove quotes from font family
    const stripQuotes = (value: string): string => {
      if (!value) return value;
      // Remove &quot; entities
      let cleaned = value.replaceAll('&quot;', '"');
      // Remove surrounding quotes (start and end)
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned;
    };

    const currentHeadingLevel = getHeadingLevel(editor);
    const currentStyleId = getStyleId(editor);
    const currentFontFamily = stripQuotes(getFontFamily(editor))
    const currentFontSize = getFontSize(editor);
    const fontWeight = customStyleMarkAttributes?.fontWeight || currentNodeAttributes.fontWeight || 'normal';
    const fontStyle = customStyleMarkAttributes?.fontStyle || currentNodeAttributes.fontStyle || 'normal';
    const bold = editor.isActive("bold") || fontWeight === 'bold';
    const italic = editor.isActive("italic") || fontStyle === 'italic';
    const isUnderline = getUnderlineState(editor);
    const isStrike = getStrikeState(editor);
    const textColor = textStyleAttributes.color || customStyleMarkAttributes?.color || currentNodeAttributes.color || '#000000';
    const highlight = editor.getAttributes("highlight")?.color || '#ffffff';
    const currentAlignment = getAlignment(editor);
    const currentSpacing = getCurrentSpacing(editor);

    const bulletList = editor.getAttributes("bulletList");
    const orderedList = editor.getAttributes("orderedList");

    const bulletStyle = bulletList?.bulletType || 'disc';
    const orderListStyle = orderedListTypeToStyle[orderedList?.listType] || 'decimal';

    const currentListStyle = editor.isActive("bulletList") ? bulletStyle : editor.isActive("orderedList") ? orderListStyle : ''

    updateSelectionType(editor);
    onFontFamilyChange?.(currentFontFamily)
    onFontSizeChange?.(currentFontSize)

    const newEmphasisState: EmphasisState = {
      styleId: currentStyleId,
      headingLevel: currentHeadingLevel,
      fontFamily: currentFontFamily,
      fontSize: currentFontSize,
      bold,
      italic,
      underline: isUnderline,
      strikethrough: isStrike,
      textColor,
      highlight,
      alignment: currentAlignment,
      blockquote: editor.isActive("note"),
      isCodeBlock: editor.isActive("codeBlock"),
      bulletStyle: {
        type: '',
        style: '',
        previousType: '',
      },
      superscript: editor.isActive("superscript"),
      subscript: editor.isActive("subscript"),
      spacing: currentSpacing,
      link: getUniqueAttribute<string>("link", 'href', ''),
      listStyle: currentListStyle,
    };
    onEmphasisStateChange(newEmphasisState);
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      onCanUpdate()
    }, 2000);
    return () => clearTimeout(timer);
  }, [onCanUpdate]);

  const handleOnUpdate = useCallback((editor: Editor) => {
    onUpdate?.(editor);
    updateEmphasisState(editor);
  }, [])

  useEffect(() => {
    editor.setEditable(editable)
  }, [editable])

  const selectionIncludesTOC = useCallback((state: any, from: number, to: number): boolean => {
    let foundTOC = false;

    // check if the selection includes a TOC section
    state.doc.nodesBetween(from, to, (node: any) => {
      if (node.type.name === 'sectionDivider' && node.attrs?.sectionType === 'toc') {
        foundTOC = true;
        return false;
      }
      return true;
    });
    return foundTOC;
  }, []);

  const getTOCSectionRange = useCallback((state: any): { from: number, to: number } | null => {
    const sections: { type: string, pos: number, nodeSize: number }[] = [];

    // Push all section into sections array
    state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'sectionDivider') {
        sections.push({
          type: node.attrs?.sectionType || 'unknown',
          pos: pos,
          nodeSize: node.nodeSize
        });
      }
      return true;
    });

    // Find the TOC section index
    const tocIndex = sections.findIndex(section => section.type === 'toc');

    if (tocIndex === -1) {
      return null;
    }

    const tocStart = sections[tocIndex].pos;
    let tocEnd: number;

    // If there is a next section, use that as the end
    if (tocIndex + 1 < sections.length) {
      tocEnd = sections[tocIndex + 1].pos;
    } else {
      // Else use the end of the document
      tocEnd = state.doc.content.size;
    }

    return { from: tocStart, to: tocEnd };
  }, []);

  const processNodeForDeletion = useCallback((
    node: any,
    pos: number,
    selectionFrom: number,
    selectionTo: number,
    deletions: any[]
  ) => {
    // Keep section dividers intact
    if (node.type.name === 'sectionDivider') {
      return false;
    }

    // Keep section headings
    // if (node.type.name === 'heading' && node.attrs?.level === 1) {
    //   return false;
    // }

    const nodeFrom = Math.max(pos, selectionFrom);
    const nodeTo = Math.min(pos + node.nodeSize, selectionTo);

    if (nodeFrom < nodeTo) {
      if (node.type.name === 'paragraph' ||
        (node.type.name === 'heading' && node.attrs?.level !== 1)) {

        if (node.content && node.content.size > 0) {
          // Calculate the start and end positions of the node content
          const nodeContentStart = pos + 1;
          const nodeContentEnd = pos + node.nodeSize - 1;

          // Calculate intersection between selection and node content
          const contentDeleteStart = Math.max(nodeContentStart, selectionFrom);
          const contentDeleteEnd = Math.min(nodeContentEnd, selectionTo);

          if (contentDeleteStart < contentDeleteEnd) {
            deletions.push({ from: contentDeleteStart, to: contentDeleteEnd });
          }
        }
      } else {
        deletions.push({ from: nodeFrom, to: nodeTo });
      }
    }

    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      return false;
    }

    return true;
  }, []);

  const handleDeletion = useCallback((view: any, from: number, to: number): boolean => {
    if (from === to) return false; // No Selection

    const tocRange = getTOCSectionRange(view.state);

    const includesTOC = selectionIncludesTOC(view.state, from, to);

    // Check if the selection includes the TOC or overlaps with it
    const touchesToC = tocRange && (
      includesTOC || (from < tocRange.to && to > tocRange.from) || (from < tocRange.from && to > tocRange.to)
    );

    if (touchesToC && tocRange) {

      let tr = view.state.tr;
      const deletions: { from: number, to: number }[] = [];

      // Delete content BEFORE the TOC if the selection starts before it
      if (from < tocRange.from) {
        view.state.doc.nodesBetween(from, Math.min(to, tocRange.from), (node, pos) => {
          return processNodeForDeletion(node, pos, from, Math.min(to, tocRange.from), deletions);
        });
      }

      // Delete the content AFTER the TOC if the selection ends after it
      if (to > tocRange.to) {
        view.state.doc.nodesBetween(Math.max(from, tocRange.to), to, (node, pos) => {
          return processNodeForDeletion(node, pos, Math.max(from, tocRange.to), to, deletions);
        });
      }

      // Apply deletions in reverse order to avoid position shifts
      deletions.sort((a, b) => b.from - a.from).forEach(deletion => {
        tr = tr.delete(deletion.from, deletion.to);
      });

      let newCursorPos: number;
      if (includesTOC) {
        // If the selection included the TOC, place the cursor at the end of the TOC
        newCursorPos = tocRange.to;
      } else if (from < tocRange.from) {
        // If the selection started before the TOC, place the cursor at the start of the TOC
        newCursorPos = tocRange.from;
      } else {
        // Else put the cursor at the end of the TOC
        newCursorPos = tocRange.to;
      }

      newCursorPos = Math.min(newCursorPos, tr.doc.content.size);
      newCursorPos = Math.max(newCursorPos, 0);

      tr = tr.setSelection(TextSelection.create(tr.doc, newCursorPos));
      view.dispatch(tr);

      return true; // Deletion was handled correctly
    }

    return false; // Deletion not handled
  }, [getTOCSectionRange, selectionIncludesTOC]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      for (const mark of node?.marks ?? []) {
        if (mark.type.name === 'comment') {
          const color = commentHighlightColor;
          const from = pos;
          const to = pos + node.nodeSize;
          editor
            .chain()
            .setTextSelection({ from, to })
            .updateComment({ highlightColor: color })
            .run()
        }
      }
      return true;
    });
  }, [editor, commentHighlightColor]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      for (const mark of node?.marks ?? []) {
        if (mark.type.name === 'bookmark') {
          const highlightColor = bookmarkHighlightColor;
          const from = pos;
          const to = pos + node.nodeSize;
          editor
            .chain()
            .setTextSelection({ from, to })
            .updateBookmark({ highlightColor })
            .run()
        }
      }
    });
  }, [editor, bookmarkHighlightColor]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      node?.marks?.forEach((mark) => {
        if (mark.type.name === 'textNote') {
          const highlightColor = lemmaHighlightColor;
          const from = pos;
          const to = pos + node.nodeSize;
          editor
            .chain()
            .setTextSelection({ from, to })
            .updateTextNote({ highlightColor })
            .run()
        }
      });
    });
  }, [editor, lemmaHighlightColor]);

  useEffect(() => {
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'siglum') {
        editor.chain().setNodeSelection(pos).updateSiglaHighlightColor(siglaHighlightColor).run();
      }
      return true;
    });
  }, [editor, siglaHighlightColor]);

  useEffect(() => {
    const handleTextNoteCreated = ({ id, content }) => {
      if (!apparatusIdRef.current)
        return;
      onTextNoteCreated(id, content, apparatusIdRef.current);
    }

    editor.on('textNoteCreationSuccess', handleTextNoteCreated);

    return () => {
      editor.off('textNoteCreationSuccess', handleTextNoteCreated);
    }
  }, [editor, apparatusIdRef.current, onTextNoteCreated, onTextNoteWithIdsDeleted]);

  useEffect(() => {
    const navigateToHeading = (headingAttrs: TocParagraphAttributes) => {
      let index = headingAttrs.index;
      let section = headingAttrs.sectionType;
      if (section) {
        mainTextEditor.scrollToHeadingIndex(index, section);
      }
    };
    editor.on('clickTocParagraphAttributes', navigateToHeading);
    return () => {
      editor.off('clickTocParagraphAttributes', navigateToHeading);
    };
  }, [editor, mainTextEditor]);

  useEffect(() => {
    const suppressBubbleToolbar = () => {
      bubbleMenuRef.current?.hide();
      bubbleMenuRef.current?.activate(false);
      window.requestAnimationFrame(() => {
        bubbleMenuRef.current?.activate(true);
      });
    };

    editor.on('suppressBubbleToolbar', suppressBubbleToolbar);
    return () => {
      editor.off('suppressBubbleToolbar', suppressBubbleToolbar);
    };
  }, [editor]);

  useEffect(() => {
    onTextNotesChanged(mainTextEditor.textNotes);
  }, [mainTextEditor.textNotes]);

  useEffect(() => {
    onCurrentSection(mainTextEditor.currentSection)
  }, [editor, mainTextEditor.currentSection]);

  const selectApparatus = (apparatus: Apparatus, _index: number) => {
    addNote(apparatus.id)
  }

  const enabledApparatuses = useMemo(() => {
    const isTocSection = mainTextEditor.currentSection === 'toc';
    const isIntroductionSection = mainTextEditor.currentSection === 'introduction';
    const isBibliographySection = mainTextEditor.currentSection === 'bibliography';
    if (isTocSection) {
      return [];
    } else if (isIntroductionSection || isBibliographySection) {
      return apparatuses.filter((apparatus) => apparatus.type === 'PAGE_NOTES' || apparatus.type === 'SECTION_NOTES');
    } else {
      return apparatuses;
    }
  }, [apparatuses, mainTextEditor.currentSection]);

  const clickAddNote = useCallback(() => {
    if (enabledApparatuses?.length === 0) return;
    else if (enabledApparatuses?.length === 1) {
      addNote(enabledApparatuses[0].id)
      return;
    }
    bubbleMenuRef.current?.hide()
    apparatusListMenuRef.current?.show()
  }, [bubbleMenuRef, apparatusListMenuRef, enabledApparatuses]);

  const addNote = useCallback((apparatusId: string) => {
    apparatusIdRef.current = apparatusId;
    mainTextEditor.setNote(lemmaHighlightColor)
    bubbleMenuRef.current?.hide()
    apparatusListMenuRef.current?.hide()
  }, [apparatusListMenuRef, lemmaHighlightColor]);

  const addComment = useCallback(() => {
    bubbleMenuRef.current?.hide()
    commentCategoryListMenuRef.current?.hide();
    mainTextEditor.addComment(commentHighlightColor)
  }, [editor, mainTextEditor, commentCategoryListMenuRef.current, bubbleMenuRef.current, commentHighlightColor]);

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

  const addBookmark = useCallback(() => {
    bubbleMenuRef.current?.hide()
    bookmarkCategoryListMenuRef.current?.hide();
    mainTextEditor.addBookmark(bookmarkHighlightColor)
  }, [editor, mainTextEditor, bookmarkCategoryListMenuRef.current, bubbleMenuRef.current, bookmarkHighlightColor]);

  const selectBookmarkCategory = useCallback((bookmarkCategory: BookmarkCategory, _index: number) => {
    bookmarkCategoryIdRef.current = bookmarkCategory.id;
    addBookmark()
  }, [addBookmark, bookmarkCategoryIdRef.current]);

  const clickAddBookmark = useCallback(() => {
    if (bookmarkCategories?.length === 0) {
      addBookmark()
      return;
    }
    bubbleMenuRef.current?.hide()
    bookmarkCategoryListMenuRef.current?.show()
  }, [addBookmark, bubbleMenuRef, bookmarkCategoryListMenuRef, bookmarkCategories]);

  const clickAddReferenceToChat = useCallback(() => {
    bubbleMenuRef.current?.hide()
    const text = mainTextEditor.selectedText()
    onClickAddReferenceToChat(text)
  }, [editor, mainTextEditor, bubbleMenuRef, onClickAddReferenceToChat]);

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

  const bookmarkCategoriesOptions = useMemo(() => {
    const noCategory: BookmarkCategory = {
      id: undefined,
      name: "Uncategorised"
    }
    return (bookmarkCategories && bookmarkCategories?.length > 0) ? [
      noCategory,
      ...bookmarkCategories ?? []
    ] : []
  }, [bookmarkCategories]);

  const onContextMenuVisibilityChange = useCallback((visible: boolean) => {
    bubbleMenuRef.current?.activate(!visible)
    if (visible) {
      apparatusListMenuRef.current?.hide()
      commentCategoryListMenuRef.current?.hide()
      bookmarkCategoryListMenuRef.current?.hide()
    }
  }, [bubbleMenuRef, apparatusListMenuRef, commentCategoryListMenuRef, bookmarkCategoryListMenuRef]);

  useEffect(() => {

    const clickNoteWithIdHandler = (id: string) => {
      if (!notesVisible)
        return;
      onClickNoteWithId(id);
    };

    const bookmarkCreatedHandler = ({ id, selectedText }) => {
      onBookmarkCreated(id, selectedText, bookmarkCategoryIdRef.current);
      bookmarkCategoryIdRef.current = undefined;
      editor.commands.blur()
    };

    const clickBookmarkWithIdHandler = (id: string) => {
      if (!bookmarksVisible)
        return;
      onClickBookmarkWithId(id);
    };

    const commentCreatedHandler = ({ id, selectedText }) => {
      onCommentCreated(id, selectedText, commentCategoryIdRef.current);
      commentCategoryIdRef.current = undefined;
    };

    const clickCommentWithIdHandler = (id: string) => {
      if (!commentsVisible)
        return;
      onClickCommentWithId(id);
    };

    const customMarksDeletedHandler = (marks: { id: string, type: string, content: string }[]) => {

      const textNotesMarks = marks.filter(mark => mark.type === 'textNote');
      if (textNotesMarks.length > 0) {
        onTextNoteWithIdsDeleted(textNotesMarks.map(mark => mark.id));
      }

      const commentsMarks = marks.filter(mark => mark.type === 'comment');
      if (commentsMarks.length > 0)
        onCommentWithIdsDeleted?.(commentsMarks.map(mark => mark.id));

      const bookmarksMarks = marks.filter(mark => mark.type === 'bookmark');
      if (bookmarksMarks.length > 0)
        onBookmarksWithIdsDeleted?.(bookmarksMarks.map(mark => mark.id));
    }

    editor.on('clickNoteWithId', clickNoteWithIdHandler);
    editor.on('bookmarkCreated', bookmarkCreatedHandler);
    editor.on('clickBookmarkWithId', clickBookmarkWithIdHandler);
    editor.on('commentCreated', commentCreatedHandler);
    editor.on('clickCommentWithId', clickCommentWithIdHandler);
    editor.on('customMarksDeleted', customMarksDeletedHandler);

    return () => {
      editor.off('clickNoteWithId', clickNoteWithIdHandler);
      editor.off('bookmarkCreated', bookmarkCreatedHandler);
      editor.off('clickBookmarkWithId', clickBookmarkWithIdHandler);
      editor.off('commentCreated', commentCreatedHandler);
      editor.off('clickCommentWithId', clickCommentWithIdHandler);
      editor.off('customMarksDeleted', customMarksDeletedHandler);
    }
  }, [onClickNoteWithId, notesVisible, onCommentCreated, onClickCommentWithId, onCommentWithIdsDeleted, onBookmarkCreated, onClickBookmarkWithId, onBookmarksWithIdsDeleted, commentsVisible, bookmarksVisible, editor, commentCategoryIdRef.current, bookmarkCategoryIdRef.current]);

  useEffect(() => {
    onCommentsChanged(mainTextEditor.comments);
  }, [onCommentsChanged, mainTextEditor.comments]);

  useEffect(() => {
    onBookmarksChanged(mainTextEditor.bookmarks);
  }, [onBookmarksChanged, mainTextEditor.bookmarks]);

  useEffect(() => {
    const dom = editor.view.dom;
    if (notesVisible)
      dom.classList.remove('hide-note-highlights')
    else
      dom.classList.add('hide-note-highlights')
  }, [notesVisible, editor.view.dom]);

  useEffect(() => {
    const dom = editor.view.dom;
    if (commentsVisible)
      dom.classList.remove('hide-main-comment-highlights')
    else
      dom.classList.add('hide-main-comment-highlights')
  }, [commentsVisible, editor.view.dom]);

  useEffect(() => {
    const dom = editor.view.dom;
    if (bookmarksVisible)
      dom.classList.remove('hide-main-bookmark-highlights')
    else
      dom.classList.add('hide-main-bookmark-highlights')
  }, [bookmarksVisible, editor.view.dom]);

  const selectionHasHeading = useMemo(() => {
    return mainTextEditor.selectedNodesTypeNames.includes("heading")
  }, [mainTextEditor.selectedNodesTypeNames]);

  const disableNoteButton = useMemo(() => {
    return mainTextEditor.selectedNodesTypeNames.includes("sectionDivider") || mainTextEditor.selectedNodesTypeNames.includes("heading") || enabledApparatuses.length === 0;
  }, [mainTextEditor.selectedNodesTypeNames, enabledApparatuses]);

  const disableCommentButton = useMemo(() => {
    return mainTextEditor.selectedNodesTypeNames.includes("sectionDivider")
  }, [mainTextEditor.selectedNodesTypeNames]);

  const disableBookmarkButton = useMemo(() => {
    return mainTextEditor.selectedNodesTypeNames.includes("sectionDivider")
  }, [mainTextEditor.selectedNodesTypeNames]);

  const disableLinkButton = useMemo(() => {
    return mainTextEditor.selectedNodesTypeNames.includes("sectionDivider")
  }, [mainTextEditor.selectedNodesTypeNames]);

  const boldButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return editor.isActive("bold") ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const italicButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return editor.isActive("italic") ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const underlineButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return editor.isActive("underline") ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const textAlignmentLeftButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return getAlignment(editor) === "left" ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const textAlignmentCenterButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return getAlignment(editor) === "center" ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const textAlignmentRightButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return getAlignment(editor) === "right" ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])

  const textAlignmentJustifyButtonVariant = useMemo(() => {
    const selectedNodesTypeNames = new Set(mainTextEditor.selectedNodesTypeNames)
    if (selectedNodesTypeNames.has("heading"))
      return "toolbar"

    return getAlignment(editor) === "justify" ? "toolbar-selected" : "toolbar"
  }, [editor, mainTextEditor.selectedNodesTypeNames])


  return (
    <div className={cn("dark:!bg-grey-20 ", className)}>
      {mainTextEditor.currentSection !== "toc" && (
        <>
          <EditorBubbleMenu
            ref={bubbleMenuRef}
            editor={editor}>
            <div className="flex gap-2 bg-white dark:bg-grey-20 p-2 rounded border border-grey-70 dark:border-grey-30 shadow-lg">
              <AppButton
                variant={boldButtonVariant}
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={selectionHasHeading}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.bold")}>
                <IconBold />
              </AppButton>
              <AppButton
                variant={italicButtonVariant}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={selectionHasHeading}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.italic")}>
                <IconItalic />
              </AppButton>
              <AppButton
                variant={underlineButtonVariant}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={selectionHasHeading}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.underline")}>
                <IconUnderline />
              </AppButton>
              <AppButton
                variant={"toolbar"}
                onClick={clickAddNote}
                disabled={disableNoteButton}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.note")}>
                <IconHistoryEdu />
              </AppButton>
              <AppButton
                variant={"toolbar"}
                onClick={clickAddComment}
                disabled={disableCommentButton}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.comment")}>
                <IconCommentAdd />
              </AppButton>
              <AppButton
                variant={"toolbar"}
                onClick={clickAddBookmark}
                disabled={disableBookmarkButton}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.bookmark")}>
                <IconBookmark />
              </AppButton>
              <AppButton
                variant={"toolbar"}
                onClick={onClickAddLink}
                disabled={disableLinkButton}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.bubble_menu.link")}>
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
            ref={apparatusListMenuRef}
            editor={editor}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md w-64 flex flex-col"
          >
            <EditorOptionMenuHeader>
              {t("main_editor.apparatus_option.title")}
            </EditorOptionMenuHeader>
            <AppNavigatableList
              items={enabledApparatuses}
              onSelect={selectApparatus}
              onEscape={() => apparatusListMenuRef.current?.hide()}
              renderItem={(apparatus) => (
                <div className="p-2 text-xs">
                  {apparatus.title} ({apparatus.type})
                </div>
              )}
              className="max-h-64 overflow-auto"
              selectedItemClassName="bg-grey-40 text-white"
            />
            <EditorOptionMenuFooter>
              <span>
                {enabledApparatuses?.length}{" "}
                {t("main_editor.apparatus_option.items")}
              </span>
              <span className="text-grey-50 dark:text-grey-80">
                {t("main_editor.apparatus_option.escape_to_close")}
              </span>
            </EditorOptionMenuFooter>
          </EditorOptionMenu>

          <EditorOptionMenu
            ref={commentCategoryListMenuRef}
            editor={editor}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md w-64 flex flex-col"
          >
            <EditorOptionMenuHeader>
              {t("main_editor.comment_category.title")}
            </EditorOptionMenuHeader>
            {commentCategoriesOptions && (
              <AppNavigatableList
                items={commentCategoriesOptions}
                onSelect={selectCommentCategory}
                onEscape={() => commentCategoryListMenuRef.current?.hide()}
                renderItem={(commentCategory) => (
                  <div className="p-2 text-xs">{commentCategory.name}</div>
                )}
                className="max-h-64 overflow-auto"
                selectedItemClassName="bg-grey-40 text-white"
              />
            )}
            <EditorOptionMenuFooter>
              <span>
                {commentCategories?.length}{" "}
                {t("main_editor.comment_category.items")}
              </span>
              <span className="text-grey-50 dark:text-grey-80">
                {t("main_editor.comment_category.escape_to_close")}
              </span>
            </EditorOptionMenuFooter>
          </EditorOptionMenu>

          <EditorOptionMenu
            ref={bookmarkCategoryListMenuRef}
            editor={editor}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md w-64 flex flex-col"
          >
            <EditorOptionMenuHeader>
              {t("main_editor.bookmark_category.title")}
            </EditorOptionMenuHeader>
            {bookmarkCategoriesOptions && (
              <AppNavigatableList
                items={bookmarkCategoriesOptions}
                onSelect={selectBookmarkCategory}
                onEscape={() => bookmarkCategoryListMenuRef.current?.hide()}
                renderItem={(bookmarkCategory) => (
                  <div className="p-2 text-xs">{bookmarkCategory.name}</div>
                )}
                className="max-h-64 overflow-auto"
                selectedItemClassName="bg-grey-40 text-white"
              />
            )}
            <EditorOptionMenuFooter>
              <span>
                {bookmarkCategories?.length}{" "}
                {t("main_editor.bookmark_category.items")}
              </span>
              <span className="text-grey-50 dark:text-grey-80">
                {t("main_editor.bookmark_category.escape_to_close")}
              </span>
            </EditorOptionMenuFooter>
          </EditorOptionMenu>

          <EditorContextMenu
            ref={contextMenuRef}
            editor={editor}
            onVisibilityChange={onContextMenuVisibilityChange}
            className="bg-white dark:bg-grey-20 border border-grey-70 dark:border-grey-30 shadow-lg rounded-md">
            <EditorContextMenuToolbar>
              <AppButton
                variant={boldButtonVariant}
                disabled={selectionHasHeading}
                onClick={() => editor.chain().focus().toggleBold().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.context_menu.formatting.bold")}>
                <IconBold />
              </AppButton>
              <AppButton
                variant={italicButtonVariant}
                disabled={selectionHasHeading}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.context_menu.formatting.italic")}>
                <IconItalic />
              </AppButton>
              <AppButton
                variant={underlineButtonVariant}
                disabled={selectionHasHeading}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                type="button"
                size="icon-xs"
                shadow="none"
                aria-label={t("main_editor.context_menu.formatting.underline")}>
                <IconUnderline />
              </AppButton>
            </EditorContextMenuToolbar>
            <EditorContextMenuToolbar>
              <AppButton
                disabled={selectionHasHeading}
                variant={textAlignmentLeftButtonVariant}
                size="icon-xs"
                rounded="sm"
                onClick={() => mainTextEditor.setTextAlignment("left")}
                aria-label={t("main_editor.context_menu.alignment.left")}>
                <IconAlignLeft />
              </AppButton>
              <AppButton
                disabled={selectionHasHeading}
                variant={textAlignmentCenterButtonVariant}
                size="icon-xs"
                rounded="sm"
                onClick={() => mainTextEditor.setTextAlignment("center")}
                aria-label={t("main_editor.context_menu.alignment.center")}>
                <IconAlignCenter />
              </AppButton>
              <AppButton
                disabled={selectionHasHeading}
                variant={textAlignmentRightButtonVariant}
                size="icon-xs"
                rounded="sm"
                onClick={() => mainTextEditor.setTextAlignment("right")}
                aria-label={t("main_editor.context_menu.alignment.right")}>
                <IconAlignRight />
              </AppButton>
              <AppButton
                disabled={selectionHasHeading}
                variant={textAlignmentJustifyButtonVariant}
                size="icon-xs"
                rounded="sm"
                onClick={() => mainTextEditor.setTextAlignment("justify")}
                aria-label={t("main_editor.context_menu.alignment.justify")}>
                <IconAlignJustify />
              </AppButton>
            </EditorContextMenuToolbar>
            <EditorContextMenuList>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty || mainTextEditor.currentNodeTypeName === "heading"}
                onClick={() => {
                  onClickAddSiglum();
                  contextMenuRef.current?.hide();
                }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <IconSiglum className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.siglum")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "addSiglum"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={!editor.state.selection.empty || mainTextEditor.currentNodeTypeName === "heading"}
                onClick={() => {
                  onClickAddCitation();
                  contextMenuRef.current?.hide();
                }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <IconCitation className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.citation")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "addCitation"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty || disableNoteButton || enabledApparatuses.length === 0}
                aria-label={t("main_editor.context_menu.actions.note")}
                onClick={() => {
                  clickAddNote();
                  contextMenuRef.current?.hide();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconHistoryEdu className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.note")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertNote"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty || disableCommentButton}
                aria-label={t("main_editor.context_menu.actions.comment")}
                onClick={() => {
                  clickAddComment();
                  contextMenuRef.current?.hide();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconCommentAdd className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.comment")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertComment"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty || disableBookmarkButton}
                aria-label={t("main_editor.context_menu.actions.bookmark")}
                onClick={() => {
                  clickAddBookmark();
                  contextMenuRef.current?.hide();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconBookmark className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.bookmark")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "insertBookmark"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty || disableLinkButton}
                aria-label={t("main_editor.context_menu.actions.link")}
                onClick={() => {
                  onClickAddLink();
                  contextMenuRef.current?.hide();
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <IconLinkAdd className="w-4 h-4" />
                  <span>{t("main_editor.context_menu.actions.link")}</span>
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
                  contextMenuRef.current?.hide();
                  clipboard.cut(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t("main_editor.context_menu.actions.cut")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "cut"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                disabled={editor.state.selection.empty}
                onClick={() => {
                  contextMenuRef.current?.hide();
                  clipboard.copy(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t("main_editor.context_menu.actions.copy")}</span>
                </div>
                <span className="text-xs text-grey-50 dark:text-grey-80 font-mono">
                  {shortcutLabel(getShortcutForMenuItem(keyboardShortcuts, "copy"))}
                </span>
              </EditorContextMenuItemButton>
              <EditorContextMenuItemButton
                onClick={() => {
                  contextMenuRef.current?.hide();
                  clipboard.paste(editor);
                }}>
                <div className="flex items-center gap-2 flex-1">
                  <span>{t("main_editor.context_menu.actions.paste")}</span>
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
        style={zoomStyle}
        className="dark:!bg-grey-20 px-1"
        editor={editor}
        spellCheck={false}
      />
    </div>
  );
});

export default memo(MainTextEditor);
