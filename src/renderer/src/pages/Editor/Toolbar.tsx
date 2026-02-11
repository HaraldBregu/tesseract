import { ForwardedRef, forwardRef, MouseEvent, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HighlightColor from "../../components/highlight-color";
import FormatTextColor from "../../components/format-text-color";
import { fontSizes } from "../../utils/optionsEnums";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWindowSize } from "@/hooks/use-window";
import useHasInProgressAnimation from "@/hooks/use-has-in-progress-animation";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSeparator from "@/components/app/app-separator";
import { useSelector } from "react-redux";
import { useEditor } from "./hooks/use-editor";
import { ToolbarButtonSiglum } from "./components/toolbar-button-siglum";
import { ToolbarButtonCitation } from "./components/toolbar-button-citation";
import { ToolbarButtonSidebar } from "./components/toolbar-button-sidebar";
import { ToolbarButtonSuperscript } from "./components/toolbar-button-superscript";
import { selectSelectedNodeType, selectToolbarEnabled, selectVisibleApparatuses } from "./store/editor/editor.selector";
import { ToolbarButtonSubscript } from "./components/toolbar-button-subscript";
import { ToolbarButtonBold } from "./components/toolbar-button-bold";
import { ToolbarButtonItalic } from "./components/toolbar-button-italic";
import { ToolbarButtonUnderline } from "./components/toolbar-button-underline";
import { ToolbarButtonNPC } from "./components/toolbar-button-npc";
import { ToolbarButtonReadingType } from "./components/toolbar-button-reading-type";
import { ToolbarButtonReadingSeparator } from "./components/toolbar-button-reading-separator";
import { ToolbarButtonSymbol } from "./components/toolbar-button-symbol";
import { ToolbarButtonLink } from "./components/toolbar-button-link";
import { ToolbarButtonAlignment } from "./components/toolbar-button-alignment";
import { ToolbarButtonSpacing } from "./components/toolbar-button-spacing";
import { ToolbarButtonList } from "./components/toolbar-button-list";
import { ToolbarButtonIncreaseIndent } from "./components/toolbar-button-increase-indent";
import { ToolbarButtonDecreaseIndent } from "./components/toolbar-button-decrease-indent";
import { ToolbarButtonSearch } from "./components/toolbar-button-search";

import { ToolbarButtonPrint } from "./components/toolbar-button-print";
import { ToolbarButtonHistoryEdu } from "./components/toolbar-button-history-edu";
import { ToolbarButtonComment } from "./components/toolbar-button-comment";
import { commentCategoriesSelector } from "./store/comment/comments.selector";
import { ToolbarButtonBookmark } from "./components/toolbar-button-bookmark";
import { bookmarkCategoriesSelector } from "./store/bookmark/bookmark.selector";
import { closeAllSelects, setCitationInsertDialogVisible, setFontFamilySelectOpen, setFontSizeSelectOpen, setStyleSelectOpen, togglePrintPreviewVisible, toggleShowNonPrintingCharacters } from "./provider";
import { ToolbarButtonRedo } from "./components/toolbar-button-redo";
import ToolbarHeadingSelect from "./components/toolbar-heading-select";
import { ToolbarButtonUndo } from "./components/toolbar-button-undo";
import { ToolbarFontFamilySelect } from "./components/toolbar-font-family-select";
import { ToolbarFontSizeSelect } from "./components/toolbar-font-size-select";
import { HEADING_CUSTOM_TYPES } from "@/utils/constants";
import { setToolbarStateBold, setToolbarStateItalic, setToolbarStateSubscript, setToolbarStateSuperscript, setToolbarStateUnderline } from "./provider/actions/toolbar";
import { ToolbarButtonChat } from "./components/toolbar-button-chat";
import { openChat } from "./provider/actions/chat";

export interface ToolbarElement {
  setCurrentEditor: (editorType: EditorType) => void;
  setCurrentSection: (section: string) => void;
}
interface ToolbarProps {
  includeOptionals?: string[];
  headingEnabled?: boolean;
  readingTypeAdd: ReadingTypeAdd;
  readingTypeOm: ReadingTypeOm;
  readingTypeTr: ReadingTypeTr;
  readingTypeDel: ReadingTypeDel;
  onAddReadingSeparator: () => void;
  // onEmphasisStateChange: (emphasisState: Partial<EmphasisState>) => void;
  onHeadingChange: (style: Style) => void;
  onSetBody: (style?: Style) => void;
  onCustomStyleChange: (style: Style) => void;
  onFontFamilyChange: (fontFamily: string) => void;
  onFontSizeChange: (fontSize: string) => void;
  onSetSuperscript: (superscript: boolean) => void;
  onSetSubscript: (subscript: boolean) => void;
  onBoldChange: (bold: boolean) => void;
  onItalicChange: (italic: boolean) => void;
  onUnderlineChange: (underline: boolean) => void;
  onTextColorChange: (textColor: string) => void;
  onHighlightColorChange: (highlightColor: string) => void;
  onSetTextAlignment: (alignment: Alignment) => void;
  onSetLineSpacing: (spacing: Spacing) => void;
  onSetListStyle: (style: ListStyle) => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddBookmark: (categoryId?: string) => void;
  onAddComment: (categoryId?: string) => void;
  onSetTextNoteToApparatusId?: (apparatusId: string) => void;
  onIncreaseIndent: () => void;
  onDecreaseIndent: () => void;
  onShowCustomSpacing: () => void;
  onShowResumeNumbering: () => void;
  continuePreviousNumbering: () => void;
  showCustomizeToolbar: () => void;
  showAddSymbol: () => void;
  showLinkConfig: () => void;
  removeLink: () => void;
  onSelectSiglum: (siglum: Siglum) => void;
  onShowSiglumSetup: () => void;
  onAddReadingTypeAdd: (readingType: ReadingTypeAdd) => void;
  onAddReadingTypeOm: (readingType: ReadingTypeOm) => void;
  onAddReadingTypeTr: (readingType: ReadingTypeTr) => void;
  onAddReadingTypeDel: (readingType: ReadingTypeDel) => void;
  onSearchClick: () => void;
}

