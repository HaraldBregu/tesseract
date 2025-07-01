import { EditorAction } from "./actions";
import { EditorContextState } from "./state";
import { v4 as uuidv4 } from 'uuid';

export const reducer = (
    state: EditorContextState,
    action: EditorAction): EditorContextState => {
    switch (action.type) {
        case 'TEST':
            return {
                ...state,
                activeEditor: state.activeEditor + 1
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
        case 'SET_SIGLUM_LIST':
            return { ...state, siglumList: action.payload };
        case 'ADD_SIGLUM_LIST_FROM_FILE': {
            const siglumListFromFile = action.payload
            const siglumList = state.siglumList

            return {
                ...state,
                siglumList: [
                    ...siglumList,
                    ...siglumListFromFile,
                ].sort((a, b) => a.siglum.value.localeCompare(b.siglum.value))
            };
        }
        case 'DUPLICATE_SIGLUM_LIST_FROM_FILE': {
            const siglumList = state.siglumList
            const siglumListFromFile = action.payload

            const matchingItems = siglumListFromFile.filter(fileItem =>
                siglumList.some(existingItem => existingItem.siglum.value === fileItem.siglum.value)
            );

            const newSiglumList: Siglum[] = []
            matchingItems.forEach(item => {
                const siglumPattern = new RegExp(`^${item.siglum.value}_\\d+$`);
                const matchingSiglum = siglumList.filter(siglum => siglumPattern.test(siglum.siglum.value));
                const lastSortedNumber = matchingSiglum.length + 1
                const newSiglumValue = `${item.siglum.value}_${lastSortedNumber}`

                newSiglumList.push({
                    ...item,
                    siglum: {
                        ...item.siglum,
                        value: newSiglumValue,
                    },
                    manuscripts: item.manuscripts,
                    description: item.description,
                })
            })

            return {
                ...state,
                siglumList: [
                    ...siglumList,
                    ...newSiglumList,
                ].sort((a, b) => a.siglum.value.localeCompare(b.siglum.value))
            }
        }
        case 'REPLACE_SIGLUM_LIST_FROM_FILE': {
            const siglumList = state.siglumList
            const siglumListFromFile = action.payload

            const newSiglumList = siglumList.map(item => {
                const siglumListFromFileItem = siglumListFromFile.find(siglum => siglum.siglum.value === item.siglum.value)
                return siglumListFromFileItem ? siglumListFromFileItem : item
            })

            return {
                ...state,
                siglumList: newSiglumList
            }
        }
        case 'ADD_SIGLUM':
            return {
                ...state, siglumList: [
                    ...state.siglumList,
                    {
                        ...action.payload,
                        id: uuidv4(),
                        siglum: action.payload.siglum,
                        manuscripts: action.payload.manuscripts,
                        description: action.payload.description
                    }
                ]
            };
        case 'UPDATE_SIGLUM': {
            const siglumList = state.siglumList.map(siglum => {
                if (siglum.id === action.payload.id) {
                    return {
                        ...siglum,
                        siglum: action.payload.siglum,
                        manuscripts: action.payload.manuscripts,
                        description: action.payload.description
                    }
                }
                return siglum
            })

            return {
                ...state,
                siglumList: siglumList
            }
        }
        case 'DUPLICATE_SIGLUM': {
            const siglum = action.payload
            const siglumList = state.siglumList

            const hasSameSiglum = siglumList.some(item => item.siglum.value === siglum.siglum.value)
            const siglumPattern = new RegExp(`^${siglum.siglum.value}_\\d+$`);
            const matchingSiglum = siglumList.filter(siglum => siglumPattern.test(siglum.siglum.value));
            const lastSortedNumber = matchingSiglum.length + 1
            const newSiglumValue = `${siglum.siglum.value}_${lastSortedNumber}`

            const newSiglum = hasSameSiglum ? {
                ...siglum,
                id: uuidv4(),
                siglum: {
                    ...siglum.siglum,
                    value: newSiglumValue,
                    content: newSiglumValue
                }
            } : {
                ...siglum,
                id: uuidv4(),
            }

            return {
                ...state,
                siglumList: [
                    ...state.siglumList,
                    newSiglum
                ]
            };
        }
        case 'TOGGLE_INSERT_SIGLUM_DIALOG_VISIBLE':
            return {
                ...state,
                insertSiglumDialogVisible: state.siglumList.length > 0,
                siglumSetupDialogVisible: state.siglumList.length === 0,
            };
        case 'SET_INSERT_SIGLUM_DIALOG_VISIBLE':
            return { ...state, insertSiglumDialogVisible: action.payload };
        case 'SET_SIGLUM_SETUP_DIALOG_VISIBLE':
            return { ...state, siglumSetupDialogVisible: action.payload, insertSiglumDialogVisible: false };
        case 'DELETE_SIGLUM':
            return { ...state, siglumList: state.siglumList.filter(siglum => siglum.id !== action.payload.id) };
        case 'SET_FONT_FAMILY_LIST':
            return { ...state, fontFamilyList: action.payload };
        case 'SET_FONT_FAMILY_SYMBOLS':
            return { ...state, fontFamilySymbols: action.payload };
        case 'SET_ADD_SYMBOL_VISIBLE':
            return { ...state, addSymbolVisible: action.payload };
        case 'SET_LINE_NUMBER_SETUP_DIALOG_VISIBLE':
            return { ...state, lineNumberSetupDialogVisible: action.payload };
        case 'SET_PAGE_NUMBER_SETUP_DIALOG_VISIBLE':
            return { ...state, pageNumberSetupDialogVisible: action.payload };
        case 'SET_HEADER_SETUP_DIALOG_VISIBLE':
            return { ...state, headerSetupDialogVisible: action.payload };
        case 'SET_FOOTER_SETUP_DIALOG_VISIBLE':
            return { ...state, footerSetupDialogVisible: action.payload };
        case 'SET_PAGE_SETUP_OPT_DIALOG_VISIBLE':
            return { ...state, pageSetupOptDialogVisible: action.payload };
        case 'SET_TOC_SETUP_DIALOG_VISIBLE':
            return { ...state, tocSetupDialogVisible: action.payload };
        case 'SET_REFERENCE_FORMAT_VISIBLE':
            return { ...state, referenceFormatVisible: action.payload };
        case 'SET_PRINT_PREVIEW_VISIBLE':
            return { ...state, printPreviewVisible: action.payload };
        case 'TOGGLE_PRINT_PREVIEW_VISIBLE':
            return { ...state, printPreviewVisible: !state.printPreviewVisible };
        case 'SET_REFERENCE_FORMAT':
            return { ...state, referenceFormat: action.payload };
        case 'SET_BOOKMARK_HIGHLIGHTED':
            return { ...state, bookmarkHighlighted: action.payload };
        case 'SET_COMMENT_HIGHLIGHTED':
            return { ...state, commentHighlighted: action.payload };
        case 'TOGGLE_BOOKMARK_HIGHLIGHTED':
            return { ...state, bookmarkHighlighted: !state.bookmarkHighlighted };
        case 'TOGGLE_COMMENT_HIGHLIGHTED':
            return { ...state, commentHighlighted: !state.commentHighlighted };
        case 'SET_LINK_CONFIG_VISIBLE':
            return { ...state, linkConfigVisible: action.payload };
        default:
            return state;
    }
}