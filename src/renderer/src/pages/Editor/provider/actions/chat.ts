import { EditorAction } from "..";

export const openChat = (text?: string): EditorAction => ({
    type: 'OPEN_CHAT',
    payload: text
})

export const closeChat = (): EditorAction => ({
    type: 'CLOSE_CHAT',
})

export const minimizeChat = (): EditorAction => ({
    type: 'MINIMIZE_CHAT',
})

export const setChatReference = (text: string | null): EditorAction => ({
    type: 'SET_CHAT_REFERENCE',
    payload: text
})
