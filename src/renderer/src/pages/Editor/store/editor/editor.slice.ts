import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import colors from "tailwindColors.json"

export const initialTocSettings: TocSettings = {
    show: false,
    levels: 3,
    indentLevels: true,
    title: "Table of Contents",
    tabLeaderFormat: "1",
    showHeadingNumbers: true,
    numberSeparator: "2",
    level1Format: "1",
    level2Format: "1",
    level3Format: "1",
    level4Format: "1",
    level5Format: "1",
    level6Format: "1",
}

// const initialEmphasisState: EmphasisState = {
//     link: '',
//     styleId: '',
//     headingLevel: 0,
//     fontFamily: "Times New Roman",
//     fontSize: "12pt",
//     bold: false,
//     italic: false,
//     underline: false,
//     strikethrough: false,
//     alignment: 'left',
//     blockquote: false,
//     isCodeBlock: false,
//     bulletStyle: {
//         type: '',
//         style: '',
//         previousType: '',
//     },
//     highlight: "#ffffff",
//     textColor: colors.primary[20],
//     superscript: false,
//     subscript: false,
//     spacing: {
//         before: null,
//         after: null,
//         line: 1,
//     },
// }

export interface EditorState {
    data: string[];
    // toolbarEmphasisState: EmphasisState;
    editorMode: 'editing' | 'review';
    canEdit: boolean;
    canUndo: boolean;
    canRedo: boolean;
    headingEnabled: boolean;
    toolbarEnabled: boolean;
    isBlockquote: boolean;
    alignment: string;
    mode: string;
    isNonPrintingCharacter: boolean;
    history?: HistoryState;
    changeIndent: 'increase' | 'decrease' | null;
    tocStructureCriticalText: TreeItem[];
    tocStructureIntroduction: TreeItem[];
    tocStructureBibliography: TreeItem[];
    apparatuses: Apparatus[];
    documentTemplate: Template | null,
    selectedNodeType: 'heading' | 'paragraph' | 'mixed' | null;
}