export default forwardRef<ToolbarElement, ToolbarProps>(({
  readingTypeAdd,
  readingTypeOm,
  readingTypeTr,
  readingTypeDel,
  onAddReadingSeparator,
  onHeadingChange,
  onSetBody,
  onCustomStyleChange,
  onFontFamilyChange,
  onFontSizeChange,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onTextColorChange,
  onHighlightColorChange,
  onSetTextAlignment,
  onSetLineSpacing,
  onSetListStyle,
  onSetSuperscript,
  onSetSubscript,
  includeOptionals = [],
  onUndo,
  onRedo,
  onAddBookmark,
  onAddComment,
  onSetTextNoteToApparatusId,
  onIncreaseIndent,
  onDecreaseIndent,
  onShowCustomSpacing,
  onShowResumeNumbering,
  continuePreviousNumbering,
  headingEnabled = true,
  showCustomizeToolbar,
  showAddSymbol,
  showLinkConfig,
  removeLink,
  onSelectSiglum,
  onShowSiglumSetup,
  onAddReadingTypeAdd,
  onAddReadingTypeOm,
  onAddReadingTypeTr,
  onAddReadingTypeDel,
  onSearchClick
}, ref: ForwardedRef<ToolbarElement>) => {
  const [currentEditor, setCurrentEditor] = useState<EditorType>("TEXT")
  const [currentSection, setCurrentSection] = useState<string>("");

  useImperativeHandle(ref, () => {
    return {
      setCurrentEditor,
      setCurrentSection,
    }
  }, [])

  const { t } = useTranslation();
  const includeOptionalsMemo = useMemo(() => includeOptionals, [includeOptionals]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number
    left?: number
    right?: number
  }>({ top: 0, left: 0 });

  const [state, dispatchEditor] = useEditor();

  const notesEnabled = useMemo(() => state.notesEnabled, [state.notesEnabled]);
  const bookmarkEnabled = useMemo(() => state.bookmarkEnabled, [state.bookmarkEnabled]);
  const siglumEnabled = useMemo(() => state.siglumEnabled, [state.siglumEnabled]);
  const toolbarState = useMemo(() => state.toolbarState, [state.toolbarState]);
  const siglumList = useMemo(() => state.siglumList, [state.siglumList]);
  const isNPC = useMemo(() => state.showNonPrintingCharacters, [state.showNonPrintingCharacters]);
  const currentAlignment = useMemo(() => state.toolbarState.alignment, [state.toolbarState.alignment]);
  const currentListValue = useMemo(() => state.toolbarState.listStyle, [state.toolbarState.listStyle]);

  const toolbarEnabled = useSelector(selectToolbarEnabled);
  const apparatuses = useSelector(selectVisibleApparatuses);
  const apparatusesMemo = useMemo(() => {
    const isTocSection = currentSection === 'toc';
    const isIntroductionSection = currentSection === 'introduction';
    const isBibliographySection = currentSection === 'bibliography';
    if (isTocSection) {
      return [];
    } else if (isIntroductionSection || isBibliographySection) {
      return apparatuses.filter((apparatus) => apparatus.type === 'PAGE_NOTES' || apparatus.type === 'SECTION_NOTES');
    } else {
      return apparatuses;
    }
  }, [apparatuses, currentSection]);
  const selectedNodeType = useSelector(selectSelectedNodeType);

  const styleOptions = useMemo(() => {
    const headingMap: Record<string, number> = {
      H1: 1,
      H2: 2,
      H3: 3,
      H4: 4,
      H5: 5,
      H6: 6,
      P: 0,
    };

    const newStyles = state.styles.filter(style => HEADING_CUSTOM_TYPES.includes(style?.type))
    const styleOptionsMap: ItemOption[] = newStyles.map((style) => ({
      label: style.name,
      value: (headingMap[style.type] ?? style.id).toString(),
    } satisfies ItemOption));

    return styleOptionsMap;
  }, [state.styles]);

  const headingLevel = useMemo(() =>
    state.toolbarState.headingLevel?.toString() || state.toolbarState.styleId?.toString(),
    [state.toolbarState.headingLevel, state.toolbarState.styleId]);

  const commentEnabled = useMemo(() => state.commentEnabled, [state.commentEnabled]);
  const canInsertCitation = useMemo(() => state.canInsertCitation, [state.canInsertCitation]);
  const canInsertSymbol = useMemo(() => state.canInsertSymbol, [state.canInsertSymbol]);
  const link = useMemo(() => state.toolbarState.link ?? '', [state.toolbarState.link]);
  const linkEnabled = useMemo(() => state.linkEnabled, [state.linkEnabled]);

  const currentSpacing = useMemo(() => {
    return state.toolbarState.spacing;
  }, [state.toolbarState.spacing]);

  const spacingList = useMemo(() => ([
    { label: t('menu.format.text.spacing.single'), value: '1', onClick: () => handleLineSpacing(1) },
    { label: t('menu.format.text.spacing.1_15'), value: '1.15', onClick: () => handleLineSpacing(1.15) },
    { label: t('menu.format.text.spacing.oneAndHalf'), value: '1.5', onClick: () => handleLineSpacing(1.5) },
    { label: t('menu.format.text.spacing.double'), value: '2', onClick: () => handleLineSpacing(2) },
  ]), []);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const editorRect = event.currentTarget.getBoundingClientRect()
    const isNearRightEdge = (editorRect.left - event.clientX) / 2
    const top = event.clientY;

    if (isNearRightEdge) {
      const right = editorRect.right - event.clientX - 10; // 10px padding from the right edge
      setPopoverPosition({ top, right, left: undefined })
    } else {
      const left = event.clientX - editorRect.left;
      setPopoverPosition({ top, left, right: undefined })
    }
    setShowContextMenu(true);
  }

  const toolbarContainer = useRef<HTMLDivElement>(null);

  const [alignmentWidth, setAlignmentWidth] = useState<number>(0);
  const [undoRedoWidth, setUndoRedoWidth] = useState<number>(0);
  const [sectionWidth, setSectionWidth] = useState<number>(0);
  const [fontFamilyWidth, setFontFamilyWidth] = useState<number>(0);
  const [fontSizeWidth, setFontSizeWidth] = useState<number>(0);
  const [fontStylingWidth, setFontStylingWidth] = useState<number>(0);
  const [spacingWidth, setSpacingWidth] = useState<number>(0);
  const [linkingWidth, setLinkingWidth] = useState<number>(0);
  const [findPreviewWidth, setFindPreviewWidth] = useState<number>(0);
  const [sidebarButtonWidth, setSidebarButtonWidth] = useState<number>(0);

  const alignmentGroupRef = useRef<HTMLDivElement>(null);
  const linkingGroupRef = useRef<HTMLDivElement>(null);
  const spacingGroupRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLDivElement>(null);
  const undoRedoGroupRef = useRef<HTMLDivElement>(null);
  const sectionGroupRef = useRef<HTMLDivElement>(null);
  const fontFamilyGroupRef = useRef<HTMLDivElement>(null);
  const fontSizeGroupRef = useRef<HTMLDivElement>(null);
  const fontStylingGroupRef = useRef<HTMLDivElement>(null);
  const findPreviewGroupRef = useRef<HTMLDivElement>(null);

  const { width: windowWidth } = useWindowSize();
  const hasInProgressAnimation = useHasInProgressAnimation();

  const [systemFonts, setSystemFonts] = useState<string[]>([]);

  const sidebar = useSidebar();

  const fontFamilySelectOpen = state.fontFamilySelectOpen;
  const fontSizeSelectOpen = state.fontSizeSelectOpen;
  const fontStyleSelectOpen = state.styleSelectOpen;

  // HANDLE IPC EVENTS
  useIpcRenderer((ipc) => {
    ipc.send('request-system-fonts');

    ipc.on('receive-system-fonts', (_: any, fonts: string[]) => {
      setSystemFonts(fonts)
    });

    return () => {
      ipc.off('receive-system-fonts');
    }

  }, [window.electron.ipcRenderer]);

  const handleToggleShowNonPrintingCharacters = useCallback(() => {
    dispatchEditor(toggleShowNonPrintingCharacters());
  }, [dispatchEditor]);

  const hideGroups = useCallback(() => {
    if (!toolbarContainer.current) return;

    let availableWidth = toolbarContainer.current.offsetWidth
      - undoRedoWidth
      - sectionWidth
      - spacingWidth
      - linkingWidth
      - sidebarButtonWidth;
    const groupWidths = [
      { width: fontStylingWidth, ref: fontStylingGroupRef },
      { width: fontSizeWidth, ref: fontSizeGroupRef },
      { width: fontFamilyWidth, ref: fontFamilyGroupRef },
      { width: findPreviewWidth, ref: findPreviewGroupRef },
      { width: alignmentWidth, ref: alignmentGroupRef },
    ];

    let hideFrom: number | null = null;
    for (const groupKey in groupWidths) {
      const { ref, width: groupWidth } = groupWidths[groupKey];

      if (availableWidth - groupWidth > 0) {
        availableWidth -= groupWidth;
        ref.current?.classList.remove("hidden");
      } else if (availableWidth - groupWidth <= 0) {
        hideFrom = parseInt(groupKey);
        break;
      }
    }
    if (hideFrom !== null) {
      for (let i = hideFrom; i < groupWidths.length; i++) {
        const { ref } = groupWidths[i];
        ref.current?.classList.add("hidden");
      }
    }
  }, [alignmentWidth, findPreviewWidth, fontFamilyWidth, fontSizeWidth,
    fontStylingWidth, linkingWidth, sectionWidth, sidebarButtonWidth, spacingWidth, undoRedoWidth]);

  useEffect(() => {
    if (state.toolbarVisible) {
      setTimeout(() => {
        hideGroups();
      }, 300);
    }
  }, [sidebar.open, windowWidth, hasInProgressAnimation, state.toolbarVisible, alignmentWidth, undoRedoWidth,
    sectionWidth, fontFamilyWidth, fontSizeWidth, fontStylingWidth, spacingWidth, linkingWidth,
    findPreviewWidth, sidebarButtonWidth, hideGroups]);

  useEffect(() => {
    setAlignmentWidth((alignmentWidth) => {
      if (alignmentGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(alignmentGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return alignmentGroupRef.current?.offsetWidth + gapWidth;
      }
      return alignmentWidth;
    });
    setUndoRedoWidth((undoRedoWidth) => {
      if (undoRedoGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(undoRedoGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return undoRedoGroupRef.current?.offsetWidth + gapWidth;
      }
      return undoRedoWidth;
    });
    setSectionWidth((sectionWidth) => {
      if (sectionGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(sectionGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return sectionGroupRef.current?.offsetWidth + gapWidth;
      }
      return sectionWidth;
    });
    setFontFamilyWidth((fontFamilyWidth) => {
      if (fontFamilyGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(fontFamilyGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return fontFamilyGroupRef.current?.offsetWidth + gapWidth;
      }
      return fontFamilyWidth;
    });
    setFontSizeWidth((fontSizeWidth) => {
      if (fontSizeGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(fontSizeGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return fontSizeGroupRef.current?.offsetWidth + gapWidth;
      }
      return fontSizeWidth;
    });
    setFontStylingWidth((fontStylingWidth) => {
      if (fontStylingGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(fontStylingGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return fontStylingGroupRef.current?.offsetWidth + gapWidth;
      }
      return fontStylingWidth;
    });
    setSpacingWidth((spacingWidth) => {
      if (spacingGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(spacingGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return spacingGroupRef.current?.offsetWidth + gapWidth;
      }
      return spacingWidth;
    });
    setLinkingWidth((linkingWidth) => {
      if (linkingGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(linkingGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return linkingGroupRef.current?.offsetWidth + gapWidth;
      }
      return linkingWidth;
    });
    setFindPreviewWidth((findPreviewWidth) => {
      if (findPreviewGroupRef.current?.offsetWidth) {
        const style = getComputedStyle(findPreviewGroupRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return findPreviewGroupRef.current?.offsetWidth + gapWidth;
      }
      return findPreviewWidth;
    });
    setSidebarButtonWidth((sidebarButtonWidth) => {
      if (sidebarButtonRef.current?.offsetWidth) {
        const style = getComputedStyle(sidebarButtonRef.current);
        const gapWidth = parseInt(style.marginLeft || '0') + parseInt(style.marginRight || '0');
        return sidebarButtonRef.current?.offsetWidth + gapWidth;
      }
      return sidebarButtonWidth;
    });
    setTimeout(() => {
      hideGroups();
    }, 500);
  }, [toolbarContainer, includeOptionalsMemo, hideGroups]);

  const handleHeadingLevelChange = useCallback((value: string) => {
    const numericValue = Number.parseInt(value);
    const isNumeric = !Number.isNaN(numericValue) && value === numericValue.toString();

    if (isNumeric && numericValue > 0) {
      const style = state.styles.filter(style => HEADING_CUSTOM_TYPES.includes(style?.type)).find((style) => style?.level?.toString() === value);

      if (style) {
        onHeadingChange(style);
      }

    } else if (isNumeric && numericValue === 0) {
      const style = state.styles.filter(style => HEADING_CUSTOM_TYPES.includes(style?.type)).find((style) => style?.type?.toString() === "P");

      if (style) {
        onSetBody(style);
      }

    } else {
      const style = state.styles.filter(style => HEADING_CUSTOM_TYPES.includes(style?.type)).find((style) => style.id.toString() === value);

      if (style) {
        onCustomStyleChange(style)
      }
    }
  }, [state.styles, onSetBody, onCustomStyleChange]);

  const isSuperscript = useMemo(() => state.toolbarState.superscript, [state.toolbarState.superscript])
  const isSubscript = useMemo(() => state.toolbarState.subscript, [state.toolbarState.subscript])
  const isBold = useMemo(() => state.toolbarState.bold, [state.toolbarState.bold])
  const isItalic = useMemo(() => state.toolbarState.italic, [state.toolbarState.italic])
  const isUnderline = useMemo(() => state.toolbarState.underline, [state.toolbarState.underline])

  const handleToggleSuperscript = useCallback(() => {
    onSetSuperscript(!isSuperscript)
    dispatchEditor(setToolbarStateSuperscript(!isSuperscript))
  }, [isSuperscript]);

  const handleToggleSubscript = useCallback(() => {
    onSetSubscript(!isSubscript)
    dispatchEditor(setToolbarStateSubscript(!isSubscript))
  }, [isSubscript]);

  const handleToggleBold = useCallback(() => {
    onBoldChange(!isBold)
    dispatchEditor(setToolbarStateBold(!isBold))
  }, [isBold]);

  const handleToggleItalic = useCallback(() => {
    onItalicChange(!isItalic)
    dispatchEditor(setToolbarStateItalic(!isItalic))
  }, [isItalic]);

  const handleToggleUnderline = useCallback(() => {
    onUnderlineChange(!isUnderline)
    dispatchEditor(setToolbarStateUnderline(!isUnderline))
  }, [isUnderline]);

  const handleTextColor = useCallback((color) => {
    onTextColorChange(color)
  }, [onTextColorChange]);

  const handleHighlightColor = useCallback((color) => {
    onHighlightColorChange(color)
  }, [onHighlightColorChange]);

  const handleClickCitation = useCallback(() => {
    dispatchEditor(setCitationInsertDialogVisible(true));
  }, [dispatchEditor]);

  const handlePrint = useCallback(() => {
    dispatchEditor(togglePrintPreviewVisible())
    dispatchEditor(closeAllSelects());
  }, []);

  const handleAlignmentChange = useCallback((textAlignment: Alignment) => {
    onSetTextAlignment(textAlignment)
  }, [onSetTextAlignment]);

  const handleLineSpacing = useCallback((line: number) => {
    onSetLineSpacing({
      line,
      before: 0,
      after: 0
    })
  }, [onSetLineSpacing]);

  const handleListChange = useCallback((style: BulletStyles) => {
    onSetListStyle(style)
  }, [onSetListStyle]);

  const toggleSidebar = useCallback(() => {
    sidebar.toggleSidebar();
  }, [sidebar]);

  const fontFamily = useMemo(() => state.toolbarState.fontFamily, [state.toolbarState.fontFamily]);

  const fontFamilies = useMemo((() => systemFonts.map(font => ({
    value: font,
    label: <span style={{ fontFamily: font }}>{font}</span>,
    style: { fontFamily: font }
  }))), [systemFonts]);

  const handleFontFamilyChange = useCallback((value: string) => {
    onFontFamilyChange(value);
  }, [onFontFamilyChange]);

  const handleFontFamilyOpenChange = useCallback((open: boolean) => {
    dispatchEditor(setFontFamilySelectOpen(open));
  }, [dispatchEditor]);

  const handleFontStyleOpenChange = useCallback((open: boolean) => {
    dispatchEditor(setStyleSelectOpen(open));
  }, [dispatchEditor]);

  const handleFontSizeOpenChange = useCallback((open: boolean) => {
    dispatchEditor(setFontSizeSelectOpen(open));
  }, [dispatchEditor]);

  const fontSize = useMemo(() => state.toolbarState.fontSize?.replace('pt', '') ?? '', [state.toolbarState.fontSize]);

  const handleFontSizeChange = useCallback((value) => {
    onFontSizeChange(`${value}pt`)
  }, [onFontSizeChange]);

  const bookmarkCategories = useSelector(bookmarkCategoriesSelector)

  const handleSetBookmark = useCallback(() => {
    handleSelectBookmarkCategory()
  }, []);

  const handleSelectBookmarkCategory = useCallback((category?: BookmarkCategory) => {
    onAddBookmark?.(category?.id)
  }, [onAddBookmark]);

  const bookmarkCategoriesMemo = useMemo(() => {
    const noCategory: BookmarkCategory = {
      id: undefined,
      name: "Uncategorised"
    }
    return (bookmarkCategories && bookmarkCategories?.length > 0) ? [
      noCategory,
      ...bookmarkCategories ?? []
    ] : []
  }, [bookmarkCategories]);

  const commentCategories = useSelector(commentCategoriesSelector)

  const addComment = useCallback(() => {
    onAddComment()
  }, [onAddComment]);

  const addCommentWithCategory = useCallback((category?: CommentCategory) => {
    onAddComment(category?.id)
  }, [onAddComment]);

  const commentCategoriesMemo = useMemo(() => {
    const noCategory: CommentCategory = {
      id: undefined,
      name: "Uncategorised"
    }
    return (commentCategories && commentCategories?.length > 0) ? [
      noCategory,
      ...commentCategories ?? []
    ] : []
  }, [commentCategories]);

  const isApparatus = useMemo(() => currentEditor === "APPARATUS", [currentEditor])
  const isText = useMemo(() => currentEditor === "TEXT", [currentEditor])
  const isHeadingOrMixedSelection = useMemo(() => !isApparatus && (selectedNodeType === "heading" || selectedNodeType === "mixed"), [isApparatus, selectedNodeType]);

  const handleSetTextNoteToApparatus = useCallback((apparatus: Apparatus) => {
    onSetTextNoteToApparatusId?.(apparatus.id)
  }, [onSetTextNoteToApparatusId])

  return (
    <TooltipProvider>
      <header className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b-2 border-grey-80 dark:border-grey-50 bg-background dark:bg-grey-20 overflow-hidden max-w-full",
        state.toolbarVisible ? '' : 'hidden'
      )}>
        <div className="flex items-center gap-2 px-1 flex-1 overflow-hidden max-w-full">
          <div ref={toolbarContainer} onContextMenu={handleContextMenu} className={cn("z-50 relative w-full max-w-full flex justify-between space-x-2 overflow-hidden")}>
            <div
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
              {/* POPOVER FOR EDIT */}
              <Popover open={showContextMenu} onOpenChange={setShowContextMenu}>
                <PopoverTrigger asChild>
                  <div className="w-1 h-1" />
                </PopoverTrigger>
                <PopoverContent className="w-auto px-2 py-1" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-2">
                    <Button
                      intent="secondary"
                      variant="icon"
                      size="small"
                      aria-label={t('toolbar.contextMenu')}
                      className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onClick={() => {
                        setShowContextMenu(false)
                        showCustomizeToolbar();
                      }}
                    >
                      {t('toolbar.contextMenu')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2 flex-nowrap">

              {/* SIDEBAR TOGGLE */}
              <ToolbarButtonSidebar
                title={t('toolbar.sidebar.toggle')}
                onClick={toggleSidebar}
                ref={sidebarButtonRef}
                tabIndex={1}
              />

              {/* UNDO & REDO */}
              <div
                ref={undoRedoGroupRef}
                className={`flex items-center space-x-2 transition-transform duration-300 h-full`}
              >
                <AppSeparator orientation="vertical" className="max-h-[70%]" />
                <ToolbarButtonUndo
                  title={t('toolbar.undo')}
                  onClick={onUndo}
                  tabIndex={2}
                  disabled={!toolbarEnabled}
                />
                <ToolbarButtonRedo
                  title={t('toolbar.redo')}
                  onClick={onRedo}
                  tabIndex={3}
                  disabled={!toolbarEnabled}
                />
              </div>

              {/* HEADING SELECT */}
              <ToolbarHeadingSelect
                ref={sectionGroupRef}
                value={headingLevel}
                sectionTypes={styleOptions}
                disabled={!toolbarEnabled || !headingEnabled || isApparatus}
                onValueChange={handleHeadingLevelChange}
                open={fontStyleSelectOpen}
                onOpenChange={handleFontStyleOpenChange}
              />

              {/* FONT FAMILY SELECT */}
              <ToolbarFontFamilySelect
                disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                value={fontFamily ?? 'Times New Roman'}
                onValueChange={handleFontFamilyChange}
                fontFamilies={fontFamilies}
                onOpenChange={handleFontFamilyOpenChange}
                open={fontFamilySelectOpen}
                tooltipLabel={t('toolbar.fontFamily')}
              />

              {/* FONT SIZE SELECT */}
              <ToolbarFontSizeSelect
                disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                value={fontSize}
                onValueChange={handleFontSizeChange}
                fontSizes={fontSizes}
                onOpenChange={handleFontSizeOpenChange}
                open={fontSizeSelectOpen}
                tooltipLabel={t('toolbar.fontSize')}
                ref={fontSizeGroupRef}
              />

              <div
                ref={fontStylingGroupRef}
                className={`flex items-center space-x-2 transition-transform duration-300 h-full`}>
                <AppSeparator orientation="vertical" className="max-h-[70%]" />

                {includeOptionalsMemo.includes('superscript') &&
                  <ToolbarButtonSuperscript
                    title={t('toolbar.superscript')}
                    disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                    isSuperscript={isSuperscript}
                    onClick={handleToggleSuperscript}
                    tabIndex={7}
                  />}

                {includeOptionalsMemo.includes('subscript') &&
                  <ToolbarButtonSubscript
                    title={t('toolbar.subscript')}
                    disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                    isSubscript={isSubscript}
                    onClick={handleToggleSubscript}
                    tabIndex={8}
                  />}
                <ToolbarButtonBold
                  title={t('toolbar.bold')}
                  disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                  isBold={isBold}
                  onClick={handleToggleBold}
                  tabIndex={9}
                />

                <ToolbarButtonItalic
                  title={t('toolbar.italic')}
                  disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                  isItalic={isItalic}
                  onClick={handleToggleItalic}
                  tabIndex={10}
                />

                <ToolbarButtonUnderline
                  title={t('toolbar.underline')}
                  disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                  isUnderline={isUnderline}
                  onClick={handleToggleUnderline}
                  tabIndex={10}
                />

                <FormatTextColor
                  onSelect={handleTextColor}
                  tabIndex={12}
                  tooltip={t('toolbar.fontColor')}
                  ariaLabel="Text Color"
                  textColor={toolbarState.color}
                  disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                />

                <HighlightColor
                  onSelect={handleHighlightColor}
                  tabIndex={13}
                  tooltip={t('toolbar.highlightColor')}
                  ariaLabel="Highlight Color"
                  highlightColor={toolbarState.highlightColor}
                  disabled={!toolbarEnabled || isHeadingOrMixedSelection}
                />

                {includeOptionalsMemo.includes('nonprinting') &&
                  <ToolbarButtonNPC
                    title={t('toolbar.nonPrintingCharacters')}
                    disabled={!toolbarEnabled}
                    isNPC={isNPC}
                    onClick={handleToggleShowNonPrintingCharacters}
                    tabIndex={14}
                  />}
              </div>

              <div
                ref={spacingGroupRef}
                className={`flex items-center space-x-2 transition-transform duration-300 h-full`}>
                <AppSeparator orientation="vertical" className="max-h-[70%]" />

                <ToolbarButtonHistoryEdu
                  title={t('toolbar.note')}
                  apparatuses={apparatusesMemo}
                  onSetTextNoteToApparatus={handleSetTextNoteToApparatus}
                  aria-pressed={false}
                  aria-label="Note"
                  disabled={!toolbarEnabled || isApparatus || !notesEnabled || isHeadingOrMixedSelection}
                />

                <ToolbarButtonSiglum
                  title={t('toolbar.siglum')}
                  list={siglumList || []}
                  disabled={!toolbarEnabled || !siglumEnabled}
                  aria-pressed={false}
                  aria-label={t('toolbar.siglum')}
                  onSetup={onShowSiglumSetup}
                  onSelect={onSelectSiglum}
                />

                <ToolbarButtonCitation
                  title={t('toolbar.citation')}
                  disabled={!(toolbarEnabled && canInsertCitation)}
                  aria-pressed={false}
                  aria-label="Citation"
                  onClick={handleClickCitation}
                />

                {includeOptionalsMemo.includes('readingType') &&
                  <ToolbarButtonReadingType
                    title={t('toolbar.readingType')}
                    disabled={!toolbarEnabled || isText || !state.readingTypeEnabled}
                    readingTypeAdd={readingTypeAdd}
                    readingTypeOm={readingTypeOm}
                    readingTypeTr={readingTypeTr}
                    readingTypeDel={readingTypeDel}
                    onClickReadingTypeAdd={onAddReadingTypeAdd}
                    onClickReadingTypeOm={onAddReadingTypeOm}
                    onClickReadingTypeTr={onAddReadingTypeTr}
                    onClickReadingTypeDel={onAddReadingTypeDel}
                  />}

                {includeOptionalsMemo.includes('readingSeparator') &&
                  <ToolbarButtonReadingSeparator
                    title={t('toolbar.readingSeparator')}
                    disabled={!toolbarEnabled || isText || !state.readingSeparatorEnabled}
                    onClick={onAddReadingSeparator}
                    tabIndex={18}
                  />}

              </div>

              <div
                ref={linkingGroupRef}
                className={`flex items-center space-x-2 transition-transform duration-300 h-full`}>
                <AppSeparator orientation="vertical" className="max-h-[70%]" />

                {/* COMMENT */}
                <ToolbarButtonComment
                  title={t('toolbar.comment')}
                  categories={commentCategoriesMemo}
                  disabled={!toolbarEnabled || !commentEnabled}
                  onAddComment={addComment}
                  onSelectCategory={addCommentWithCategory}
                />

                {/* BOOKMARK */}
                <ToolbarButtonBookmark
                  title={t('toolbar.bookmark')}
                  categories={bookmarkCategoriesMemo}
                  disabled={!toolbarEnabled || !bookmarkEnabled}
                  onSetBookmark={handleSetBookmark}
                  onSelectCategory={handleSelectBookmarkCategory}
                />

                {includeOptionalsMemo.includes('symbol') &&
                  <ToolbarButtonSymbol
                    title={t('toolbar.symbol')}
                    disabled={!(toolbarEnabled && canInsertSymbol)}
                    onClick={showAddSymbol}
                    tabIndex={19}
                  />}

                {/* LINK ADD */}
                <ToolbarButtonLink
                  linkTitle={t('toolbar.link')}
                  active={link.length > 0}
                  disabled={!toolbarEnabled || (!linkEnabled && link.length === 0)}
                  editLinkLabel={t('toolbar.editLink')}
                  removeLink={removeLink}
                  removeLinkLabel={t('toolbar.removeLink')}
                  showAddLink={showLinkConfig}
                />

                {/* CHAT OPEN */}
                <ToolbarButtonChat
                  title={t('Chat')}
                  disabled={false}
                  onClick={() => {
                    dispatchEditor(openChat())
                  }}
                />

              </div>

              <div
                ref={alignmentGroupRef}
                className={`flex items-center space-x-2 transition-transform duration-300 h-full`}
              >
                <AppSeparator orientation="vertical" className="max-h-[70%]" />

                {/* Alignment */}
                <ToolbarButtonAlignment
                  title={t('toolbar.alignment')}
                  titleLeft={t('toolbar.alignLeft')}
                  titleRight={t('toolbar.alignRight')}
                  titleCenter={t('toolbar.alignCenter')}
                  titleJustify={t('toolbar.justify')}
                  alignment={currentAlignment}
                  handleAlignmentChange={handleAlignmentChange}
                  tabIndex={22}
                  disabled={!toolbarEnabled || isApparatus || isHeadingOrMixedSelection}
                />

                {/* Spacing */}
                <ToolbarButtonSpacing
                  list={spacingList}
                  title={t('toolbar.spacing')}
                  onShowCustomSpacing={onShowCustomSpacing}
                  tabIndex={27}
                  disabled={!toolbarEnabled || isApparatus || isHeadingOrMixedSelection}
                  customTitle={t('customSpacing.title')}
                  currentSpacing={currentSpacing}
                />

                {/* Bullet List */}
                <ToolbarButtonList
                  tabIndex={32}
                  title={t('toolbar.list')}
                  onSelectListChange={handleListChange}
                  disabled={!toolbarEnabled || isApparatus || isHeadingOrMixedSelection}
                  onShowResumeNumbering={onShowResumeNumbering}
                  continuePreviousNumbering={continuePreviousNumbering}
                  currentListValue={currentListValue}
                  resumeNumberingTitle={t('resumeNumbering.title')}
                  continuePreviousNumberingTitle={t('editor.bulletList.continuePreviousNumbering')}
                />

                <ToolbarButtonDecreaseIndent
                  title={t('toolbar.decreaseIndent')}
                  disabled={!toolbarEnabled || isApparatus || isHeadingOrMixedSelection}
                  tabIndex={41}
                  onClick={onDecreaseIndent}
                />

                <ToolbarButtonIncreaseIndent
                  title={t('toolbar.increaseIndent')}
                  disabled={!toolbarEnabled || isApparatus || isHeadingOrMixedSelection}
                  tabIndex={42}
                  onClick={onIncreaseIndent}
                />
              </div>
            </div>

            <div
              ref={findPreviewGroupRef}
              className={`flex items-center space-x-2 px-1 transition-transform duration-300`}>

              <ToolbarButtonSearch
                title={t('toolbar.search')}
                disabled={!toolbarEnabled}
                tabIndex={43}
                onClick={onSearchClick}
              />

              <ToolbarButtonPrint
                title={t('toolbar.printPreview')}
                disabled={!toolbarEnabled}
                tabIndex={45}
                onClick={handlePrint}
              />

              {/* <AppSeparator orientation="vertical" className="max-h-[70%]" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="mode-button"
                  aria-haspopup="listbox"
                  aria-expanded="false"
                  aria-controls="mode-list"
                  tabIndex={39}
                  className="border-none shadow-none gap-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-primary hover:text-white dark:text-grey-95"
                  intent="secondary"
                  variant="outline"
                  size="mini"
                  rightIcon={
                    <Dropdown inheritColor={!isDark} intent='secondary' variant='tonal' size='small' />
                  }
                // disabled={!toolbarEnabled}
                >
                  {t(`editor.mode.${editorMode}.label`)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent id="mode-list" role="listbox" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={editorMode === 'editing'}
                  onCheckedChange={() => setEditorMode('editing')}
                  className="items-start"
                  tabIndex={40}
                  role="option"
                  aria-selected={editorMode === 'editing'}
                  aria-label={t('editor.mode.editing.label')}
                >
                  <Label>
                    <span className="text-grey-10 dark:text-grey-95 text-[13px]">
                      {t('editor.mode.editing.label')}
                    </span>
                    <span className="flex text-grey-40 dark:text-grey-60 text-[10px]">
                      {t('editor.mode.editing.info')}
                    </span>
                  </Label>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={editorMode === 'review'}
                  onCheckedChange={() => setEditorMode('review')}
                  className="items-start"
                  tabIndex={41}
                  role="option"
                  aria-selected={editorMode === 'review'}
                  aria-label={t('editor.mode.review.label')}
                >
                  <Label>
                    <span className="text-grey-10 dark:text-grey-95 text-[13px]">
                      {t('editor.mode.review.label')}
                    </span>
                    <span className="flex text-grey-40 dark:text-grey-60 text-[10px]">
                      {t('editor.mode.review.info')}
                    </span>
                  </Label>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
});