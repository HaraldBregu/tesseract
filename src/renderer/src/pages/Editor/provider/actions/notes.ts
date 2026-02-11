import { EditorAction } from ".";
import { Node } from "@tiptap/pm/model";


export const insertApparatusNote = (apparatusNote: ApparatusNote): EditorAction => ({
    type: 'INSERT_APPARATUS_NOTE',
    payload: apparatusNote
})

export const insertNotes = (apparatusNotes: ApparatusNote[]): EditorAction => ({
    type: 'INSERT_NOTES',
    payload: apparatusNotes
})

export const updateNotesEntryNodes = (data: { noteId: string, apparatusId: string, entryNodes: Node[], style: ApparatusEntryStyle, emphasis: ApparatusNoteEmphasis }[]): EditorAction => ({
    type: 'UPDATE_NOTES_ENTRY_NODES',
    payload: data
})

export const deleteNoteWithId = (noteId: string): EditorAction => ({
    type: 'DELETE_NOTE_WITH_ID',
    payload: noteId
})