const initialState: EditorState = {
    data: [],
    // toolbarEmphasisState: initialEmphasisState,
    editorMode: 'editing',
    canEdit: true,
    headingEnabled: true,
    toolbarEnabled: false,
    canUndo: false,
    canRedo: false,
    isBlockquote: false,
    alignment: 'left',
    mode: 'editing',
    isNonPrintingCharacter: false,
    changeIndent: null,
    tocStructureCriticalText: [],
    tocStructureIntroduction: [],
    tocStructureBibliography: [],
    apparatuses: [],
    documentTemplate: null,
    selectedNodeType: null
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        // setEmphasisState(state, action: PayloadAction<EmphasisState>) {
        //     const emphasisState = action.payload;
        //     if (JSON.stringify(state.toolbarEmphasisState) === JSON.stringify(emphasisState)) return;
        //     state.toolbarEmphasisState = {
        //         ...emphasisState,
        //     };
        // },
        // setFontFamily(state, action
        //     : PayloadAction<{ fontFamily: string }>) {
        //     state.toolbarEmphasisState.fontFamily = action.payload.fontFamily;
        // },
        setCanUndo(state, action: PayloadAction<boolean>) {
            if (action.payload === state.canUndo) return;
            state.canUndo = action.payload;
        },
        setCanRedo(state, action: PayloadAction<boolean>) {
            if (action.payload === state.canRedo) return;
            state.canRedo = action.payload;
        },
        setEditorMode(state, action: PayloadAction<'editing' | 'review'>) {
            state.editorMode = action.payload;
            state.canEdit = action.payload === 'editing';
        },
        setHistory(state, action: PayloadAction<HistoryState>) {
            state.history = action.payload;
        },
        changeIndentention(state, action: PayloadAction<'increase' | 'decrease' | null>) {
            state.changeIndent = action.payload;
        },
        setTocStructureCriticalText(state, action: PayloadAction<TreeItem[]>) {
            state.tocStructureCriticalText = action.payload;
        },
        setTocStructureIntroduction(state, action: PayloadAction<TreeItem[]>) {
            state.tocStructureIntroduction = action.payload;
        },
        setTocStructureBibliography(state, action: PayloadAction<TreeItem[]>) {
            state.tocStructureBibliography = action.payload;
        },
        setHeadingEnabled(state, action: PayloadAction<boolean>) {
            state.headingEnabled = action.payload;
        },
        setToolbarEnabled(state, action: PayloadAction<boolean>) {
            state.toolbarEnabled = action.payload;
        },
        expandApparatus(state, action: PayloadAction<{ id: string }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.expanded = true;
            }
        },
        toggleExpandedApparatus(state, action: PayloadAction<{ id: string }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.expanded = !apparatus.expanded;
            }
        },
        updateVisibleApparatuses(state, action: PayloadAction<Apparatus[]>) {
            const invisibleApparatuses = state.apparatuses.filter(apparatus => !apparatus.visible);
            state.apparatuses = [
                ...invisibleApparatuses,
                ...action.payload
            ]
        },
        toggleVisibilityApparatus(state, action: PayloadAction<{ id: string, visible: boolean }>) {
            const apparatuses = state.apparatuses
            const apparatus = apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.visible = action.payload.visible;
            }
            state.apparatuses = apparatuses
        },
        loadApparatuses(state, action: PayloadAction<Apparatus[]>) {
            state.apparatuses = action.payload;
        },
        loadDocumentApparatuses(state, action: PayloadAction<DocumentApparatus[]>) {
            state.apparatuses = action.payload.map((apparatus) => ({
                id: apparatus.id,
                title: apparatus.title,
                type: apparatus.type,
                visible: apparatus.visible ?? true,
                expanded: apparatus.expanded ?? true,
                notesVisible: apparatus.notesVisible ?? true,
                commentsVisible: apparatus.commentsVisible ?? true,
            }));
        },
        addApparatusAtIndex(state, action: PayloadAction<{ apparatus: Apparatus, index: number }>) {
            state.apparatuses.splice(action.payload.index, 0, action.payload.apparatus);
        },
        addApparatusAtTop(state, action: PayloadAction<DocumentApparatus>) {
            state.apparatuses.unshift(action.payload);
        },
        removeApparatus(state, action: PayloadAction<Apparatus>) {
            state.apparatuses = state.apparatuses.filter(apparatus => apparatus.id !== action.payload.id);
        },
        changeApparatusType(state, action: PayloadAction<{ id: string, type: Apparatus['type'] }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.type = action.payload.type;
            }
        },
        changeApparatusTitle(state, action: PayloadAction<{ id: string, title: string }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.title = action.payload.title;
            }
        },
        setApparatusNoteVisibility(state, action: PayloadAction<{ id: string, notesVisible: boolean }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.notesVisible = action.payload.notesVisible;
            }
        },
        setApparatusCommentVisibility(state, action: PayloadAction<{ id: string, commentsVisible: boolean }>) {
            const apparatus = state.apparatuses.find(apparatus => apparatus.id === action.payload.id);
            if (apparatus) {
                apparatus.commentsVisible = action.payload.commentsVisible;
            }
        },
        setDocumentTemplate(state, action: PayloadAction<any>) {
            state.documentTemplate = action.payload;
        },
        setSelectedNodeType(state, action: PayloadAction<'heading' | 'paragraph' | 'mixed' | null>) {
            state.selectedNodeType = action.payload;
        },
        toggleAllApparatuses(state) {
            const allExpanded = state.apparatuses.every(apparatus => apparatus.expanded);
            state.apparatuses.forEach(apparatus => {
                apparatus.expanded = allExpanded ? false : true;
            });
        },
    },

});

export const {
    // setEmphasisState,
    setCanUndo,
    setCanRedo,
    setEditorMode,
    setHistory,
    changeIndentention,
    setTocStructureCriticalText,
    setTocStructureIntroduction,
    setTocStructureBibliography,
    setHeadingEnabled,
    setToolbarEnabled,
    expandApparatus,
    toggleExpandedApparatus,
    updateVisibleApparatuses,
    toggleVisibilityApparatus,
    loadApparatuses,
    loadDocumentApparatuses,
    addApparatusAtIndex,
    addApparatusAtTop,
    removeApparatus,
    changeApparatusType,
    changeApparatusTitle,
    setApparatusNoteVisibility,
    setApparatusCommentVisibility,
    setDocumentTemplate,
    // setFontFamily,
    setSelectedNodeType,
    toggleAllApparatuses
} = editorSlice.actions;

export default editorSlice.reducer;
