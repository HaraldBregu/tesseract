import { FIND_MAX_DEPTH, REPLACE_MAX_DEPTH } from "@/utils/constants";
import { EditorAction } from "./actions";
import { defaultReferenceFormatConfigs, EditorContextState, initialSearchCriteria, stateHideAllDialogsState } from "./state";


export const reducer = (
    state: EditorContextState,
    action: EditorAction): EditorContextState => {
    switch (action.type) {

        case 'INSERT_APPARATUS_NOTE': {
            const apparatusNote = action.payload;
            const apparatusNotes = state.apparatusNotes || [];
            const newApparatusNotes = [
                ...apparatusNotes,
                apparatusNote,
            ];

            return {
                ...state,
                apparatusNotes: newApparatusNotes
            };
        }
        case 'INSERT_NOTES': {
            return {
                ...state,
                apparatusNotes: action.payload
            };
        }
        case 'UPDATE_NOTES_ENTRY_NODES': {
            const data = action.payload;
            const apparatusNotes = state.apparatusNotes;
            const byId = new Map(data.map(item => [item.noteId, item] as const));
            const newApparatusNotes = apparatusNotes.map(note => {
                const dataItem = byId.get(note.noteId);
                return dataItem ? ({
                    ...note,
                    apparatusId: dataItem.apparatusId,
                    entryNodes: dataItem.entryNodes.map(node => (typeof node.toJSON === "function" ? node.toJSON() : node)),
                } satisfies ApparatusNote) : ({
                    ...note,
                } satisfies ApparatusNote)
            });

            return {
                ...state,
                apparatusNotes: newApparatusNotes
            };
        }
        case 'DELETE_NOTE_WITH_ID': {
            return {
                ...state,
                apparatusNotes: state.apparatusNotes.filter(note => note.noteId !== action.payload)
            };
        }

        case 'SET_COMMENT_CATEGORIES_DIALOG_VISIBLE': {
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                commentCategoriesDialogVisible: action.payload
            };
        }
        case 'SET_BOOKMARK_CATEGORIES_DIALOG_VISIBLE': {
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                bookmarkCategoriesDialogVisible: action.payload
            };
        }

        case 'SET_READING_TYPE_ENABLED': {
            return {
                ...state,
                readingTypeEnabled: action.payload
            };
        }
        case 'SET_READING_SEPARATOR_ENABLED': {
            return {
                ...state,
                readingSeparatorEnabled: action.payload
            };
        }

        case 'SET_TEMPLATE':
            return {
                ...state,
                template: action.payload
            };
        case 'SET_STYLES':
            return {
                ...state,
                styles: action.payload
            };
        case 'SET_LAYOUT':
            return {
                ...state,
                template: {
                    ...state.template,
                    layout: action.payload
                } as Template
            };
        case 'SET_PAGE_SETUP':
            return {
                ...state,
                template: {
                    ...state.template,
                    pageSetup: action.payload
                } as Template
            };
        case 'SET_SORT':
            return {
                ...state,
                template: {
                    ...state.template,
                    sort: action.payload
                } as Template
            };
        case 'TOGGLE_TOC_VISIBILITY':
            return {
                ...state,
                template: {
                    ...state.template,
                    paratextual: {
                        ...state.template?.paratextual,
                        tocSettings: {
                            ...state.template?.paratextual.tocSettings,
                            show: !state.template?.paratextual.tocSettings.show
                        }
                    }
                } as Template
            };
        case 'SET_ZOOM_RATIO':
            return {
                ...state,
                zoomRatio: action.payload
            };
        case 'SET_TOOLBAR_VISIBLE':
            return {
                ...state,
                toolbarVisible: action.payload
            };
        case 'SET_STATUS_BAR_VISIBLE':
            return {
                ...state,
                statusBarVisible: action.payload
            };
        case 'SET_ACTIVE_EDITOR':
            return {
                ...state,
                activeEditor: action.payload
            };
        case 'RESET_EDITOR':
            return { ...state, activeEditor: 0 };
        case 'SET_EDITOR_FOCUS':
            return { ...state, isFocused: action.payload }
        case 'SET_SELECTED_SIDEVIEW_TAB_INDEX':
            return { ...state, selectedSideviewTabIndex: action.payload };
        case 'SET_CHARACTERS':
            return { ...state, characters: action.payload };
        case 'SET_WORDS':
            return { ...state, words: action.payload };

        // #region Siglum
        case 'SET_SIGLUM_ENABLED':
            if (action.payload === state.siglumEnabled) return state
            return { ...state, siglumEnabled: action.payload }
        case 'SET_SIGLUM_LIST':
            return { ...state, siglumList: action.payload };
        case 'ADD_SIGLUM_LIST_FROM_FILE': {
            const siglumListFromFile = action.payload
            const siglumList = state.siglumList || []
            return {
                ...state,
                siglumList: [
                    ...siglumList,
                    ...siglumListFromFile.map(item => ({
                        ...item,
                        id: crypto.randomUUID(),
                    })),
                ].sort((a, b) => a.value.title.localeCompare(b.value.title))
            };
        }
        case 'DUPLICATE_SIGLUM_LIST_FROM_FILE': {
            const siglumList = state.siglumList || []
            const siglumListFromFile = action.payload

            const matchingItems = siglumListFromFile
                .filter(fileItem => siglumList.some(existingItem => existingItem.value.title === fileItem.value.title))
                .map(data => ({
                    ...data,
                    id: crypto.randomUUID(),
                })) satisfies Siglum[] as Siglum[]

            const newSiglumList: Siglum[] = []
            matchingItems.forEach(item => {
                const siglumPattern = new RegExp(`^${item.value.title}_\\d+$`);
                const matchingSiglum = siglumList.filter(siglum => siglumPattern.test(siglum.value.title));
                const lastSortedNumber = matchingSiglum.length + 1
                const newSiglumValue = `${item.value.title}_${lastSortedNumber}`

                newSiglumList.push({
                    ...item,
                    value: {
                        ...item.value,
                        title: newSiglumValue,
                        content: {
                            "type": "doc",
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "marks": [],
                                            "text": newSiglumValue
                                        }
                                    ]
                                }
                            ]
                        },
                        contentHtml: `<p class="!p-0 !m-0">${newSiglumValue}</p>`,
                    },
                    manuscripts: item.manuscripts,
                    description: item.description,
                })
            })

            const unmatchedItems = siglumListFromFile
                .filter(item => !matchingItems.some(matchingItem => matchingItem.value.title === item.value.title))
                .map(data => ({
                    ...data,
                    id: crypto.randomUUID(),
                })) satisfies Siglum[] as Siglum[]

            const newData = [
                ...siglumList,
                ...newSiglumList,
                ...unmatchedItems,
            ].sort((a, b) => a.value.title.localeCompare(b.value.title)) satisfies Siglum[] as Siglum[]

            return {
                ...state,
                siglumList: newData,
            }
        }
        case 'REPLACE_SIGLUM_LIST_FROM_FILE': {
            const siglumList = state.siglumList || []
            const siglumListFromFile = action.payload

            const newSiglumList = siglumList
                .map(item => {
                    const siglumListFromFileItem = siglumListFromFile.find(siglum => siglum.value.title === item.value.title)
                    return siglumListFromFileItem ?? item
                })
                .map(item => ({
                    ...item,
                    id: crypto.randomUUID(),
                })) satisfies Siglum[] as Siglum[]

            const unmatchedItems = siglumListFromFile
                .filter(item => !newSiglumList.some(siglum => siglum.value.title === item.value.title))
                .map(data => ({
                    ...data,
                    id: crypto.randomUUID(),
                })) satisfies Siglum[] as Siglum[]

            const newData = [
                ...newSiglumList,
                ...unmatchedItems,
            ].sort((a, b) => a.value.title.localeCompare(b.value.title)) satisfies Siglum[] as Siglum[]

            return {
                ...state,
                siglumList: newData,
            }
        }
        case 'ADD_SIGLUM': {
            const siglumList = state.siglumList || [];
            return {
                ...state, siglumList: [
                    ...siglumList,
                    action.payload,
                ]
            };
        }
        case 'UPDATE_SIGLUM': {
            const _siglumList = state.siglumList || [];
            const siglumList = _siglumList.map(siglum =>
                siglum.id === action.payload.id
                    ? { ...siglum, ...action.payload }
                    : siglum
            )

            return {
                ...state,
                siglumList: siglumList
            }
        }
        case 'DUPLICATE_SIGLUM': {
            const siglum = action.payload;
            const siglumList = state.siglumList || [];

            const siglumPattern = new RegExp(`^${siglum.value.title}_\\d+$`);
            const matchingSiglumPattern = siglumList.filter(s => siglumPattern.test(s.value.title));

            const lastSortedNumber = matchingSiglumPattern.length + 1;
            const newSiglumValue = `${siglum.value.title}_${lastSortedNumber}`;

            const value = {
                ...siglum.value,
                title: newSiglumValue,
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "marks": [],
                                    "text": newSiglumValue
                                }
                            ]
                        }
                    ]
                },
                contentHtml: `<p class="!p-0 !m-0">${newSiglumValue}</p>`,
            } satisfies SiglumValue

            const hasSameSiglum = siglumList.some(item => item.value.title === siglum.value.title);

            const updatedSiglum = hasSameSiglum ? {
                ...siglum,
                id: crypto.randomUUID(),
                value,
            } : {
                ...siglum,
                id: crypto.randomUUID(),
            };

            // Find the index of the original element
            const originalIndex = siglumList.findIndex(item => item.id === siglum.id);

            // Create a copy of the list and insert the duplicate right after the original
            const updatedSiglumList = [...siglumList];

            if (originalIndex !== -1) {
                // Insert the new siglum right after the original
                updatedSiglumList.splice(originalIndex + 1, 0, updatedSiglum);
            } else {
                // If the original is not found, add to the end (fallback)
                updatedSiglumList.push(updatedSiglum);
            }

            return {
                ...state,
                siglumList: updatedSiglumList
            };
        }
        case 'TOGGLE_INSERT_SIGLUM_DIALOG_VISIBLE': {
            const siglumList = state.siglumList || [];
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                insertSiglumDialogVisible: siglumList.length > 0,
                siglumSetupDialogVisible: siglumList.length === 0,
            };
        }
        case 'SET_INSERT_SIGLUM_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                insertSiglumDialogVisible: action.payload
            };
        case 'SET_SIGLUM_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                siglumSetupDialogVisible: action.payload
            };
        case 'DELETE_SIGLUM': {
            const siglumList = state.siglumList || [];
            return { ...state, siglumList: siglumList.filter(siglum => siglum.id !== action.payload.id) };
        }
        // #endregion
        case 'SET_FONT_FAMILY_LIST':
            return { ...state, fontFamilyList: action.payload };
        case 'SET_FONT_FAMILY_SYMBOLS':
            return { ...state, fontFamilySymbols: action.payload };
        case 'SET_ADD_SYMBOL_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                addSymbolVisible: action.payload
            };
        case 'SET_LINE_NUMBER_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                lineNumberSetupDialogVisible: action.payload
            };
        case 'SET_PAGE_NUMBER_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                pageNumberSetupDialogVisible: action.payload
            };
        case 'SET_SECTION_STYLE_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                sectionStyleSetupDialogVisible: action.payload
            };
        case 'SET_HEADER_FOOTER_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                headerFooterSetupDialogVisible: action.payload.visible,
                headerFooterInitialTab: action.payload.initialTab || "header"
            };
        case 'SET_PAGE_SETUP_OPT_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                pageSetupOptDialogVisible: action.payload
            };
        case 'SET_TOC_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                tocSetupDialogVisible: action.payload
            };
        case 'SET_REFERENCE_FORMAT_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                referenceFormatVisible: action.payload
            };
        case 'SET_PRINT_PREVIEW_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                printPreviewVisible: action.payload
            };
        case 'TOGGLE_PRINT_PREVIEW_VISIBLE':
            return { ...state, printPreviewVisible: !state.printPreviewVisible };
        case 'SET_REFERENCE_FORMAT': {
            const payload = action.payload || {};
            const mergedFormat = { ...defaultReferenceFormatConfigs, ...payload };

            // Ensure all separator and reading type objects have the isCustom property
            const separatorKeys: SeparatorKeys[] = ["lemma_separator", "from_to_separator", "readings_separator", "apparatus_separator"];
            const readingKeys: ReadingKeys[] = ["add_reading_type", "om_reading_type", "tr_reading_type", "del_reading_type"];

            separatorKeys.forEach(key => {
                if (mergedFormat[key] && typeof mergedFormat[key] === 'object') {
                    const separator = mergedFormat[key];
                    mergedFormat[key] = {
                        ...separator,
                        isCustom: separator.isCustom ?? false,
                        value: separator.value ?? "",
                        bold: separator.bold ?? false,
                        italic: separator.italic ?? false,
                        underline: separator.underline ?? false
                    };
                }
            });

            readingKeys.forEach(key => {
                if (mergedFormat[key] && typeof mergedFormat[key] === 'object') {
                    const readingType = mergedFormat[key];
                    mergedFormat[key] = {
                        ...readingType,
                        isCustom: readingType.isCustom ?? false,
                        value: readingType.value ?? "",
                        bold: readingType.bold ?? false,
                        italic: readingType.italic ?? false,
                        underline: readingType.underline ?? false
                    };
                }
            });

            return {
                ...state, referenceFormat: mergedFormat
            };
        }
        case 'SET_BOOKMARK_HIGHLIGHTED':
            return { ...state, bookmarkHighlighted: action.payload };
        case 'SET_COMMENT_HIGHLIGHTED':
            return { ...state, commentHighlighted: action.payload };
        case 'TOGGLE_TEXT_NOTE_HIGHLIGHTED':
            return { ...state, textNoteHighlighted: !state.textNoteHighlighted };
        case 'TOGGLE_BOOKMARK_HIGHLIGHTED':
            return { ...state, bookmarkHighlighted: !state.bookmarkHighlighted };
        case 'TOGGLE_COMMENT_HIGHLIGHTED':
            return { ...state, commentHighlighted: !state.commentHighlighted };
        case 'SET_LINK_CONFIG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                linkConfigVisible: action.payload
            };
        case 'SET_LINK_ENABLED':
            if (action.payload === state.linkEnabled)
                return state
            return {
                ...state,
                linkEnabled: action.payload
            };
        case 'SET_METADATA_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                metadataSetupDialogVisible: action.payload
            };
        case 'SET_CUSTOMIZE_STATUS_BAR_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                customizeStatusBarVisible: action.payload
            };
        case 'SET_SAVE_TEMPLATE_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                saveTemplateDialogVisible: action.payload
            };
        case 'SET_CHOOSE_TEMPLATE_MODAL_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                chooseTemplateModalVisible: action.payload,
            };
        case 'SET_LAYOUT_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                layoutSetupDialogVisible: action.payload
            };
        case 'SET_CUSTOM_SPACING_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                customSpacingDialogVisible: action.payload
            };
        case 'SET_RESUME_NUMBERING_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                resumeNumberingDialogVisible: action.payload
            };
        case 'SET_SUGGESTED_START_NUMBER':
            return {
                ...state,
                suggestedStartNumber: action.payload
            };
        case 'SET_DELETE_APPARATUS_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                deleteApparatusDialogVisible: action.payload
            };
        case 'SET_DELETE_APPARATUS_ENTRY_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                deleteApparatusEnytryDialogVisible: action.payload
            };
        case 'SET_CHANGE_TEMPLATE_MODAL_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                changeTemplateModalVisible: action.payload
            }
        case 'SET_CONFIRM_CHANGE_TEMPLATE_MODAL':
            return {
                ...state,
                confirmChangeTemplateModal: {
                    visible: action.payload.visible,
                    text: action.payload.text,
                    onConfirm: action.payload.onConfirm,
                }
            }

        // #region Toolbar State

        case 'SET_TOOLBAR_STATE_FROM_APPARATUS_TEXT_STYLE': {
            const { fontFamily, fontSize, fontWeight, fontStyle, color, highlightColor, bold, italic, underline, strikethrough, superscript, subscript, link } = action.payload;
            return {
                ...state,
                toolbarState: {
                    ...state.toolbarState,
                    headingLevel: 0,
                    styleId: undefined,
                    fontFamily,
                    fontSize,
                    fontWeight,
                    fontStyle,
                    color,
                    highlightColor,
                    bold,
                    italic,
                    underline,
                    strikethrough,
                    superscript,
                    subscript,
                    link,
                } satisfies ToolbarState
            }
        }
        case 'SET_TOOLBAR_STATE_FROM_MAIN_TEXT_STYLE': {
            const { headingLevel, styleId, fontFamily, fontSize, fontWeight, fontStyle, color, highlightColor, bold, italic, underline, strikethrough, superscript, subscript, alignment, listStyle, spacing, link } = action.payload;
            return {
                ...state,
                toolbarState: {
                    ...state.toolbarState,
                    headingLevel,
                    styleId,
                    fontFamily,
                    fontSize,
                    fontWeight,
                    fontStyle,
                    color,
                    highlightColor,
                    bold,
                    italic,
                    underline,
                    strikethrough,
                    superscript,
                    subscript,
                    alignment,
                    listStyle,
                    spacing,
                    link,
                } satisfies ToolbarState
            }
        }

        case 'SET_TOOLBAR_STATE':
            if (JSON.stringify(state.toolbarState) === JSON.stringify(action.payload)) return state;
            return { ...state, toolbarState: action.payload }
        case 'SET_TOOLBAR_STATE_FONT_FAMILY':
            if (state.toolbarState.fontFamily === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, fontFamily: action.payload } };
        case 'SET_TOOLBAR_STATE_FONT_SIZE':
            if (state.toolbarState.fontSize === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, fontSize: action.payload } };
        case 'SET_TOOLBAR_STATE_SUPERSCRIPT':
            if (state.toolbarState.superscript === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, superscript: action.payload } };
        case 'SET_TOOLBAR_STATE_SUBSCRIPT':
            if (state.toolbarState.subscript === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, subscript: action.payload } };
        case 'SET_TOOLBAR_STATE_BOLD':
            if (state.toolbarState.bold === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, bold: action.payload } };
        case 'SET_TOOLBAR_STATE_ITALIC':
            if (state.toolbarState.italic === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, italic: action.payload } };
        case 'SET_TOOLBAR_STATE_UNDERLINE':
            if (state.toolbarState.underline === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, underline: action.payload } };
        case 'SET_TOOLBAR_STATE_STRIKETHROUGH':
            if (state.toolbarState.strikethrough === action.payload) return state
            return { ...state, toolbarState: { ...state.toolbarState, strikethrough: action.payload } };
        case 'SET_TOOLBAR_STATE_ALIGNMENT':
            if (state.toolbarState.alignment === action.payload) return state;
            return { ...state, toolbarState: { ...state.toolbarState, alignment: action.payload } };
        case 'TOGGLE_TOOLBAR_STATE_ALIGNMENT':
            const alignment = action.payload === state.toolbarState.alignment ? 'left' : action.payload;
            return { ...state, toolbarState: { ...state.toolbarState, alignment } };

        // #endregion

        // #region Bibliography
        case 'SET_BIBLIOGRAPHY_LIST': {
            return {
                ...state,
                bibliographies: action.payload || [],
            };
        }
        case 'SET_BIBLIOGRAPHY_SETUP_VISIBLE':
            return {
                ...state,
                bibliographySetupDialogVisible: action.payload
            }
        case 'ADD_BIBLIOGRAPHY':
            return {
                ...state,
                bibliographies: [
                    ...state.bibliographies || [],
                    {
                        ...action.payload,
                        id: crypto.randomUUID(),
                    } satisfies Bibliography
                ]
            };
        case 'UPDATE_BIBLIOGRAPHY': {
            const bibliographyList = state.bibliographies?.map(bib => {
                if (bib.id === action.payload.id) {
                    return action.payload;
                }
                return bib
            })

            return {
                ...state,
                bibliographies: bibliographyList || []
            }
        }
        case 'DUPLICATE_BIBLIOGRAPHY': {
            const bib = action.payload
            const bibliographyList = state.bibliographies || []

            const hasSameBib = bibliographyList.some(item => item.name === bib.name)
            const bibPattern = new RegExp(`^${bib.name}_\\d+$`);
            const matchingBibs = bibliographyList.filter(bib => bibPattern.test(bib.name));
            const lastSortedNumber = matchingBibs.length + 1
            const newBibName = hasSameBib ? `${bib.name}_${lastSortedNumber}` : bib.name;

            const newBib: Bibliography = {
                citationStyle: bib.citationStyle,
                id: crypto.randomUUID(),
                name: newBibName,
                references: bib.references.map(ref => ({ ...ref, id: crypto.randomUUID() }))
            }

            return {
                ...state,
                bibliographies: [
                    ...state.bibliographies || [],
                    newBib
                ]
            };
        }
        case 'REPLACE_BIBLIOGRAPHY': {
            const bibliographyList = state.bibliographies?.map(bib => {
                if (bib.name === action.payload.name) {
                    return {
                        ...action.payload,
                        references: action.payload.references.map(ref => ({ ...ref, id: crypto.randomUUID() })),
                        id: crypto.randomUUID()
                    };
                }
                return bib
            })

            return {
                ...state,
                bibliographies: bibliographyList || []
            }
        }
        case 'DELETE_BIBLIOGRAPHY': {
            return {
                ...state,
                bibliographies: state.bibliographies?.filter(bib => bib.id !== action.payload) || []
            };
        }
        case 'SET_IS_BIBLIOGRAPHY_SECTION':
            if (action.payload === state.isBibliographySection) return state
            return {
                ...state,
                isBibliographySection: action.payload
            }
        case 'SET_CITATION_SELECTED_BIBLIOGRAPHY_ID':
            return {
                ...state,
                citationSelectedBibliographyId: action.payload
            }
        // #endregion

        // #region Citation
        case 'SET_CITATION_INSERT_DIALOG_VISIBLE':
            return {
                ...state,
                citationInsertDialogVisible: state.bibliographies && state?.bibliographies.length > 0 ? action.payload : state.citationInsertDialogVisible,
                bibliographySetupDialogVisible: state.bibliographies && state?.bibliographies.length === 0 ? action.payload : state.bibliographySetupDialogVisible
            }
        case 'SET_CAN_INSERT_CITATION':
            if (action.payload === state.canInsertCitation) return state
            return {
                ...state,
                canInsertCitation: action.payload
            }
        // #endregion

        // #region Notes
        case 'SET_NOTES_ENABLED':
            if (action.payload === state.notesEnabled) return state
            return { ...state, notesEnabled: action.payload }
        // #endregion

        // #region Insert Symbol
        case 'SET_CAN_INSERT_SYMBOL':
            if (action.payload === state.canInsertSymbol) return state
            return { ...state, canInsertSymbol: action.payload }
        // #endregion

        // #region Bookmark
        case 'SET_BOOKMARK_ENABLED':
            if (action.payload === state.bookmarkEnabled) return state
            return { ...state, bookmarkEnabled: action.payload }
        // #endregion

        // #region Comment
        case 'SET_COMMENT_ENABLED':
            if (action.payload === state.commentEnabled) return state
            return { ...state, commentEnabled: action.payload }
        // #endregion

        // #region PrintSetup
        case 'SET_PRINT_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                printSetupDialogVisible: action.payload
            }
        case 'SET_PRINT_OPTIONS':
            return {
                ...state,
                printOptions: action.payload
            }
        // #endregion

        // #region ExportTeiSetup
        case 'SET_EXPORT_TEI_SETUP_DIALOG_VISIBLE':
            return {
                ...state,
                exportTeiSetupDialogVisible: action.payload
            }
        // #endregion

        // #region InsertCustomReadingType
        case 'SET_INSERT_CUSTOM_READING_TYPE_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                insertCustomReadingTypeDialogVisible: action.payload,
            }
        // #endregion

        // #region InsertReadingType
        case 'SET_INSERT_READING_TYPE_DIALOG_VISIBLE':
            return {
                ...state,
                ...stateHideAllDialogsState(state),
                insertReadingTypeDialogVisible: action.payload,
            }
        // #endregion

        // #region Find and Replace
        case 'SET_SEARCH_CRITERIA': {
            state.searchCriteria = action.payload;
            let searchHistory = state.searchHistory;

            if (state.searchCriteria.searchTerm !== '') {
                const searchTermIndex = state.searchHistory.indexOf(state.searchCriteria.searchTerm);

                if (searchTermIndex !== -1) {
                    searchHistory.splice(searchTermIndex, 1);
                }

                searchHistory.unshift(state.searchCriteria.searchTerm);

                // Enforce max depth
                if (searchHistory.length > FIND_MAX_DEPTH) {
                    searchHistory.pop();
                }
            }

            return {
                ...state,
                searchCriteria: action.payload,
                searchHistory: [...searchHistory],
                replacedCount: 0,
                disableReplaceAction: false,
            }
        }
        case 'SET_REPLACE_HISTORY': {
            const replace = action.payload;

            let replaceHistory = state.replaceHistory;
            if (replace !== '') {
                const replaceIndex = replaceHistory.indexOf(replace);

                if (replaceIndex !== -1) {
                    replaceHistory.splice(replaceIndex, 1);
                }

                replaceHistory.unshift(replace);

                // Enforce max depth
                if (replaceHistory.length > REPLACE_MAX_DEPTH) {
                    replaceHistory.pop();
                }
            }

            return {
                ...state,
                replaceHistory: [...replaceHistory]
            }
        }
        case 'RESET_SEARCH_CRITERIA':
            return {
                ...state,
                searchCriteria: initialSearchCriteria,
                totalCriticalMatches: 0,
                totalApparatusMatches: 0,
                totalMatches: 0,
                currentSearchIndex: null,
                currentCriticalSearchIndex: null,
                currentApparatusSearchIndex: null,
                replacedCount: 0,
                disableReplaceAction: false,
            }
        case 'SET_TOTAL_CRITICAL_MATCHES':
            return {
                ...state,
                totalCriticalMatches: action.payload,
                totalMatches: action.payload + state.totalApparatusMatches,
            }
        case 'SET_TOTAL_APPARATUS_MATCHES':
            return {
                ...state,
                totalApparatusMatches: action.payload,
                totalMatches: state.totalCriticalMatches + action.payload
            }
        case 'TRIGGER_NEXT_SEARCH': {
            if (state.currentSearchIndex === null)
                return state;

            let currentSearchIndex = state.currentSearchIndex + 1;
            if (currentSearchIndex >= state.totalMatches) {
                currentSearchIndex = 0;
            }
            let apparatusSearchIndex: number | null = null;
            let criticalSearchIndex: number | null = currentSearchIndex !== null && currentSearchIndex < state.totalCriticalMatches ? currentSearchIndex : null

            if (currentSearchIndex !== null && currentSearchIndex >= state.totalCriticalMatches && currentSearchIndex - state.totalCriticalMatches < state.totalApparatusMatches) {
                apparatusSearchIndex = currentSearchIndex - state.totalCriticalMatches;
            }

            return {
                ...state,
                currentSearchIndex,
                currentCriticalSearchIndex: criticalSearchIndex,
                currentApparatusSearchIndex: apparatusSearchIndex,
            }
        }
        case 'TRIGGER_PREVIOUS_SEARCH': {
            if (state.currentSearchIndex === null)
                return state;

            let currentSearchIndex = state.currentSearchIndex - 1;
            if (currentSearchIndex < 0) {
                currentSearchIndex = state.totalMatches - 1;
            }
            let apparatusSearchIndex: number | null = null;
            let criticalSearchIndex: number | null = currentSearchIndex !== null && currentSearchIndex < state.totalCriticalMatches ? currentSearchIndex : null

            if (currentSearchIndex !== null && currentSearchIndex >= state.totalCriticalMatches && currentSearchIndex - state.totalCriticalMatches < state.totalApparatusMatches) {
                apparatusSearchIndex = currentSearchIndex - state.totalCriticalMatches;
            }

            return {
                ...state,
                currentSearchIndex,
                currentCriticalSearchIndex: criticalSearchIndex,
                currentApparatusSearchIndex: apparatusSearchIndex,
            }
        }
        case 'SET_CURRENT_SEARCH_INDEX': {
            const currentSearchIndex = action.payload;
            let apparatusSearchIndex: number | null = null;
            let criticalSearchIndex: number | null = currentSearchIndex !== null && currentSearchIndex < state.totalCriticalMatches ? currentSearchIndex : null

            if (currentSearchIndex !== null && currentSearchIndex >= state.totalCriticalMatches && currentSearchIndex - state.totalCriticalMatches < state.totalApparatusMatches) {
                apparatusSearchIndex = currentSearchIndex - state.totalCriticalMatches;
            }

            return {
                ...state,
                currentSearchIndex,
                currentCriticalSearchIndex: criticalSearchIndex,
                currentApparatusSearchIndex: apparatusSearchIndex,
            }
        }
        case 'RESET_TOTAL_MATCHES':
            return {
                ...state,
                totalMatches: action.payload,
                totalApparatusMatches: 0,
                totalCriticalMatches: 0
            }
        case 'SET_DISABLE_REPLACE_ACTION':
            if (action.payload === state.disableReplaceAction) return state
            return { ...state, disableReplaceAction: action.payload }
        case 'SET_CRITICAL_REPLACE_MODE':
            if (action.payload === state.isCriticalReplacing) return state
            return { ...state, isCriticalReplacing: action.payload }
        case 'SET_APPARATUS_REPLACE_MODE':
            if (action.payload === state.isApparatusReplacing) return state
            return { ...state, isApparatusReplacing: action.payload }
        case 'INCREASE_REPLACED_COUNT':
            if (state.totalMatches <= state.replacedCount) return state
            const replacedCount = state.replacedCount + 1;

            return {
                ...state,
                replacedCount,
                disableReplaceAction: replacedCount >= state.totalMatches
            }
        case 'SET_REPLACED_COUNT':
            return {
                ...state,
                replacedCount: action.payload,
                disableReplaceAction: action.payload >= state.totalMatches
            }
        case 'RESET_REPLACED_COUNT':
            return {
                ...state,
                replacedCount: 0
            }
        // #endregion

        case 'SET_STYLE_SELECT_OPEN':
            return { ...state, styleSelectOpen: action.payload }

        case 'SET_FONT_FAMILY_SELECT_OPEN':
            return { ...state, fontFamilySelectOpen: action.payload }

        case 'SET_FONT_SIZE_SELECT_OPEN':
            return { ...state, fontSizeSelectOpen: action.payload }

        case 'CLOSE_ALL_SELECTS':
            return {
                ...state,
                styleSelectOpen: false,
                fontFamilySelectOpen: false,
                fontSizeSelectOpen: false
            }
        case 'TOGGLE_SHOW_NON_PRINTING_CHARACTERS':
            return {
                ...state,
                showNonPrintingCharacters: !state.showNonPrintingCharacters
            }
        case 'OPEN_CHAT':
            return {
                ...state,
                chatState: "OPENED",
                chatTextReference: action.payload || null,
            }
        case 'SET_CHAT_REFERENCE':
            return {
                ...state,
                chatTextReference: action.payload,
            }
        case 'CLOSE_CHAT':
            return {
                ...state,
                chatState: "CLOSED",
            }
        case 'MINIMIZE_CHAT':
            return {
                ...state,
                chatState: "MINIMIZED",
            }

        default:
            return state;
    }
}