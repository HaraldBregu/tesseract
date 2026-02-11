import { EditorAction } from "..";

export const setToolbarStateFromApparatusTextStyle = (textStyle: ApparatusTextStyle): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_FROM_APPARATUS_TEXT_STYLE',
    payload: textStyle
})

export const setToolbarStateFromMainTextStyle = (textStyle: MainTextStyle): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_FROM_MAIN_TEXT_STYLE',
    payload: textStyle
})

export const setToolbarState = (toolbarState: ToolbarState): EditorAction => ({
    type: 'SET_TOOLBAR_STATE',
    payload: toolbarState
})

export const setToolbarStateFontFamily = (fontFamily: string): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_FONT_FAMILY',
    payload: fontFamily
})

export const setToolbarStateFontSize = (fontSize: string): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_FONT_SIZE',
    payload: fontSize
})

export const setToolbarStateSuperscript = (superscript: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_SUPERSCRIPT',
    payload: superscript,
})

export const setToolbarStateSubscript = (subscript: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_SUBSCRIPT',
    payload: subscript,
})

export const setToolbarStateBold = (bold: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_BOLD',
    payload: bold,
})

export const setToolbarStateItalic = (italic: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_ITALIC',
    payload: italic,
})

export const setToolbarStateUnderline = (underline: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_UNDERLINE',
    payload: underline,
})

export const setToolbarStateStrikethrough = (strikethrough: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_STRIKETHROUGH',
    payload: strikethrough,
})

export const setToolbarStateAlignment = (alignment: Alignment): EditorAction => ({
    type: 'SET_TOOLBAR_STATE_ALIGNMENT',
    payload: alignment,
})

export const toggleToolbarStateAlignment = (alignment: Alignment): EditorAction => ({
    type: 'TOGGLE_TOOLBAR_STATE_ALIGNMENT',
    payload: alignment,
})
