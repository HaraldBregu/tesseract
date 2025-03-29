import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Bookmark {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

interface EditorState {
    data: string[];
    isLoading: boolean;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isHeading: boolean;
    headingLevel: number;
    redo: boolean;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    highlightColor: string;
    comment: boolean;
    bookmark: boolean;
    bookmarks: Bookmark[];
}

const initialState: EditorState = {
    data: [],
    isLoading: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isHeading: false,
    headingLevel: 0,
    redo: false,
    fontFamily: "Default",
    fontSize: 12,
    textColor: "inherit",
    highlightColor: "inherit",
    comment: false,
    bookmark: false,
    bookmarks: [],
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        fetchDataStart(state) {
            state.isLoading = true;
        },
        fetchDataSuccess(state, action: PayloadAction<string[]>) {
            state.data = action.payload;
            state.isLoading = false;
        },
        fetchDataFailure(state) {
            state.isLoading = false;
        },
        setBold(state, action: PayloadAction<boolean>) {
            state.isBold = action.payload;
        },
        toggleBold(state) {
            state.isBold = !state.isBold;
        },
        setItalic(state, action: PayloadAction<boolean>) {
            state.isItalic = action.payload;
        },
        toggleItalic(state) {
            state.isItalic = !state.isItalic;
        },
        setUnderline(state, action: PayloadAction<boolean>) {
            state.isUnderline = action.payload;
        },
        toggleUnderline(state) {
            state.isUnderline = !state.isUnderline;
        },
        setHeadingLevel(state, action: PayloadAction<number>) {
            state.headingLevel = action.payload;
            state.isHeading = action.payload > 0;
        },
        redo(state, action: PayloadAction<boolean>) {
          state.redo = action.payload;
        },
        setFontFamily(state, action: PayloadAction<string>) {
            state.fontFamily = action.payload;
        },
        setFontSize(state, action: PayloadAction<number>) {
            state.fontSize = action.payload;
        },
        increaseFontSize(state) {
            const size = state.fontSize;
            if (size > 95) return
            state.fontSize = size + 1;
        },
        decreaseFontSize(state) {
            const size = state.fontSize;
            if (size < 7) return
            state.fontSize = size - 1;
        },
        setTextColor(state, action: PayloadAction<string>) {
            state.textColor = action.payload;
        },
        setHighlightColor(state, action: PayloadAction<string>) {
            state.highlightColor = action.payload;
        },
        setComment(state, action: PayloadAction<boolean>) { 
            state.comment = action.payload;
        },
        executeComment(state) { 
            console.log("executeComment:", state)
        },
        setBookmark(state, action: PayloadAction<boolean>) {
            state.bookmark = action.payload;
        },
        executeBookmark(state) {
            console.log("executeBookmark:", state)
        },
        addBookmark(state, action: PayloadAction<Bookmark>) {
            console.log("saveBookmark:", action.payload)
            state.bookmarks.push(action.payload)
        },

    },
});

export const {
    fetchDataStart,
    fetchDataSuccess,
    fetchDataFailure,
    setBold,
    toggleBold,
    setItalic,
    toggleItalic,
    setUnderline,
    toggleUnderline,
    setHeadingLevel,
    redo,
    setFontFamily,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    setTextColor,
    setHighlightColor,
    setComment,
    executeComment,
    setBookmark,
    executeBookmark,
    addBookmark,
} = editorSlice.actions;

export default editorSlice.reducer;
