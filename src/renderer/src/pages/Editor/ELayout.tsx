import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sideview, { SideviewElement } from "./Sideview";
import Footer, { FooterElement } from "./Footer";
import NotificationPanel from "./NotificationPanelView";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Content, { MainContentElement } from "./Content";
import { useDispatch, useSelector } from "react-redux";
import {
    toggleAllApparatuses,
    toggleVisibilityApparatus,
} from "./store/editor/editor.slice";
import {
    selectApparatuses,
    selectHeadingEnabled,
} from "./store/editor/editor.selector";
import Toolbar, { ToolbarElement } from "./Toolbar";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import Preview from "./Preview";
import CustomizeToolbarModal from "./dialogs/setup/CustomizeToolbar";
import {
    setSiglumSetupDialogVisible,
    setFontFamilyList,
    setAddSymbolVisible,
    setReferenceFormatVisible,
    toggleInsertSiglumDialogVisible,
    setLineNumberSetupDialogVisible,
    setPageNumberSetupDialogVisible,
    setHeaderFooterSetupDialogVisible,
    setPageSetupOptDialogVisible,
    setTocSetupDialogVisible,
    togglePrintPreviewVisible,
    setLinkConfigVisible,
    setCustomizeStatusBarVisible,
    setMetadataSetupDialogVisible,
    setFontFamilySymbols,
    setSectionStyleSetupDialogVisible,
    setToolbarVisible,
    setSaveTemplateDialogVisible,
    setChooseTemplateModalVisible,
    setLayoutSetupDialogVisible,
    setCustomSpacingDialogVisible,
    setResumeNumberingDialogVisible,
    setSuggestedStartNumber,
    setStatusBarVisible,
    setChangeTemplateModalVisible,
    setConfirmChangeTemplateModal,
    setBibliographySetupDialogVisible,
    setZoomRatio,
    setCitationInsertDialogVisible,
    setBookmarkEnabled,
    setPrintSetupDialogVisible,
    setExportTeiSetupDialogVisible,
    setCommentEnabled,
    setNotesEnabled,
    setInsertCustomReadingTypeDialogVisible,
    resetSearchCriteria,
    setSearchCriteria,
    setCurrentSearchIndex,
    setReplaceHistory,
    closeAllSelects,
    resetTotalMatches,
    toggleShowNonPrintingCharacters,
    setReferenceFormat,
    toggleTocVisibility,
    setTemplate,
    setLayout,
    setPageSetup,
    setSort,
    setStyles,
    insertApparatusNote,
    triggerNextSearch,
    triggerPreviousSearch,
    insertNotes,
    deleteNoteWithId,
    setPrintOptions,
    setCanInsertSymbol,
    setSelectedSideviewTabIndex,
    increaseReplacedCount,
    setReplacedCount,
} from "./provider";
import Apparatuses, { MainApparatusesElement } from "./Apparatuses";
import { useEditor } from "./hooks/use-editor";
import { useTranslation } from "react-i18next";
import { deleteCommentWithIds } from "./store/comment/comments.slice";
import SetupDialogs from "./dialogs/setup";
import InsertDialogs from "./dialogs/insert";
import { JSONContent } from "@tiptap/core";
import {
    useDocumentAPI,
    useElectron,
    useKeyboardShortcutsAPI,
    useMenuAPI,
} from "@/hooks/use-electron";
import { commentCategoriesSelector } from "./store/comment/comments.selector";
import { bookmarkCategoriesSelector } from "./store/bookmark/bookmark.selector";
import OptionsDialogs, { OptionsDialogsElement } from "./dialogs/option";
import { useMain } from "./hooks/use-main";
import { setToolbarStateFontFamily } from "./provider/actions/toolbar";
import useComment from "./hooks/use-comment";
import { openChat } from "./provider/actions/chat";
import Chat from "./Chat";
import AccountPanelView from "@/views/AccountPanelView";

