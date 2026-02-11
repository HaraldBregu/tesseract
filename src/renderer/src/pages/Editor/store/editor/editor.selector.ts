import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "src/renderer/src/store/store";

const editorState = (state: RootState) => state.editor;

export const selectEditorData = createSelector(
  editorState,
  (editor) => editor.data
);

export const selectApparatuses = createSelector(
  editorState,
  (editor) => editor.apparatuses
);

export const selectCriticalApparatuses = createSelector(
  selectApparatuses,
  (apparatuses) => apparatuses.filter((apparatus) => apparatus.type === 'CRITICAL')
);

export const selectApparatusesVisibilities = createSelector(
  selectApparatuses,
  (apparatuses) => apparatuses.map(apparatus => {
    return {
      id: apparatus.id,
      visible: apparatus.visible
    }
  })
);

export const selectVisibleApparatuses = createSelector(
  selectApparatuses,
  (apparatuses) => apparatuses.filter(apparatus => apparatus.visible)
);

export const hasVisibleApparatusesSelector = createSelector(
  selectVisibleApparatuses,
  (visibleApparatuses) => visibleApparatuses.length > 0
);

export const selectExpandedApparatuses = createSelector(
  selectApparatuses,
  (apparatuses) => apparatuses.filter(apparatus => apparatus.expanded)
);

export const visibleApparatusesOptionsSelector = createSelector(
  editorState,
  (state) => state.apparatuses.map((category) => ({
    label: category.title + " (" + category.type + ")",
    value: category.id,
  } as BubbleToolbarItemOption))
)

export const selectApparatusesTypes = createSelector(
  editorState,
  (editor) => editor.apparatuses.map(apparatus => apparatus.type)
);

export const selectIsBlockquote = createSelector(
  editorState,
  (editor) => editor?.isBlockquote || false
);

export const selectAlignment = createSelector(
  editorState,
  (editor) => editor?.alignment || 'left'
);

export const selectEditorMode = createSelector(
  editorState,
  (editor) => editor?.editorMode || "editing"
);

export const selectCanEdit = createSelector(
  editorState,
  (editor) => editor?.canEdit || false
);

export const selectChangeIndent = createSelector(
  editorState,
  (editor) => editor?.changeIndent || null
);

export const selectHistory = createSelector(
  editorState,
  (editor) => editor?.history
);

export const selectCanUndo = createSelector(
  editorState,
  (editor) => editor?.canUndo || false
);

export const selectTocStructureCriticalText = createSelector(
  editorState,
  (editor) => editor?.tocStructureCriticalText || []
);

export const selectTocStructureIntroduction = createSelector(
  editorState,
  (editor) => editor?.tocStructureIntroduction || []
);

export const selectTocStructureBibliography = createSelector(
  editorState,
  (editor) => editor?.tocStructureBibliography || []
);

export const selectHeadingEnabled = createSelector(
  editorState,
  (editor) => editor?.headingEnabled || false
);

export const selectToolbarEnabled = createSelector(
  editorState,
  (editor) => editor?.toolbarEnabled || false
);

// APPARATUSES SELECTORS

export const selectMaxRemainingApparatusesNumber = createSelector(
  editorState,
  (editor) => {
    const maxApparatuses = 8
    return maxApparatuses - editor.apparatuses.length
  }
);

export const selectEnabledRemainingApparatusesTypes = createSelector(
  selectMaxRemainingApparatusesNumber,
  editorState,
  (remainingApparatuses, editor) => {
    if (remainingApparatuses <= 0) return []

    const apparatusTypes = [
      'CRITICAL',
      'PAGE_NOTES',
      'SECTION_NOTES',
      'INNER_MARGIN',
      'OUTER_MARGIN'
    ] as const satisfies ApparatusType[]

    const types = apparatusTypes.filter(type => {
      const innerMargin = editor.apparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
      const outerMargin = editor.apparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN')
      const pageNotes = editor.apparatuses.some(apparatus => apparatus.type === 'PAGE_NOTES')
      const sectionNotes = editor.apparatuses.some(apparatus => apparatus.type === 'SECTION_NOTES')

      if (type === 'INNER_MARGIN' && innerMargin) {
        return false
      }
      if (type === 'OUTER_MARGIN' && outerMargin) {
        return false
      }
      if (type === 'PAGE_NOTES' && pageNotes) {
        return false
      }
      if (type === 'SECTION_NOTES' && sectionNotes) {
        return false
      }

      return true
    })

    return types as ApparatusType[]
  }
);

export const selectDisabledRemainingApparatusesTypes = createSelector(
  selectMaxRemainingApparatusesNumber,
  editorState,
  (remainingApparatuses, editor) => {
    const apparatusTypes = ['CRITICAL', 'PAGE_NOTES', 'SECTION_NOTES', 'INNER_MARGIN', 'OUTER_MARGIN'];

    const types = apparatusTypes.filter(type => {
      const innerMargin = editor.apparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
      const outerMargin = editor.apparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN')
      const pageNotes = editor.apparatuses.some(apparatus => apparatus.type === 'PAGE_NOTES')
      const sectionNotes = editor.apparatuses.some(apparatus => apparatus.type === 'SECTION_NOTES')

      if (type === 'INNER_MARGIN' && innerMargin) {
        return true
      } else if (type === 'OUTER_MARGIN' && outerMargin) {
        return true
      } else if (type === 'PAGE_NOTES' && pageNotes) {
        return true
      } else if (type === 'SECTION_NOTES' && sectionNotes) {
        return true
      } else if (remainingApparatuses <= 0) {
        return editor.apparatuses.filter(apparatus => apparatus.type !== 'INNER_MARGIN' && apparatus.type !== 'OUTER_MARGIN' && apparatus.type !== 'PAGE_NOTES' && apparatus.type !== 'SECTION_NOTES')
      }
      return false
    })

    return types as ApparatusType[]
  }
);

export const selectMaxRemainingInnerMargins = createSelector(
  editorState,
  (editor) => {
    const innerMargins = editor.apparatuses.filter(apparatus => apparatus.type === 'INNER_MARGIN')
    return 1 - innerMargins.length
  }
);

export const selectDocumentTemplate = createSelector(
  [editorState],
  (editor) => editor.documentTemplate
);


export const selectSelectedNodeType = createSelector(
  editorState,
  (editor) => editor.selectedNodeType
);