import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { SearchController } from '@/lib/editor/controllers/search-controller';

export function useSearch(editor: Editor | null) {
  const ref = useRef<SearchController>(new SearchController());
  
  const count = useMemo(() => ref.current.count, [ref.current.count]);
  const isInReplaceMode = useMemo(() => ref.current.isInReplaceMode, [ref.current.isInReplaceMode]);
  
  const search = useCallback((t: string, c = false, w = false) => ref.current.search(t, c, w), [editor, ref.current.search]);
  const setActiveSearch = useCallback((index: number | null) => ref.current.setActiveSearch(index), [ref.current.setActiveSearch]);
  const clearActiveSearch = useCallback(() => ref.current.clearActiveSearch(), [ref.current.clearActiveSearch]);
  const activeIndex = useCallback(() => ref.current.getActiveIndex(), [ref.current.getActiveIndex]);
  const replaceOne = useCallback((r: string, si: number, c: SearchCriteria) => ref.current.replaceOne(r, si, c), [ref.current.replaceOne]);
  const replaceAll = useCallback((r: string, s: string) => ref.current.replaceAll(r, s), [ref.current.replaceAll]);
  const matches = useCallback(() => ref.current.getMatches(), [ref.current.getMatches]);
  const dispose = useCallback(() => ref.current.dispose(), [ref.current.dispose]);
  const disableReplace = useCallback(() => ref.current.disableReplace(), [ref.current.disableReplace]);
  
  useEffect(() => {
    if (!editor) return;
    ref.current.setEditor(editor);
    return () => ref.current.dispose();
  }, [editor]);
  
  return {
    search,
    setActiveSearch,
    clearActiveSearch,
    replaceOne,
    replaceAll,
    activeIndex,
    matches,
    dispose,
    disableReplace,
    count,
    isInReplaceMode
  };
}