export default () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const main = useMain();
    const [state, dispatchEditor] = useEditor();
    const keyboardShortcutsAPI = useKeyboardShortcutsAPI();
    const [keyboardShortcuts, setKeyboardShortcuts] = useState<
        KeyboardShortcutCategory[]
    >([]);
    const electron = useElectron();
    const documentAPI = useDocumentAPI();
    const menuAPI = useMenuAPI();
    const commentCategories = useSelector(commentCategoriesSelector);
    const bookmarkCategories = useSelector(bookmarkCategoriesSelector);
    const apparatuses = useSelector(selectApparatuses);
    const optionsDialogsRef = useRef<OptionsDialogsElement | null>(null);
    const sidebarRef = useRef<SideviewElement | null>(null);
    const toolbarRef = useRef<ToolbarElement>(null);
    const editorTextRef = useRef<MainContentElement | null>(null);
    const editorApparatusesRef = useRef<MainApparatusesElement | null>(null);
    const newNoteIdRef = useRef<string | null>(null);
    const handleOnNotificationClickRef = useRef<(() => void) | null>(null);
    const handleOnAccountClickRef = useRef<(() => void) | null>(null);
    const editorContainerRef = useRef<
        MainContentElement | MainApparatusesElement | null
    >(null);
    const footerRef = useRef<FooterElement | null>(null);
    const [documentId, setDocumentId] = useState<string | null>(null)
    const [isCustomizeToolbarOpen, setIsCustomizeToolbarOpen] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [isLoadingMoreNotifications, setIsLoadingMoreNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationPage, setNotificationPage] = useState<NotificationPage | null>(null);
    const [toolbarAdditionalItems, setToolbarAdditionalItems] = useState<
        string[]
    >([]);
    const [statusBarConfig, setStatusBarConfig] = useState<string[]>([]);
    const [zoom, setZoom] = useState<string>("100");
    const [_zoomRatio, _setZoomRatio] = useState<number>(0);
    const headingEnabled = useSelector(selectHeadingEnabled);
    const linkActive = useMemo(() => {
        if (state.toolbarState.link) {
            return state.toolbarState.link.length > 0;
        } else {
            return false;
        }
    }, [state.toolbarState.link]);
    const showNonPrintingCharacters = useMemo(
        () => state.showNonPrintingCharacters ?? false,
        [state.showNonPrintingCharacters]
    );
    const currentListStyleRef = useRef<ListStyle>(state.toolbarState.listStyle);
    const siglumEnabledRef = useRef<boolean>(state.siglumEnabled);
    const canInsertCitationRef = useRef<boolean>(state.canInsertCitation);
    const sidebarClassName = useMemo(
        () => (main.statusBarVisible ? "" : "h-[100vh]"),
        [main.statusBarVisible]
    );
    const isBibliographySection = useMemo(
        () => state.isBibliographySection,
        [state.isBibliographySection]
    );
    const canInsertCitation = useMemo(
        () => state.canInsertCitation,
        [state.canInsertCitation]
    );
    const totalMatches = useMemo(() => state.totalMatches, [state.totalMatches]);
    const currentSearchIndex = useMemo(
        () => state.currentSearchIndex,
        [state.currentSearchIndex]
    );
    const searchHistory = useMemo(
        () => state.searchHistory,
        [state.searchHistory]
    );
    const replaceHistory = useMemo(
        () => state.replaceHistory,
        [state.replaceHistory]
    );
    const disableReplaceAction = useMemo(
        () => state.disableReplaceAction,
        [state.disableReplaceAction]
    );
    const replaceInProgress = useMemo(
        () => state.isCriticalReplacing || state.isApparatusReplacing,
        [state.isCriticalReplacing, state.isApparatusReplacing]
    );
    const isSuperscript = useMemo(
        () => state.toolbarState.superscript,
        [state.toolbarState.superscript]
    );
    const isSubscript = useMemo(
        () => state.toolbarState.subscript,
        [state.toolbarState.subscript]
    );
    const isBold = useMemo(
        () => state.toolbarState.bold,
        [state.toolbarState.bold]
    );
    const isItalic = useMemo(
        () => state.toolbarState.italic,
        [state.toolbarState.italic]
    );
    const isUnderline = useMemo(
        () => state.toolbarState.underline,
        [state.toolbarState.underline]
    );
    const isStrikethrough = useMemo(
        () => state.toolbarState.strikethrough,
        [state.toolbarState.strikethrough]
    );

    const replacedCount = useMemo(
        () => state.replacedCount,
        [state.replacedCount]
    );

    const unreadNotificationsCount = useMemo(
        () => (notifications ?? []).filter(n => n.viewedDate === null).length,
        [notifications]
    );

    // Send notification count to AppTabs whenever it changes
    useEffect(() => {
        window.electron.ipcRenderer.send('update-notification-count', unreadNotificationsCount);
    }, [unreadNotificationsCount]);

    // Poll notifications every 5 seconds (only if logged in)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const loggedIn = await window.user.loggedIn();

                if (!loggedIn) {
                    setNotifications([]);
                    setNotificationPage(null);
                    return;
                }

                const response = await window.notifications.getNotifications(0);
                const notificationsList = response?.content ?? [];

                setNotificationPage(response?.page ?? null);

                // Use mock data if backend returns empty array (for testing)
                if (notificationsList.length === 0) {
                    // setNotifications(mockNotifications);
                } else {
                    setNotifications(notificationsList);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        // Fetch immediately on mount
        fetchNotifications();

        // Set up polling interval
        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const getKeyboardShortcuts = async () => {
            try {
                const shortcuts = await keyboardShortcutsAPI.getShortcuts();
                setKeyboardShortcuts(shortcuts);
            } catch (error) {
                console.error("Error getting keyboard shortcuts:", error);
            }
        };
        getKeyboardShortcuts();
    }, []);

    // Update ref when state changes
    useEffect(() => {
        currentListStyleRef.current = state.toolbarState.listStyle;
    }, [state.toolbarState.listStyle]);

    // Update siglumEnabled ref when state changes
    useEffect(() => {
        siglumEnabledRef.current = state.siglumEnabled;
    }, [state.siglumEnabled]);

    // Update canInsertCitation ref when state changes
    useEffect(() => {
        canInsertCitationRef.current = state.canInsertCitation;
    }, [state.canInsertCitation]);

    // @REFACTOR: check this useEffect
    useEffect(() => {
        window.menu.setRemoveLinkMenuItemEnabled(linkActive);
    }, [linkActive]);

    // @REFACTOR: check this useEffect
    useEffect(() => {
        window.menu.setAddCitationMenuItemEnabled(canInsertCitation);
    }, [canInsertCitation]);

    const handleInsertLink = useCallback(
        (link: string) => {
            if (!editorContainerRef?.current) return;
            editorContainerRef.current.setLink(link);
            dispatchEditor(setLinkConfigVisible(false));
        },
        [editorContainerRef, dispatchEditor]
    );

    const handleChengeStyleFromMenu = useCallback(
        (_: any, caseType: CasingType) => {
            switch (caseType) {
                case "none-case":
                case "all-caps":
                case "small-caps":
                case "title-case":
                case "start-case":
                    editorTextRef?.current?.setCase(caseType);
                    break;
                // Additional style cases could be added here
                default:
                    console.warn(`Unhandled character style: ${caseType}`);
            }
        },
        [
            editorContainerRef.current,
            state.toolbarState,
            state.toolbarState.superscript,
        ]
    );

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("document-saved", () => {
            footerRef.current?.reloadData();
        });
        return () => {
            remove();
        };
    }, [footerRef.current]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("open-chat", () => {
            dispatchEditor(openChat())
        });
        return () => remove();
    }, []);

    // Remove listener in order to avoid memory leak on re-rendering
    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-superscript", () => {
            handleOnSetSuperscript(!isSuperscript);
        });
        return () => {
            remove();
        };
    }, [isSuperscript]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-subscript", () =>
            handleOnSetSubscript(!isSubscript)
        );
        return () => remove();
    }, [isSubscript]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-bold", () =>
            handleOnBoldChange(!isBold)
        );
        return () => remove();
    }, [isBold]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-italic", () =>
            handleOnItalicChange(!isItalic)
        );
        return () => remove();
    }, [isItalic]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-underline", () =>
            handleOnUnderlineChange(!isUnderline)
        );
        return () => remove();
    }, [isUnderline]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("toggle-strikethrough", () =>
            handleOnStrikethroughChange(!isStrikethrough)
        );
        return () => remove();
    }, [isStrikethrough]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on(
            "insert-note-to-apparatus",
            (_, apparatusId: string) =>
                editorTextRef.current?.setTextNoteToApparatusId(apparatusId)
        );
        return () => remove();
    }, [editorTextRef.current]);

    useEffect(() => {
        const addReadingTypeAdd = window.electron.ipcRenderer.on(
            "add-reading-type-add",
            () => {
                editorApparatusesRef.current?.addReadingTypeAdd(main.readingTypeAdd);
            }
        );

        const addReadingTypeOm = window.electron.ipcRenderer.on(
            "add-reading-type-om",
            () => {
                editorApparatusesRef.current?.addReadingTypeOm(main.readingTypeOm);
            }
        );

        const addReadingTypeTr = window.electron.ipcRenderer.on(
            "add-reading-type-tr",
            () => {
                editorApparatusesRef.current?.addReadingTypeTr(main.readingTypeTr);
            }
        );

        const addReadingTypeDel = window.electron.ipcRenderer.on(
            "add-reading-type-del",
            () => {
                editorApparatusesRef.current?.addReadingTypeDel(main.readingTypeDel);
            }
        );

        const addReadingTypeCustom = window.electron.ipcRenderer.on(
            "add-reading-type-custom",
            () => {
                dispatchEditor(setInsertCustomReadingTypeDialogVisible(true));
            }
        );

        const readingSeparator = window.electron.ipcRenderer.on(
            "add-reading-separator",
            () => {
                editorApparatusesRef.current?.addReadingSeparator();
            }
        );

        return () => {
            addReadingTypeAdd();
            addReadingTypeOm();
            addReadingTypeTr();
            addReadingTypeDel();
            addReadingTypeCustom();
            readingSeparator();
        };
    }, [
        editorApparatusesRef.current,
        main.readingTypeAdd,
        main.readingTypeOm,
        main.readingTypeTr,
        main.readingTypeDel,
    ]);

    useEffect(() => {

        const insertComment = globalThis.electron.ipcRenderer.on("insert-comment", () => {
            setTimeout(() => {
                if (commentCategories && commentCategories.length > 0) {
                    optionsDialogsRef.current?.openCommentCategoriesDialog();
                    return;
                }
                addComment();
            }, 100);
        });

        const insertBookmark = globalThis.electron.ipcRenderer.on("insert-bookmark", () => {
            setTimeout(() => {
                if (bookmarkCategories && bookmarkCategories.length > 0) {
                    optionsDialogsRef.current?.openBookmarkCategoriesDialog();
                    return;
                }
                addBookmark();
            }, 100);
        });

        return () => {
            insertComment();
            insertBookmark();
        };
    }, [commentCategories, bookmarkCategories, optionsDialogsRef.current]);

    useEffect(() => {
        menuAPI.setPrintPreviewVisibility(state.printPreviewVisible);
        if (!state.printPreviewVisible)
            return

        const loadPdf = async () => {
            const template = await documentAPI.getTemplate();
            documentAPI
                .savePdf({
                    bibliography: template.layout.bibliography.visible ? 1 : 0,
                    intro: template.layout.intro.visible ? 1 : 0,
                    toc: template.layout.toc.visible ? 1 : 0,
                    critical: 1,
                })
                .catch((error) => {
                    console.error("Error generating PDF:", error);
                });
        };
        loadPdf();
    }, [state.printPreviewVisible, documentAPI, menuAPI]);

    useEffect(() => {
        const documentFindNext = window.electron.ipcRenderer.on(
            "document-find-next",
            handleFindNext
        );
        const documentFindPrevious = window.electron.ipcRenderer.on(
            "document-find-previous",
            handleFindPrevious
        );
        const documentSetFind = window.electron.ipcRenderer.on(
            "document-set-find",
            handleSetFind
        );
        const documentResetFind = window.electron.ipcRenderer.on(
            "document-reset-find",
            handleResetFind
        );
        const documentReplace = window.electron.ipcRenderer.on(
            "document-replace",
            handleReplace
        );
        const documentReplaceAll = window.electron.ipcRenderer.on(
            "document-replace-all",
            handleReplaceAll
        );

        return () => {
            documentFindNext();
            documentFindPrevious();
            documentSetFind();
            documentReplace();
            documentReplaceAll();
            documentResetFind();
        };
    }, [editorTextRef.current, window.electron]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("cut", () =>
            editorContainerRef?.current?.cut()
        );
        return () => remove();
    }, [editorContainerRef.current, window.electron]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("copy", () =>
            editorContainerRef?.current?.copy()
        );
        return () => remove();
    }, [editorContainerRef.current, window.electron]);

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on("paste", () =>
            editorContainerRef?.current?.paste()
        );
        return () => remove();
    }, [editorContainerRef.current, window.electron]);

    useEffect(() => {
        const printOptions = window.electron.ipcRenderer.on(
            "print-options",
            (_, printOptions) => {
                dispatchEditor(setPrintOptions(printOptions));
                dispatchEditor(setPrintSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            }
        );

        return () => printOptions();
    }, [dispatchEditor, window.electron]);

    useEffect(() => {
        const bibliographyListener = window.electron.ipcRenderer.on(
            "bibliography",
            () => {
                dispatchEditor(setBibliographySetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            }
        );
        return () => bibliographyListener();
    }, [dispatchEditor, window.electron]);

    useEffect(() => {
        const teiExportListener = window.electron.ipcRenderer.on(
            "export-tei-setup",
            () => {
                dispatchEditor(setExportTeiSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            }
        );
        return () => teiExportListener();
    }, [dispatchEditor, window.electron]);

    useIpcRenderer(
        (ipc) => {
            ipc.on(
                "keyboard-shortcuts-updated",
                (_, shortcuts: KeyboardShortcutCategory[]) => {
                    setKeyboardShortcuts(shortcuts);
                }
            );
            ipc.on("toggle-toolbar", (_, showToolbar) => {
                dispatchEditor(setToolbarVisible(showToolbar));
            });

            ipc.on("toggle-npc", () => {
                dispatchEditor(toggleShowNonPrintingCharacters());
            });

            ipc.on("toggle-notification-panel", () => {
                handleOnNotificationClickRef.current?.();
            });

            ipc.on("toggle-account-panel", () => {
                handleOnAccountClickRef.current?.();
            });

            ipc.on("page-number-settings", () => {
                dispatchEditor(setPageNumberSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("line-numbers-settings", () => {
                dispatchEditor(setLineNumberSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("header-settings", () => {
                dispatchEditor(setHeaderFooterSetupDialogVisible(true, "header"));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("footer-settings", () => {
                dispatchEditor(setHeaderFooterSetupDialogVisible(true, "footer"));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("toc-settings", () => {
                dispatchEditor(setTocSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("toggle-print-preview", (_) => {
                dispatchEditor(togglePrintPreviewVisible());
                dispatchEditor(closeAllSelects());
            });

            // PDF generation events - state is now managed in main process
            ipc.on("pdf-generated", (_, _pdfPath: string, _tabId: number) => {
                // State is managed in main process, nothing to do here
            });

            ipc.on(
                "pdf-generation-error",
                (_, _errorMessage: string, _tabId: number) => {
                    // State is managed in main process, nothing to do here
                }
            );

            ipc.on("customize-toolbar", () => {
                setIsCustomizeToolbarOpen(true);
                dispatchEditor(closeAllSelects());
            });

            ipc.on("page-setup", () => {
                dispatchEditor(setPageSetupOptDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("show-sections-style-modal", () => {
                dispatchEditor(setSectionStyleSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("metadata", () => {
                dispatchEditor(setMetadataSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("toolbar-additional-items", (_, items: string[]) => {
                setToolbarAdditionalItems(items);
            });

            ipc.on("toggle-toc-visibility", () => {
                dispatchEditor(toggleTocVisibility());
                dispatchEditor(closeAllSelects());
            });

            ipc.on("CmdOrCtrl+Alt+T", () => {
                dispatchEditor(toggleTocVisibility());
            });

            ipc.on("add-siglum", () => {
                if (!siglumEnabledRef.current) return;
                dispatchEditor(toggleInsertSiglumDialogVisible());
                dispatchEditor(closeAllSelects());
            });

            ipc.on("sigla-setup", () => {
                dispatchEditor(setSiglumSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("references-format", () => {
                dispatchEditor(setReferenceFormatVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("insert-link", () => {
                dispatchEditor(setLinkConfigVisible(true));
            });

            ipc.on("remove-link", () => {
                handleRemoveLink();
            });

            ipc.on("set-status-visibility", () => {
                window.application
                    .getStatusBarVisibility()
                    .then((showStatusBar) =>
                        dispatchEditor(setStatusBarVisible(showStatusBar))
                    );
            });

            ipc.send("request-system-fonts");

            ipc.on("receive-system-fonts", (_: any, fonts: string[]) => {
                dispatchEditor(setFontFamilyList(fonts));
                loadInitialFontFamilySymbols(fonts[0]);
            });

            ipc.on("change-character-style", handleChengeStyleFromMenu);

            ipc.on("trigger-undo", () => {
                editorContainerRef?.current?.undo();
            });

            ipc.on("trigger-redo", () => {
                editorContainerRef?.current?.redo();
            });

            ipc.on("copy-style", () => {
                editorContainerRef?.current?.copyStyle();
            });

            ipc.on("paste-style", () => {
                editorContainerRef?.current?.pasteStyle();
            });

            ipc.on("paste-text-without-formatting", () => {
                editorContainerRef?.current?.pasteWithoutFormatting();
            });

            ipc.on("delete-selection", () => {
                editorContainerRef?.current?.deleteSelection();
            });

            ipc.on("insert-symbol", () => {
                handleOnShowAddSymbol();
            });

            ipc.on("customize-status-bar", () => {
                dispatchEditor(setCustomizeStatusBarVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("status-bar-config", () => {
                window.application.readStatusBarConfig().then(setStatusBarConfig);
            });

            ipc.on("zoom-change", () => {
                calculateZoomRatio();
            });

            ipc.on("insert-page-break", () => {
                editorTextRef?.current?.setPageBreak();
            });

            ipc.on("save-as-template", () => {
                dispatchEditor(setSaveTemplateDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("receive-open-choose-layout-modal", () => {
                dispatchEditor(setChooseTemplateModalVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("show-page-setup", () => {
                dispatchEditor(setLayoutSetupDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("show-spacing-settings", () => {
                dispatchEditor(setCustomSpacingDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("resume-numbering", () => {
                dispatchEditor(setResumeNumberingDialogVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("select-all", () => {
                editorContainerRef?.current?.selectAll();
            });

            ipc.on("deselect-all", () => {
                editorContainerRef?.current?.deselectAll();
            });

            ipc.on("show-change-template-modal", () => {
                dispatchEditor(setChangeTemplateModalVisible(true));
                dispatchEditor(closeAllSelects());
            });

            ipc.on("add-citation", handleCitationInsertDialogVisible);

            ipc.on("expand-collapse", () => {
                dispatch(toggleAllApparatuses());
            });

            ipc.on("change-alignment", (_, alignment) => {
                handleOnToggleTextAlignment(alignment);
            });

            ipc.on("set-font-ligature", (_, ligature) => {
                if (!editorTextRef) return;
                editorTextRef?.current?.setLigature(ligature);
            });

            // @ts-ignore
            ipc.on("change-indent-level", (event, action) => {
                if (!editorTextRef) return;

                if (action === "increase") {
                    editorTextRef?.current?.increaseIndent();
                } else {
                    editorTextRef?.current?.decreaseIndent();
                }
            });

            // Character spacing listeners with their shortcut listener
            // @ts-ignore
            ipc.on("change-character-spacing", (event, spacing) => {
                if (!editorTextRef) return;

                if (spacing === "normal") {
                    editorTextRef?.current?.unsetCharacterSpacing();
                } else if (spacing === "increase") {
                    editorTextRef?.current?.increaseCharacterSpacing();
                } else {
                    editorTextRef?.current?.decreaseCharacterSpacing();
                }
            });

            // Listener for Line spacing
            // @ts-ignore
            ipc.on("set-line-spacing", (event, lineSpacing) => {
                if (!editorTextRef) return;
                const spacing = {
                    line: lineSpacing,
                    before: 0,
                    after: 0,
                };

                editorTextRef?.current?.setLineSpacing(spacing);
            });

            // Listener for list style

            ipc.on("number-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("decimal");
            });

            ipc.on("upper-letter-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("upper-alpha");
            });

            ipc.on("low-letter-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("lower-alpha");
            });

            ipc.on("upper-roman-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("upper-roman");
            });

            ipc.on("low-roman-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("lower-roman");
            });

            ipc.on("point-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("disc");
            });

            ipc.on("circle-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("circle");
            });

            ipc.on("square-bullet", () => {
                if (!editorTextRef) return;
                handleOnToggleListStyle("square");
            });

            ipc.on("previous-numbering", () => {
                if (!editorTextRef) return;
                editorTextRef?.current?.continuePreviousNumbering();
            });

            return () => {
                ipc.off("receive-system-fonts");
                ipc.cleanup();
            };
        },
        [window.electron.ipcRenderer]
    );

    // @REFACTOR: check again this solution, only when user change the toc visibility using the button
    useEffect(() => {
        // Debounce the setTocVisibility call to prevent frequent menu rebuilds
        const timeoutId = setTimeout(() => {
            const showToc = state.template?.paratextual.tocSettings.show || true;
            window.menu.setTocVisibility(showToc);
        }, 100); // 100ms debounce

        return () => clearTimeout(timeoutId);
    }, [state.template]);

    useEffect(() => {
        window.application
            .toolbarIsVisible()
            .then((showToolbar) => dispatchEditor(setToolbarVisible(showToolbar)));
        window.application
            .getStatusBarVisibility()
            .then((showStatusBar) =>
                dispatchEditor(setStatusBarVisible(showStatusBar))
            );
        window.application
            .readToolbarAdditionalItems()
            .then(setToolbarAdditionalItems);
        window.application.readStatusBarConfig().then(setStatusBarConfig);
        calculateZoomRatio();
    }, []);

    const handleOnApplyReferenceFormat = useCallback(() => {
        editorApparatusesRef?.current?.updateReadingType();
        editorApparatusesRef?.current?.updateReadingSeparator();
        editorApparatusesRef?.current?.updateLemmaStyleAndSeparator();
    }, [editorApparatusesRef, editorTextRef]);

    const onSaveMetadata = useCallback(
        (metadata: Metadata) => {
            electron.doc.setMetadata(metadata);
            footerRef.current?.reloadData();
        },
        [electron.doc, footerRef.current]
    );

    const handleSaveToolbarOptions = useCallback((items: string[]) => {
        window.application.storeToolbarAdditionalItems(items);
        setIsCustomizeToolbarOpen(false);
    }, []);

    const handleCancelToolbar = useCallback(
        () => setIsCustomizeToolbarOpen(false),
        []
    );

    const storeStatusBarConfig = useCallback(
        (items: string[]) => {
            window.application.storeStatusBarConfig(items);
            dispatchEditor(setCustomizeStatusBarVisible(false));
        },
        [editorContainerRef]
    );

    const handleAddSymbol = useCallback(
        (character: number) => {
            editorContainerRef?.current?.insertCharacter(character);
        },
        [editorContainerRef]
    );

    const handleZoomChange = useCallback((zoom: string) => {
        window.application.storeZoom(zoom);
    }, []);

    const calculateZoomRatio = useCallback(() => {
        window.application.readZoom().then((zoom) => {
            setZoom(zoom);
            const zoomLevel = +zoom / 100;
            _setZoomRatio(zoomLevel);
            dispatchEditor(setZoomRatio(zoomLevel));
        });
    }, []);

    const handleOnSelectSiglum = useCallback(
        (siglum: Siglum) => {
            if (editorContainerRef.current?.type() === "MAIN_TEXT") {
                editorTextRef.current?.addSiglum(siglum);
            } else {
                editorApparatusesRef.current?.addSiglum(siglum);
            }
        },
        [editorContainerRef.current]
    );

    const handleOnShowSiglumSetup = useCallback(() => {
        dispatchEditor(setSiglumSetupDialogVisible(true));
    }, [dispatchEditor]);

    const changeHeadingLevel = useCallback(
        (style: Style) => {
            editorTextRef.current?.setHeading(style);
        },
        [editorTextRef]
    );

    const setBody = useCallback((style?: Style) => {
        editorTextRef.current?.setBody(style);
    }, [editorTextRef]);

    const setCustomStyle = useCallback(
        (style?: Style) => {
            editorTextRef.current?.setCustomStyle(style);
        },
        [editorTextRef]
    );

    const handleOnFontFamilyChange = useCallback(
        (fontFamily: string) => {
            dispatchEditor(setToolbarStateFontFamily(fontFamily));
            editorContainerRef.current?.setFontFamily(fontFamily);
        },
        [editorContainerRef]
    );

    const handleOnFontSizeChange = useCallback(
        (fontSize: string) => {
            editorContainerRef.current?.setFontSize(fontSize);
        },
        [editorContainerRef]
    );

    const handleOnBoldChange = useCallback(
        (bold: boolean) => {
            editorContainerRef.current?.setBold(bold);
        },
        [editorContainerRef]
    );

    const handleOnItalicChange = useCallback(
        (italic: boolean) => {
            editorContainerRef.current?.setItalic(italic);
        },
        [editorContainerRef]
    );

    const handleOnUnderlineChange = useCallback(
        (underline: boolean) => {
            editorContainerRef.current?.setUnderline(underline);
        },
        [editorContainerRef]
    );

    const handleOnStrikethroughChange = useCallback(
        (value: boolean) => {
            editorContainerRef.current?.setStrikeThrough(value);
        },
        [editorContainerRef, editorTextRef, editorApparatusesRef]
    );

    const handleOnTextColorChange = useCallback(
        (textColor: string) => {
            editorContainerRef.current?.setTextColor(textColor);
        },
        [editorContainerRef]
    );

    const handleOnHighlightColorChange = useCallback(
        (highlightColor: string) => {
            editorContainerRef.current?.setHighlightColor(highlightColor);
        },
        [editorContainerRef]
    );

    const handleOnToggleTextAlignment = useCallback(
        (alignment: Alignment) => {
            editorTextRef.current?.setTextAlignment(alignment);
        },
        [editorTextRef]
    );

    const handleOnSetLineSpacing = useCallback(
        (spacing: Spacing) => {
            editorTextRef.current?.setLineSpacing(spacing);
        },
        [editorTextRef]
    );

    const handleOnSetListStyle = useCallback(
        (style: ListStyle) => {
            editorTextRef.current?.setListStyle(style);
        },
        [editorTextRef]
    );

    const handleOnToggleListStyle = useCallback(
        (style: ListStyle) => {
            const currentList = currentListStyleRef.current;
            editorTextRef.current?.setListStyle(currentList === style ? "" : style);
        },
        [editorTextRef]
    );

    const handleOnSetSuperscript = useCallback(
        (superscript: boolean) => {
            editorContainerRef.current?.setSuperscript(superscript);
        },
        [editorContainerRef]
    );

    const handleOnSetSubscript = useCallback(
        (subscript: boolean) => {
            editorContainerRef.current?.setSubscript(subscript);
        },
        [editorContainerRef]
    );

    const handleOnIncreaseIndent = useCallback(() => {
        editorTextRef.current?.increaseIndent();
    }, [editorTextRef]);

    const handleOnDecreaseIndent = useCallback(() => {
        editorTextRef.current?.decreaseIndent();
    }, [editorTextRef]);

    const handleOnShowCustomSpacing = useCallback(() => {
        dispatchEditor(setCustomSpacingDialogVisible(true));
    }, [editorContainerRef]);

    const handleOnShowResumeNumbering = useCallback(() => {
        // Calculate suggested start number like Microsoft Word
        const suggestedStartInfo: {
            number: number;
            listType: OrderedListType;
        } | null = editorTextRef.current?.getSuggestedStartNumber() ?? null;
        dispatchEditor(setSuggestedStartNumber(suggestedStartInfo));
        dispatchEditor(setResumeNumberingDialogVisible(true));
    }, [dispatchEditor, editorTextRef]);

    const handleOnContinuePreviousNumbering = useCallback(() => {
        editorTextRef.current?.continuePreviousNumbering();
    }, [editorTextRef.current]);

    const handleOnUndo = useCallback(() => {
        editorContainerRef.current?.undo();
    }, [editorContainerRef]);

    const handleOnRedo = useCallback(() => {
        editorContainerRef.current?.redo();
    }, [editorContainerRef]);

    const bookmarkHighlightColor = useMemo(
        () => state.referenceFormat.bookmarks_color,
        [state.referenceFormat.bookmarks_color]
    );
    const commentHighlightColor = useMemo(
        () => state.referenceFormat.comments_color,
        [state.referenceFormat.comments_color]
    );
    const siglaHighlightColor = useMemo(
        () => state.referenceFormat.sigla_color,
        [state.referenceFormat.sigla_color]
    );
    const readingTypeAndSeparatorHighlightColor =
        state.referenceFormat.reading_type_separator_color;
    const lemmaHighlightColor = useMemo(
        () => state.referenceFormat.lemma_color,
        [state.referenceFormat.lemma_color]
    );

    const addBookmark = useCallback(
        (categoryId?: string) => {
            editorTextRef.current?.addBookmark(bookmarkHighlightColor, categoryId);
        },
        [state.referenceFormat, bookmarkHighlightColor]
    );

    const addComment = useCallback(
        (categoryId?: string) => {
            editorContainerRef.current?.addComment(commentHighlightColor, categoryId);
        },
        [editorContainerRef, commentHighlightColor]
    );

    useEffect(() => {
        if (!window.doc || currentSearchIndex === null) return;

        window.doc.sendCurrentSearchIndex(currentSearchIndex);
    }, [currentSearchIndex, window.doc]);

    useEffect(() => {
        window.doc.sendSearchHistory(searchHistory);
    }, [searchHistory]);

    useEffect(() => {
        window.doc.sendReplaceHistory(replaceHistory);
    }, [replaceHistory, searchHistory]);

    useEffect(() => {
        window.doc.setDisableReplaceAction(disableReplaceAction);
    }, [disableReplaceAction, window.doc]);

    useEffect(() => {
        window.doc.sendTotalSearchResults(totalMatches);
        if (currentSearchIndex === null && totalMatches > 0) {
            dispatchEditor(setCurrentSearchIndex(0));
        }
    }, [totalMatches, window.doc, currentSearchIndex]);

    useEffect(() => {
        window.doc.setReplaceInProgress(replaceInProgress);
    }, [replaceInProgress, window.doc]);

    const handleFindNext = useCallback(() => {
        dispatchEditor(triggerNextSearch());
    }, [dispatchEditor]);

    const handleFindPrevious = useCallback(() => {
        dispatchEditor(triggerPreviousSearch());
    }, [dispatchEditor]);

    const handleResetFind = useCallback(() => {
        dispatchEditor(resetSearchCriteria());
    }, [dispatchEditor]);

    const handleSetFind = useCallback((_, options: SearchCriteria) => {
        dispatchEditor(resetTotalMatches(0));
        dispatchEditor(setCurrentSearchIndex(null));
        dispatchEditor(setSearchCriteria(options));
    }, []);

    const handleReplace = useCallback(
        async (_, replacement: string) => {
            if (replacedCount >= totalMatches) {
                window.electron.ipcRenderer.send("no-more-replacements");
                return;
            }

            await editorTextRef.current?.replace(replacement);
            await editorApparatusesRef.current?.replace(replacement);
            dispatchEditor(setReplaceHistory(replacement));
            dispatchEditor(increaseReplacedCount());
            dispatchEditor(triggerNextSearch());
        },
        [editorTextRef, editorApparatusesRef, replacedCount, totalMatches]
    );

    const handleReplaceAll = useCallback(
        async (_, replacement: string) => {
            if (replacedCount >= totalMatches) {
                window.electron.ipcRenderer.send("no-more-replacements");
                return;
            }

            await editorApparatusesRef.current?.replaceAll(replacement);
            await editorTextRef.current?.replaceAll(replacement);
            dispatchEditor(setReplaceHistory(replacement));
            dispatchEditor(setReplacedCount(totalMatches));
        },
        [editorTextRef, editorApparatusesRef, totalMatches, replacedCount]
    );

    const handleOnShowCustomizeToolbar = useCallback(() => {
        setIsCustomizeToolbarOpen(true);
    }, []);

    const handleOnShowAddSymbol = useCallback(() => {
        dispatchEditor(setAddSymbolVisible(true));
        dispatchEditor(closeAllSelects());
    }, [dispatchEditor]);

    const handleOnClickBookmark = useCallback((bookmark: Bookmark) => {
        editorTextRef.current?.scrollToBookmark(bookmark.id);
    }, []);

    const handleOnClickHeadingIndex = useCallback(
        (index: number, sectionType?: string) => {
            editorTextRef.current?.scrollToHeadingIndex(index, sectionType);
        },
        []
    );

    const handleOnScrollToSection = useCallback(
        (sectionId: string, position?: "top" | "bottom") => {
            editorTextRef.current?.scrollToSection(sectionId, position);
        },
        []
    );

    const deleteBookmarksWithIds = useCallback(
        (ids: string[]) => {
            editorTextRef?.current?.unsetBookmarksWithIds(ids);
        },
        [editorTextRef?.current]
    );

    const comment = useComment()

    const deleteCommentsWithIds = useCallback((ids: string[]) => {
        const mainEditorRef = editorTextRef?.current
        const apparatusEditorRef = editorApparatusesRef?.current
        if (!mainEditorRef || !apparatusEditorRef)
            return

        let mainEditorCommentsIds: string[] = [];
        let apparatusEditorCommentsIds: string[] = [];

        mainEditorCommentsIds = mainEditorRef.getCommentsIds();
        apparatusEditorCommentsIds = apparatusEditorRef.getCommentsIds();

        const editorCommentsIds = new Set([...mainEditorCommentsIds, ...apparatusEditorCommentsIds]);
        const difference = ids.filter(item => !editorCommentsIds.has(item))

        comment.hideCommentWithIds(difference)

        mainEditorRef.unsetCommentsWithIds(ids);
        apparatusEditorRef.unsetCommentsWithIds(ids);
    }, [editorTextRef?.current, editorApparatusesRef?.current, comment]);

    const handleOnClickComment = useCallback(
        (comment: AppComment) => {
            const mainTextCommentsIds = editorTextRef?.current?.getCommentsIds();
            const apparatusCommentsIds =
                editorApparatusesRef?.current?.getCommentsIds();
            const isMainTextComment = mainTextCommentsIds?.includes(comment.id);
            const isApparatusComment = apparatusCommentsIds?.includes(comment.id);

            if (isMainTextComment) {
                editorTextRef?.current?.scrollToComment(comment);
            }

            if (isApparatusComment) {
                editorApparatusesRef?.current?.scrollToCommentId(comment.id);
            }
        },
        [editorTextRef?.current, editorApparatusesRef?.current]
    );

    const handleOnFocusTextEditor = useCallback(() => {
        editorContainerRef.current = editorTextRef.current;
        toolbarRef.current?.setCurrentEditor("TEXT");
        electron.menu.setReferencesMenuCurrentContext("maintext_editor");
        footerRef.current?.setTitle("Text Editor");
    }, [editorTextRef, window.menu]);

    const handleOnRegisterBookmark = useCallback(
        (id: string, categoryId?: string) => {
            sidebarRef.current?.scrollAndEditBookmark(id, categoryId);
        },
        [sidebarRef]
    );

    const scrollAndEditComment = useCallback(
        (id: string, categoryId?: string) => {
            sidebarRef.current?.scrollAndEditComment(id, categoryId);
        },
        [sidebarRef]
    );

    const handleOnFocusApparatusEditor = useCallback(() => {
        editorContainerRef.current = editorApparatusesRef.current;
        toolbarRef.current?.setCurrentEditor("APPARATUS");
        dispatchEditor(setBookmarkEnabled(false));
        dispatchEditor(setCommentEnabled(false));
        electron.menu.setLinkMenuItemEnabled(false);
        electron.menu.setReferencesMenuCurrentContext("apparatus_editor");
        footerRef.current?.setTitle("Apparatus Editor");
    }, [editorApparatusesRef.current, window.menu]);

    const handleOnShowLinkConfig = useCallback(() => {
        dispatchEditor(setLinkConfigVisible(true));
    }, [dispatchEditor]);

    const handleRemoveLink = useCallback(() => {
        editorTextRef.current?.removeLink();
    }, [editorTextRef]);

    const handleCitationInsertDialogVisible = useCallback(() => {
        if (!canInsertCitationRef.current)
            return;
        dispatchEditor(closeAllSelects());
        dispatchEditor(setCitationInsertDialogVisible(true));
    }, [dispatchEditor]);

    const handleOnInsertLineSpacing = useCallback(
        (spacing: Spacing) => {
            editorTextRef.current?.setLineSpacing(spacing);
            dispatchEditor(setLineNumberSetupDialogVisible(false));
        },
        [editorTextRef.current]
    );

    const handleOnSetListNumbering = useCallback(
        (numberBullet: number) => {
            editorTextRef.current?.setListNumbering(numberBullet);
            dispatchEditor(setResumeNumberingDialogVisible(false));
        },
        [editorTextRef, dispatchEditor]
    );

    useEffect(() => {
        window.menu.updateViewApparatusesMenuItems(apparatuses);
    }, [apparatuses]);

    useEffect(() => {
        editorTextRef.current?.setShowNonPrintingCharacters(
            showNonPrintingCharacters
        );
        editorApparatusesRef.current?.setShowNonPrintingCharacters(
            showNonPrintingCharacters
        );
    }, [editorTextRef, editorApparatusesRef, showNonPrintingCharacters]);

    // load initial font family symbols
    const loadInitialFontFamilySymbols = useCallback(
        async (fontFamily: string) => {
            const symbols = await window.system.getSymbols(fontFamily);
            dispatchEditor(setFontFamilySymbols(symbols));
        },
        [dispatchEditor]
    );

    const addReadingTypeAdd = useCallback(
        (readingType: ReadingTypeAdd) => {
            editorApparatusesRef.current?.addReadingTypeAdd(readingType);
        },
        [editorApparatusesRef]
    );

    const addReadingTypeOm = useCallback(
        (readingType: ReadingTypeOm) => {
            editorApparatusesRef.current?.addReadingTypeOm(readingType);
        },
        [editorApparatusesRef]
    );

    const addReadingTypeTr = useCallback(
        (readingType: ReadingTypeTr) => {
            editorApparatusesRef.current?.addReadingTypeTr(readingType);
        },
        [editorApparatusesRef]
    );

    const addReadingTypeDel = useCallback(
        (readingType: ReadingTypeDel) => {
            editorApparatusesRef.current?.addReadingTypeDel(readingType);
        },
        [editorApparatusesRef]
    );

    const handleOnSearchClick = useCallback(() => {
        window.doc.openFind();
    }, []);

    const handleOnNotificationClick = useCallback(async () => {
        const willOpen = !isNotificationPanelOpen;
        setIsNotificationPanelOpen(willOpen);

        if (willOpen) {
            setIsLoadingNotifications(true);
            try {
                const response = await window.notifications.getNotifications(0);
                setNotifications(response?.content ?? []);
                setNotificationPage(response?.page ?? null);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setTimeout(() => {
                    setIsLoadingNotifications(false);
                }, 1000);
            }
        }
    }, [isNotificationPanelOpen]);

    // Handle account panel toggle
    const handleOnAccountClick = useCallback(() => {
        setIsAccountPanelOpen(prev => !prev);
    }, []);

    // Keep ref updated for IPC handler
    useEffect(() => {
        handleOnNotificationClickRef.current = handleOnNotificationClick;
    }, [handleOnNotificationClick]);

    // Keep account ref updated for IPC handler
    useEffect(() => {
        handleOnAccountClickRef.current = handleOnAccountClick;
    }, [handleOnAccountClick]);

    const handleLoadMoreNotifications = useCallback(async () => {
        if (!notificationPage || isLoadingMoreNotifications) return;

        const currentPage = notificationPage.number;
        const totalPages = notificationPage.totalPages;

        // Check if there are more pages to load
        if (currentPage >= totalPages - 1) return;

        const nextPage = currentPage + 1;
        setIsLoadingMoreNotifications(true);

        try {
            const response = await window.notifications.getNotifications(nextPage);
            const newNotifications = response?.content ?? [];

            if (newNotifications.length > 0) {
                setNotifications(prev => [...prev, ...newNotifications]);
                setNotificationPage(response?.page ?? null);
            }
        } catch (error) {
            console.error("Error loading more notifications:", error);
        } finally {
            setIsLoadingMoreNotifications(false);
        }
    }, [notificationPage, isLoadingMoreNotifications]);

    const hasMoreNotifications = useMemo(() => {
        if (!notificationPage) return false;
        return notificationPage.number < notificationPage.totalPages - 1;
    }, [notificationPage]);

    const handleMarkAsViewed = useCallback(async (notification: NotificationItem) => {
        try {
            const updatedNotification = await window.notifications.markAsViewed(notification.notificationId);
            if (updatedNotification) {
                setNotifications(prev =>
                    prev.map(n => n.notificationId === notification.notificationId
                        ? { ...n, ...updatedNotification }
                        : n)
                );
            }
        } catch (error) {
            console.error("Error marking notification as viewed:", error);
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        const unreadIds = (notifications ?? [])
            .filter(n => n.viewedDate === null)
            .map(n => n.notificationId);

        if (unreadIds.length === 0) return;

        try {
            const updatedNotifications = await window.notifications.markAllAsViewed(unreadIds);
            if (updatedNotifications) {
                setNotifications(prev => {
                    const updatedMap = new Map(updatedNotifications.map(n => [n.notificationId, n]));
                    return prev.map(n => updatedMap.get(n.notificationId) || n);
                });
            }
        } catch (error) {
            console.error("Error marking all notifications as viewed:", error);
        }
    }, [notifications]);

    const addReadingSeparator = useCallback(() => {
        editorApparatusesRef.current?.addReadingSeparator();
    }, [editorApparatusesRef]);

    const selectedCriticalText = useRef<string>("");

    const handleOnSelectText = useCallback(
        (text: string) => {
            selectedCriticalText.current = text;
            dispatchEditor(setNotesEnabled(text.length > 0));
        },
        [selectedCriticalText]
    );

    const clickNoteWithId = useCallback(
        (id: string) => {
            editorApparatusesRef.current?.scrollToApparatusId(id);
        },
        [editorApparatusesRef]
    );

    const handleInsertCitation = useCallback(
        (citationStyle: CITATION_STYLES, citation: BibReference) => {
            if (!state.styles) {
                return;
            }
            const bibStyle = state.styles.find((style) => style.type === "BIB");
            if (!bibStyle) {
                return;
            }
            editorContainerRef.current?.insertCitation(
                citationStyle,
                citation,
                bibStyle,
                isBibliographySection
            );
        },
        [editorContainerRef.current, state.styles, isBibliographySection]
    );

    const insertReadingTypeAdd = useCallback(
        (readingType: ReadingTypeAdd) => {
            editorApparatusesRef.current?.addReadingTypeAdd(readingType);
        },
        [editorApparatusesRef.current]
    );

    const insertReadingTypeOm = useCallback(
        (readingType: ReadingTypeOm) => {
            editorApparatusesRef.current?.addReadingTypeOm(readingType);
        },
        [editorApparatusesRef.current]
    );

    const insertReadingTypeTr = useCallback(
        (readingType: ReadingTypeTr) => {
            editorApparatusesRef.current?.addReadingTypeTr(readingType);
        },
        [editorApparatusesRef.current]
    );

    const insertReadingTypeDel = useCallback(
        (readingType: ReadingTypeDel) => {
            editorApparatusesRef.current?.addReadingTypeDel(readingType);
        },
        [editorApparatusesRef.current]
    );

    const insertReadingTypeCustom = useCallback(
        (readingType: string) => {
            editorApparatusesRef.current?.addReadingTypeCustom(readingType);
        },
        [editorApparatusesRef.current]
    );

    const onTextNoteCreated = useCallback(
        (noteId: string, text: string, apparatusId: string) => {
            const apparatus = main.apparatuses.find(
                (apparatus) => apparatus.id === apparatusId
            );
            if (!apparatus)
                return;


            newNoteIdRef.current = noteId;

            dispatchEditor(
                insertApparatusNote({
                    noteId,
                    noteContent: text,
                    apparatusId,
                    entryNodes: [],
                    visible: true,
                })
            );
            editorApparatusesRef.current?.expandApparatusWithId(apparatusId);
        },
        [dispatchEditor, editorApparatusesRef, main.apparatuses]
    );

    const onSaveStyles = useCallback(() => {
        setTimeout(() => {
            editorTextRef.current?.updateLayout();
        }, 10);
        setTimeout(() => {
            editorApparatusesRef.current?.updateApparatusesEntries(state.apparatusNotes, newNoteIdRef.current);
            newNoteIdRef.current = null;
        }, 100);
    }, [editorTextRef.current, editorApparatusesRef, state.apparatusNotes, newNoteIdRef.current])

    const onTextNotesChanged = useCallback(
        (data: { noteId: string; noteContent: string }[]) => {
            const existingById = new Map(
                state.apparatusNotes.map((note) => [note.noteId, note] as const)
            );
            const incomingIds = new Set(data.map((d) => d.noteId));

            const updatedOrCreated = data.map((item) => {
                const existing = existingById.get(item.noteId);
                return existing
                    ? ({
                        ...existing,
                        noteContent: item.noteContent,
                        visible: true,
                    } satisfies ApparatusNote)
                    : ({
                        noteId: item.noteId,
                        noteContent: item.noteContent,
                        apparatusId: "",
                        entryNodes: [],
                        visible: true,
                    } satisfies ApparatusNote);
            });

            const hiddenExisting = state.apparatusNotes
                .filter((note) => !incomingIds.has(note.noteId))
                .map(
                    (note) =>
                        ({
                            ...note,
                            noteContent: "",
                            visible: false,
                        }) satisfies ApparatusNote
                );

            const mergedNotes = [
                ...updatedOrCreated,
                ...hiddenExisting,
            ] satisfies ApparatusNote[] as ApparatusNote[]

            dispatchEditor(insertNotes(mergedNotes))
            editorApparatusesRef.current?.updateApparatusesEntries(mergedNotes, newNoteIdRef.current);
            newNoteIdRef.current = null;
        }, [dispatchEditor, editorApparatusesRef, state.apparatusNotes, newNoteIdRef.current])

    const handleOnTextNoteWithIdsDeleted = useCallback(
        (ids: string[]) => {
            editorApparatusesRef.current?.deleteApparatusesEntryWithIds(ids);
        },
        [editorApparatusesRef]
    );

    const handleOnDeleteApparatusWithId = useCallback(
        (id: string) => {
            dispatchEditor(deleteNoteWithId(id));
            editorTextRef?.current?.unsetNoteWithId(id);
        },
        [editorTextRef.current]
    );

    const handleOnClickLemmaWithId = useCallback(
        (id: string) => {
            editorTextRef?.current?.scrollToNoteWithId(id);
        },
        [editorTextRef.current]
    );

    const handleOnDeleteApparatusesWithIds = useCallback(
        (ids: string[]) => {
            editorTextRef?.current?.removeNoteWithIds(ids);
        },
        [editorTextRef.current]
    );

    const onClickCommentWithId = useCallback(
        (id: string) => {
            sidebarRef.current?.setOpen(true);
            dispatchEditor(setSelectedSideviewTabIndex(0));
            sidebarRef.current?.scrollToCommentId(id);
        },
        [sidebarRef, dispatchEditor]
    );

    const onClickBookmarkWithId = useCallback(
        (id: string) => {
            sidebarRef.current?.setOpen(true);
            dispatchEditor(setSelectedSideviewTabIndex(1));
            sidebarRef.current?.scrollToBookmarkId(id);
        },
        [sidebarRef, dispatchEditor]
    );

    const handleOnCommentWithIdsDeleted = useCallback((ids: string[]) => {
        dispatch(deleteCommentWithIds(ids));
    }, []);

    const onSetTextNoteToApparatusId = useCallback(
        (apparatusId: string) => {
            editorTextRef.current?.setTextNoteToApparatusId(apparatusId);
        },
        [editorTextRef.current]
    );

    const handleOnInsertBibliography = useCallback(() => {
        const apparatusBibliographies =
            editorApparatusesRef?.current?.getInsertedBibliographyEntries();
        editorTextRef?.current?.insertBibliographies(apparatusBibliographies || []);
    }, [editorTextRef, editorApparatusesRef]);

    const handleOnCurrentSection = useCallback(
        (section: string) => {
            toolbarRef.current?.setCurrentSection(section);
        },
        [toolbarRef.current]
    );

    useEffect(() => {
        dispatchEditor(setCanInsertSymbol(false));
        window.menu.setSymbolMenuItemEnabled(false);

        documentAPI.getTemplate().then((template) => {
            const styles = template.styles;
            dispatchEditor(setTemplate(template));
            dispatchEditor(setStyles(styles));

            menuAPI.setTocMenuItemsEnabled(template.layout.toc?.visible);
            menuAPI.setTocSettingsEnabled(template.layout.toc?.visible);
            menuAPI.setTocVisibility(template.paratextual.tocSettings.show);
        });

        documentAPI.getReferencesFormat().then((referencesFormat) => {
            dispatchEditor(setReferenceFormat(referencesFormat));
        });
    }, [dispatchEditor, documentAPI]);

    useEffect(() => {
        const clean = window.electron.ipcRenderer.on("toggle-toc-visibility", () =>
            handleTocVisibility()
        );
        return () => clean();
    }, []);

    const handleTocVisibility = useCallback(async () => {
        let settings = await window.doc.getTocSettings();
        settings.show = !settings.show;
        onSaveToc(settings);
    }, []);

    const onSelectTemplate = useCallback((data: Template) => {
        dispatchEditor(setTemplate(data));

        const editorText = editorTextRef.current;

        dispatchEditor(setChooseTemplateModalVisible(false));

        electron.doc.setTemplate(data);

        dispatchEditor(setStyles(data.styles));

        editorText?.updateLayout();

        if (data.type === 'DEFAULT') {
            dispatchEditor(setLayoutSetupDialogVisible(true));
        }
    }, [editorTextRef]);

    const onChangeTemplate = useCallback(async (template: Template) => {
        dispatchEditor(setTemplate(template));

        const layout = template.layout;
        const layoutTemplateCritical = layout.critical;
        const apparatusDetails = layoutTemplateCritical.apparatusDetails;
        const apparatusesFromTemplate = apparatusDetails.filter((app) => app.type !== "text");

        const currentApparatusesList = await main.loadDocumentApparatuses();

        const currentCriticalApparatuses = currentApparatusesList.filter(
            (apparatus) =>
                apparatus.type === "CRITICAL" &&
                apparatus.content?.content?.length > 0
        );
        const currentPageNotesApparatuses = currentApparatusesList.filter(
            (apparatus) =>
                apparatus.type === "PAGE_NOTES" &&
                apparatus.content?.content?.length > 0
        );
        const currentSectionNotesApparatuses = currentApparatusesList.filter(
            (apparatus) =>
                apparatus.type === "SECTION_NOTES" &&
                apparatus.content?.content?.length > 0
        );
        const currentInnerMarginApparatuses = currentApparatusesList.filter(
            (apparatus) =>
                apparatus.type === "INNER_MARGIN" &&
                apparatus.content?.content?.length > 0
        );
        const currentOuterMarginApparatuses = currentApparatusesList.filter(
            (apparatus) =>
                apparatus.type === "OUTER_MARGIN" &&
                apparatus.content?.content?.length > 0
        );

        const templateCriticalApparatuses = apparatusesFromTemplate.filter(
            (apparatus) => apparatus.sectionType === "CRITICAL"
        );
        const templatePageNotesApparatuses = apparatusesFromTemplate.filter(
            (apparatus) => apparatus.sectionType === "PAGE_NOTES"
        );
        const templateSectionNotesApparatuses = apparatusesFromTemplate.filter(
            (apparatus) => apparatus.sectionType === "SECTION_NOTES"
        );
        const templateInnerMarginApparatuses = apparatusesFromTemplate.filter(
            (apparatus) => apparatus.sectionType === "INNER_MARGIN"
        );
        const templateOuterMarginApparatuses = apparatusesFromTemplate.filter(
            (apparatus) => apparatus.sectionType === "OUTER_MARGIN"
        );

        const criticalApparatusesToRemove = currentCriticalApparatuses.slice(
            templateCriticalApparatuses.length
        );
        const pageNotesApparatusesToRemove = currentPageNotesApparatuses.slice(
            templatePageNotesApparatuses.length
        );
        const sectionNotesApparatusesToRemove =
            currentSectionNotesApparatuses.slice(
                templateSectionNotesApparatuses.length
            );
        const innerMarginApparatusesToRemove =
            currentInnerMarginApparatuses.slice(
                templateInnerMarginApparatuses.length
            );
        const outerMarginApparatusesToRemove =
            currentOuterMarginApparatuses.slice(
                templateOuterMarginApparatuses.length
            );

        const allApparatusesToRemove = [
            ...criticalApparatusesToRemove,
            ...pageNotesApparatusesToRemove,
            ...sectionNotesApparatusesToRemove,
            ...innerMarginApparatusesToRemove,
            ...outerMarginApparatusesToRemove,
        ];

        if (allApparatusesToRemove.length === 0) {
            electron.doc.setTemplate(template);
            const editorText = editorTextRef.current;

            dispatchEditor(setStyles(template.styles));

            editorText?.updateLayout();
            main.loadApparatuses();
            dispatchEditor(setChangeTemplateModalVisible(false));
            return;
        }

        const allApparatusesToRemoveString = allApparatusesToRemove
            .map(
                (apparatus) =>
                    `# ${apparatus.title}: ${apparatus.content?.content?.length}\n`
            )
            .join("\n");

        const confirmMessage = `
                ${t("confirmChangeTemplateModal.description.warning")}
    
                ${allApparatusesToRemoveString}
    
                ${t("confirmChangeTemplateModal.description.irreversible")}
    
                ${t("confirmChangeTemplateModal.description.continue")}
            `.trim();

        dispatchEditor(
            setConfirmChangeTemplateModal({
                visible: true,
                text: confirmMessage,
                onConfirm: () => {
                    const editorText = editorTextRef.current;
                    documentAPI.setTemplate(template);
                    dispatchEditor(setStyles(template.styles));
                    editorText?.updateLayout();
                    main.loadApparatuses();
                    dispatchEditor(setChangeTemplateModalVisible(false));
                },
            })
        );
    }, [editorTextRef, main, documentAPI]);

    const onSaveTemplate = useCallback(async (name: string) => {
        await documentAPI.createTemplate(name);
        dispatchEditor(setSaveTemplateDialogVisible(false));
    }, [dispatchEditor, documentAPI]);

    const onSaveLayout = useCallback(async (deletedApparatusIds: string[], layout: Layout, pageSetup: SetupOptionType, sort: string[]) => {
        dispatchEditor(setLayout(layout));
        dispatchEditor(setPageSetup(pageSetup));
        dispatchEditor(setSort(sort));

        documentAPI.setLayout(layout);
        documentAPI.setPageSetup(pageSetup);
        documentAPI.setSort(sort);

        menuAPI.setTocMenuItemsEnabled(layout.toc?.visible);
        menuAPI.setTocSettingsEnabled(layout.toc?.visible);

        const textEditor = editorTextRef.current;
        const apparatusesEditor = editorApparatusesRef.current;
        const sidebar = sidebarRef.current;

        if (apparatusesEditor) {
            const notesIds = apparatusesEditor.notesAndCommentsIdsForApparatusIds(deletedApparatusIds);
            dispatch(deleteCommentWithIds(notesIds?.commentsIds));
            editorTextRef?.current?.removeNoteWithIds(notesIds?.notesIds);
        }

        const template = await documentAPI.getTemplate();
        dispatchEditor(setStyles(template.styles));

        textEditor?.updateLayout();
        main.loadApparatuses();

        const loadTocStructure = async () => {
            const content = await documentAPI.getMainText();
            sidebar?.updateTocStructure(content as JSONContent);
        };
        loadTocStructure();
    }, [main, documentAPI]);

    const onSaveToc = useCallback(
        (settings: TocSettings) => {
            electron.doc.setTocSettings(settings);
            const textEditor = editorTextRef.current;
            const sidebar = sidebarRef.current;
            textEditor?.updateLayout();
            const loadTocStructure = async () => {
                const content = await electron.doc.getMainText();
                sidebar?.updateTocStructure(content as JSONContent);
            };
            loadTocStructure();
        },
        [sidebarRef, editorTextRef]
    );

    const onContentUpdated = useCallback(
        (content: JSONContent) => {
            const sidebar = sidebarRef.current;
            sidebar?.updateTocStructure(content);
        },
        [sidebarRef]
    );

    useEffect(() => {
        const clean = window.electron.ipcRenderer.on(
            "toggle-view-apparatus",
            (_, apparatus: Apparatus) => {
                const id = apparatus.id;
                const visible = !apparatus.visible;
                dispatch(toggleVisibilityApparatus({ id, visible }));
                main.loadApparatuses();
            }
        );
        return () => clean();
    }, []);

    useEffect(() => {
        (async () => {
            const document = await documentAPI.getDocument();
            const documentId = document.id
            setDocumentId(documentId);
        })()
    }, [])

    return (
        <>
            <SidebarProvider className={sidebarClassName} defaultOpen={false}>
                <Sideview
                    ref={sidebarRef}
                    onClickBookmark={handleOnClickBookmark}
                    onClickHeadingIndex={handleOnClickHeadingIndex}
                    onScrollToSection={handleOnScrollToSection}
                    onDeleteBookmarksWithIds={deleteBookmarksWithIds}
                    onDeleteCommentsWithIds={deleteCommentsWithIds}
                    onClickComment={handleOnClickComment}
                />
                <SidebarInset className="overflow-hidden">
                    <Toolbar
                        ref={toolbarRef}
                        includeOptionals={toolbarAdditionalItems}
                        readingTypeAdd={main.readingTypeAdd}
                        readingTypeOm={main.readingTypeOm}
                        readingTypeTr={main.readingTypeTr}
                        readingTypeDel={main.readingTypeDel}
                        onSelectSiglum={handleOnSelectSiglum}
                        onShowSiglumSetup={handleOnShowSiglumSetup}
                        onHeadingChange={changeHeadingLevel}
                        onSetBody={setBody}
                        onCustomStyleChange={setCustomStyle}
                        onFontFamilyChange={handleOnFontFamilyChange}
                        onFontSizeChange={handleOnFontSizeChange}
                        onBoldChange={handleOnBoldChange}
                        onItalicChange={handleOnItalicChange}
                        onUnderlineChange={handleOnUnderlineChange}
                        onTextColorChange={handleOnTextColorChange}
                        onHighlightColorChange={handleOnHighlightColorChange}
                        onSetTextAlignment={handleOnToggleTextAlignment}
                        onSetLineSpacing={handleOnSetLineSpacing}
                        onSetListStyle={handleOnSetListStyle}
                        onSetSuperscript={handleOnSetSuperscript}
                        onSetSubscript={handleOnSetSubscript}
                        onIncreaseIndent={handleOnIncreaseIndent}
                        onDecreaseIndent={handleOnDecreaseIndent}
                        onShowCustomSpacing={handleOnShowCustomSpacing}
                        onShowResumeNumbering={handleOnShowResumeNumbering}
                        continuePreviousNumbering={handleOnContinuePreviousNumbering}
                        headingEnabled={headingEnabled}
                        onUndo={handleOnUndo}
                        onRedo={handleOnRedo}
                        onAddBookmark={addBookmark}
                        onAddComment={addComment}
                        onSetTextNoteToApparatusId={onSetTextNoteToApparatusId}
                        showCustomizeToolbar={handleOnShowCustomizeToolbar}
                        showAddSymbol={handleOnShowAddSymbol}
                        showLinkConfig={handleOnShowLinkConfig}
                        removeLink={handleRemoveLink}
                        onAddReadingSeparator={addReadingSeparator}
                        onAddReadingTypeAdd={addReadingTypeAdd}
                        onAddReadingTypeOm={addReadingTypeOm}
                        onAddReadingTypeTr={addReadingTypeTr}
                        onAddReadingTypeDel={addReadingTypeDel}
                        onSearchClick={handleOnSearchClick}
                    />
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel
                            minSize={30}
                            defaultSize={state.printPreviewVisible ? 40 : 55}
                        >
                            <Content
                                ref={editorTextRef}
                                zoom={_zoomRatio}
                                keyboardShortcuts={keyboardShortcuts}
                                linkActive={linkActive}
                                onFocus={handleOnFocusTextEditor}
                                onRegisterBookmark={handleOnRegisterBookmark}
                                scrollAndEditComment={scrollAndEditComment}
                                onClickNoteWithId={clickNoteWithId}
                                onClickCommentWithId={onClickCommentWithId}
                                onClickBookmarkWithId={onClickBookmarkWithId}
                                onSelectText={handleOnSelectText}
                                onTextNoteCreated={onTextNoteCreated}
                                onTextNotesChanged={onTextNotesChanged}
                                onTextNoteWithIdsDeleted={handleOnTextNoteWithIdsDeleted}
                                onInsertBibliography={handleOnInsertBibliography}
                                onContentUpdated={onContentUpdated}
                                onCurrentSection={handleOnCurrentSection}
                            />
                        </ResizablePanel>
                        {main?.visibleApparatuses?.length > 0 &&
                            main?.documentApparatuses?.length > 0 ? (
                            <>
                                <ResizableHandle />
                                <ResizablePanel
                                    minSize={20}
                                    defaultSize={state.printPreviewVisible ? 35 : 45}
                                >
                                    <Apparatuses
                                        ref={editorApparatusesRef}
                                        keyboardShortcuts={keyboardShortcuts}
                                        lemmaHighlightColor={lemmaHighlightColor}
                                        readingTypeAndSeparatorHighlightColor={
                                            readingTypeAndSeparatorHighlightColor
                                        }
                                        commentHighlightColor={commentHighlightColor}
                                        siglaHighlightColor={siglaHighlightColor}
                                        onFocus={handleOnFocusApparatusEditor}
                                        onDeleteApparatusWithId={handleOnDeleteApparatusWithId}
                                        onDeleteApparatusesWithIds={handleOnDeleteApparatusesWithIds}
                                        onClickLemmaWithId={handleOnClickLemmaWithId}
                                        onCommentCreated={scrollAndEditComment}
                                        onClickCommentWithId={onClickCommentWithId}
                                        onCommentWithIdsDeleted={handleOnCommentWithIdsDeleted}
                                    />
                                </ResizablePanel>
                            </>
                        ) : null}
                        {state.printPreviewVisible ? (
                            <>
                                <ResizableHandle />
                                <ResizablePanel
                                    defaultSize={25}
                                    minSize={25}
                                    collapsible={true}
                                >
                                    <Preview />
                                </ResizablePanel>
                            </>
                        ) : null}
                    </ResizablePanelGroup>
                    {main.statusBarVisible && (
                        <Footer
                            ref={footerRef}
                            statusBarConfig={statusBarConfig}
                            zoom={zoom}
                            onZoomChange={handleZoomChange}
                        />
                    )}
                </SidebarInset>
            </SidebarProvider>

            <OptionsDialogs
                ref={optionsDialogsRef}
                commentCategories={commentCategories}
                bookmarkCategories={bookmarkCategories}
                onSelectCommentCategoryId={addComment}
                onSelectBookmarkCategoryId={addBookmark}
            />

            <SetupDialogs
                onSelectTemplate={onSelectTemplate}
                onChangeTemplate={onChangeTemplate}
                onSaveTemplate={onSaveTemplate}
                onSaveLayout={onSaveLayout}
                onSaveToc={onSaveToc}
                storeStatusBarConfig={storeStatusBarConfig}
                onApplyReferenceFormat={handleOnApplyReferenceFormat}
                onSaveMetadata={onSaveMetadata}
                onSaveStyles={onSaveStyles}
            />

            <InsertDialogs
                readingTypes={main.readingTypes}
                onInsertSiglum={handleOnSelectSiglum}
                onAddSymbol={handleAddSymbol}
                onInsertCustomSpacing={handleOnInsertLineSpacing}
                onResumeNumbering={handleOnSetListNumbering}
                onInsertCitation={handleInsertCitation}
                onInsertReadingTypeAdd={insertReadingTypeAdd}
                onInsertReadingTypeOm={insertReadingTypeOm}
                onInsertReadingTypeTr={insertReadingTypeTr}
                onInsertReadingTypeDel={insertReadingTypeDel}
                onInsertReadingTypeCustom={insertReadingTypeCustom}
                onInsertLink={handleInsertLink}
                onRemoveLink={handleRemoveLink}
            />

            <CustomizeToolbarModal
                existingToolbarItems={toolbarAdditionalItems}
                isOpen={isCustomizeToolbarOpen}
                onCancel={handleCancelToolbar}
                onSaveToolbarOptions={handleSaveToolbarOptions}
            />

            <NotificationPanel
                open={isNotificationPanelOpen}
                notifications={notifications}
                onOpenChange={setIsNotificationPanelOpen}
                loading={isLoadingNotifications}
                loadingMore={isLoadingMoreNotifications}
                hasMore={hasMoreNotifications}
                onLoadMore={handleLoadMoreNotifications}
                onMarkAsViewed={handleMarkAsViewed}
                onMarkAllAsRead={handleMarkAllAsRead}
            />

            <AccountPanelView
                open={isAccountPanelOpen}
                onOpenChange={setIsAccountPanelOpen}
            />

            {documentId ? <Chat documentId={documentId} /> : null}
        </>
    );
};
