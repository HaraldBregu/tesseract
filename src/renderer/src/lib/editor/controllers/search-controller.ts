// src/search/searchController.ts
import type { Editor } from '@tiptap/core';
import type { EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from "prosemirror-model";
import { setAllMatches, setActiveIndex, clearVirtualSearch, clearActiveIndex } from '../extensions/search';
import { getAllSectionRanges, shouldDisableReplace } from '@/lib/utils';

type Chunk = { id: number; text: string; startPos: number };

function buildTextChunks(editor: Editor): Chunk[] {
  const chunks: Chunk[] = [];
  let id = 0;
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      chunks.push({ id: id++, text: node.text, startPos: pos });
    }
    return true;
  });
  return chunks;
}

function mapMatchesToRanges(doc: ProseMirrorNode, chunks: Chunk[], matches: WorkerMatch[]): Matches[] {
  const byId = new Map<number, Chunk>(chunks.map(c => [c.id, c]));
  const ranges: Matches[] = new Array(matches.length);
  const sectionRanges = getAllSectionRanges(doc);
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const chunk = byId.get(m.chunkId);
    if (!chunk) continue;
    const from = chunk.startPos + m.index;
    const section = sectionRanges.find(range => range.from <= from && range.to >= from + m.length)
    ranges[i] = {
      section: section ? section.type : 'text',
      position: { from, to: from + m.length }
    }
  }
  // Remove undefined holes and sort
  return ranges.filter(range => Boolean(range.position)).sort((a, b) => a.position.from - b.position.from);
}

function updateMappedMatchesToRanges(ranges: Matches[], searchIndex: number, lengthDiff: number): Matches[] {
  const newRanges = ranges.slice(searchIndex + 1);
  for (let i = 0; i < newRanges.length; i++) {
    const range = newRanges[i];
    range.position.from += lengthDiff;
    range.position.to += lengthDiff;
  }
  const currentIndex = ranges[searchIndex];
  return [
    ...ranges.slice(0, searchIndex),
    { ...currentIndex, position: { ...currentIndex.position, to: currentIndex.position.to + lengthDiff } },
    ...newRanges
  ];
}

export class SearchController {
  private editor: Editor | undefined;
  private view: EditorView | undefined;
  private serial = 0;
  private ranges: Matches[] = [];
  private idx = -1;
  private isReplacing = false;

  setEditor(editor: Editor): void {
    this.editor = editor;
    this.view = editor.view as EditorView;
  }

  public dispose(): void {
    if (this.view) {
      clearVirtualSearch(this.view);
    }
    this.ranges = [];
    this.idx = -1;
    this.isReplacing = false;
  }

  public cancel(): void {
    this.serial++;
  }

  public async search(searchTerm: string, caseSensitive = false, wholeWords = false): Promise<number> {
    if (!this.editor || !this.view) return 0;
    const chunks = buildTextChunks(this.editor);
    if (!chunks.length) return 0;

    this.cancel();

    const mySerial = ++this.serial;

    const payload: WorkerRequest = {
      chunks: chunks.map(c => ({ id: c.id, text: c.text })),
      searchTerm,
      caseSensitive,
      wholeWords,
    };

    const matches: WorkerMatch[] = await window.system.findWorker(payload);

    if (mySerial !== this.serial) return 0;

    this.ranges = mapMatchesToRanges(this.editor.state.doc, chunks, matches);
    setAllMatches(this.view, this.ranges.map(range => range.position));

    return this.ranges.length;
  }

  public setActiveSearch(index: number | null): void {
    if (!this.ranges.length || index === null || !this.view) return;
    this.idx = index as number;
    setActiveIndex(this.view, this.idx);
    this.scrollIntoView();
  }

  public clearActiveSearch(): void {
    if (!this.view) return;
    this.idx = -1;
    clearActiveIndex(this.view);
  }

  public scrollIntoView(): void {
    if (this.idx === null || this.idx < 0 || !this.ranges[this.idx] || !this.view || !this.editor) return;
    const { from } = this.ranges[this.idx].position;
    this.editor.chain().focus(from).scrollIntoView().run();
  }

  public disableReplace(): boolean {
    return this.idx > -1 && !!this.editor && shouldDisableReplace(this.ranges[this.idx], this.editor.state.doc);
  }

  public async replaceOne(replacement: string, searchIndex: number, { searchTerm }: SearchCriteria): Promise<number | boolean> {
    if (!this.editor || !this.view || this.disableReplace()) return false;

    const lengthDiff = replacement.length - searchTerm.length;

    const tr = this.editor.state.tr;
    const { from, to } = this.ranges[searchIndex].position;
    tr.insertText(replacement, from, to);
    this.view.dispatch(tr);
    this.ranges = updateMappedMatchesToRanges(this.ranges, searchIndex, lengthDiff);
    setAllMatches(this.view, this.ranges.map(range => range.position));
    return this.ranges.length;
  }
  /**
   * Optimized Replace-All Implementation
   */
  public async replaceAll(replacement: string, searchTerm: string): Promise<void> {
    if (!this.ranges.length) return;

    let replaceCount = 0;
    const batchSize = 250;
    const strLenDiff = replacement.length - searchTerm.length;
    this.isReplacing = true;

    this.execBatchReplace(replacement, batchSize, replaceCount, strLenDiff);
  }

  private execBatchReplace(replacement: string, batchSize: number, replaceCount: number, strLenDiff: number): void {
    if (!this.editor || !this.view) return;
    const { state } = this.editor;
    const matches = this.ranges.slice(0, batchSize);

    const tr = state.tr;
    tr.setMeta('addToHistory', false);
    for (const match of matches) {
      if (shouldDisableReplace(match, state.doc)) continue; // Skip instead of returning
      const { from, to } = match.position;
      const newFrom = from + (replaceCount * strLenDiff);
      const newTo = to + (replaceCount * strLenDiff);
      tr.insertText(replacement, newFrom, newTo);
      replaceCount++;
    }

    if (matches.length > 0) {
      this.view.dispatch(tr);
    }

    this.ranges.splice(0, batchSize);
    if (this.ranges.length > 0) {
      setTimeout(() => this.execBatchReplace(replacement, batchSize, replaceCount, strLenDiff), 0);
    } else {
      this.dispose();
    }
  }

  public getMatches(): Matches[] { return this.ranges; }
  public getActiveIndex(): number { return this.idx; }
  public get isInReplaceMode(): boolean { return this.isReplacing; }
  public get count(): number {
    return this.ranges.length;
  }
}
