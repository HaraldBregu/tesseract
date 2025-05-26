import { RootState } from "src/renderer/src/store/store";

export const selectEditorData = (state: RootState) => state.editor.data;
export const selectToolbarEmphasisState = (state: RootState) => state.editor.toolbarEmphasisState;
export const selectEditorEmphasisState = (state: RootState) => state.editor.editorEmphasisState;
export const selectApparatuses = (state: RootState) => state.editor.apparatuses;
export const selectVisibleApparatuses = (state: RootState) => state.editor.apparatuses.filter(apparatus => apparatus.visible);
export const selectApparatusesTypes = (state: RootState) => state.editor.apparatuses.map(apparatus => apparatus.type);

export const selectIsBlockquote = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.isBlockquote || false;
};

export const selectAlignment = (state: RootState) => {
  if (!state.editor) return 'left';
  return state.editor.alignment;
};

export const selectEditorMode = (state: RootState) => {
  if (!state.editor) return "editing";
  return state.editor.editorMode;
};

export const selectCanEdit = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.canEdit;
};

export const selectChangeIndent = (state: RootState) => {
  if (!state.editor) return null;
  return state.editor.changeIndent;
};

export const selectTocSettings = (state: RootState) => {
  return state.editor.tocSettings;
}

export const selectHistory = (state: RootState) => {
  if (!state.editor) return undefined;
  return state.editor.history;
}

export const selectCanUndo = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.canUndo;
}

export const selectCanAddBookmark = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.canAddBookmark;
}

export const selectCanAddComment = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.canAddComment;
}

export const selectSelectedSidebarTabIndex = (state: RootState) => {
  if (!state.editor) return 0;
  return state.editor.selectedSidebarTabIndex;
}

export const selectEmphasisState = (state: RootState) => {
  if (!state.editor) return null;
  return state.editor.emphasisState;
}

export const selectBookmarkActive = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.bookmarkActive || false;
}

export const selectCommentActive = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.commentActive || false;
}

export const selectTocStructure = (state: RootState) => {
  if (!state.editor) return [];
  return state.editor.tocStructure;
}

export const selectHeadingEnabled = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.headingEnabled;
}

export const selectBookmarkHighlighted = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.bookmarkHighlighted;
}

export const selectCommentHighlighted = (state: RootState) => {
  if (!state.editor) return false;
  return state.editor.commentHighlighted;
}

// APPARATUSES SELECTORS

export const selectMaxRemainingApparatusesNumber = (state: RootState) => {
  const maxApparatuses = 8
  return maxApparatuses - state.editor.apparatuses.length
}

export const selectEnabledRemainingApparatusesTypes = (state: RootState) => {
  const remainingApparatuses = selectMaxRemainingApparatusesNumber(state)
  if (remainingApparatuses <= 0) return []

  const apparatusTypes = ['CRITICAL', 'PAGE_NOTES', 'SECTION_NOTES', 'INNER_MARGIN', 'OUTER_MARGIN'];

  const types = apparatusTypes.filter(type => {
    const innerMargin = state.editor.apparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
    const outerMargin = state.editor.apparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN')
    if (type === 'INNER_MARGIN' && innerMargin) {
      return false
    }
    if (type === 'OUTER_MARGIN' && outerMargin) {
      return false
    }

    return true
  })

  return types
}

export const selectDisabledRemainingApparatusesTypes = (state: RootState) => {
  const remainingApparatuses = selectMaxRemainingApparatusesNumber(state)
  const apparatusTypes = ['CRITICAL', 'PAGE_NOTES', 'SECTION_NOTES', 'INNER_MARGIN', 'OUTER_MARGIN'];

  const types = apparatusTypes.filter(type => {
    const innerMargin = state.editor.apparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
    const outerMargin = state.editor.apparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN')
    if (type === 'INNER_MARGIN' && innerMargin) {
      return true
    } else if (type === 'OUTER_MARGIN' && outerMargin) {
      return true
    } else if (remainingApparatuses <= 0) {
      return state.editor.apparatuses.filter(apparatus => apparatus.type !== 'INNER_MARGIN' && apparatus.type !== 'OUTER_MARGIN')
    }
    return false
  })

  return types
}

export const selectMaxRemainingInnerMargins = (state: RootState) => {
  const innerMargins = state.editor.apparatuses.filter(apparatus => apparatus.type === 'INNER_MARGIN')
  return 1 - innerMargins.length
}

export const selectCharacters = (state: RootState) => {
  if (!state.editor) return 0;
  return state.editor.characters;
}

export const selectWords = (state: RootState) => {
  if (!state.editor) return 0;
  return state.editor.words;
}
