// src/extensions/virtualSearchHighlight.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

type PluginState = {
  all: TTextPosition[];
  activeIndex: number;
  deco: DecorationSet;
  lastWindow?: { from: number; to: number };
};

declare module '@tiptap/core' {

    interface EditorEvents {
        onDisposedSearch: void;
    }
}

export const virtualSearchKey = new PluginKey<PluginState>('virtualSearchHighlight');

const CLASS_BASE = 'bg-yellow-200 text-grey-10 dark:text-grey-80 dark:bg-yellow-700';
const CLASS_ACTIVE = 'bg-orange-400 text-grey-10 dark:text-grey-80 dark:bg-orange-600';
const interactiveEvents = [
  'keydown',
  'paste',
  'drop',
];

function binarySearchFirst(arr: TTextPosition[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].to < target) lo = mid + 1; else hi = mid;
  }
  return lo;
}
function binarySearchLast(arr: TTextPosition[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].from <= target) lo = mid + 1; else hi = mid;
  }
  return lo - 1;
}

function visibleWindow(view: EditorView, bufferPx = 300) {
  const rect = view.dom.getBoundingClientRect();
  const top = rect.top - bufferPx;
  const bottom = rect.bottom + bufferPx;
  const left = rect.left + 1;
  const from = view.posAtCoords({ left, top })?.pos ?? 0;
  const to = view.posAtCoords({ left, top: bottom })?.pos ?? view.state.doc.content.size;
  return { from, to };
}

function rebuildVisibleDecos(view: EditorView, all: TTextPosition[], activeIndex: number, maxVisible = 2000): DecorationSet {
  if (!all.length) return DecorationSet.empty;
  const win = visibleWindow(view, 320);
  const startIdx = Math.max(0, binarySearchFirst(all, win.from));
  const endIdx = Math.min(all.length - 1, Math.max(startIdx, binarySearchLast(all, win.to)));
  const spans: Decoration[] = [];
  for (let i = startIdx; i <= endIdx && spans.length < maxVisible; i++) {
    const r = all[i];
    const cls = i === activeIndex ? CLASS_ACTIVE : CLASS_BASE;
    spans.push(Decoration.inline(r.from, r.to, { class: cls }));
  }
  return DecorationSet.create(view.state.doc, spans);
}

// Extension
export const VirtualSearchHighlight = Extension.create({
  name: 'virtualSearchHighlight',
  addProseMirrorPlugins() {
    const ext = this;
    return [
      new Plugin({
        key: virtualSearchKey,
        state: {
          init() {
            return { all: [] as TTextPosition[], activeIndex: -1, deco: DecorationSet.empty };
          },
          apply(tr, prev, _old, _newState) {
            const meta = tr.getMeta(virtualSearchKey) as any;
            let all = prev.all;
            let activeIndex = prev.activeIndex;
            let deco = prev.deco.map(tr.mapping, tr.doc);
            if (meta?.type === 'setAll') {
              all = (meta.all as TTextPosition[]).slice().sort((a, b) => a.from - b.from);
              deco = rebuildVisibleDecos((ext.editor as any).view, all, activeIndex);
            } else if (meta?.type === 'setActive') {
              activeIndex = meta.index as number;
              deco = rebuildVisibleDecos((ext.editor as any).view, all, activeIndex);
            } else if (meta?.type === '_replaceVisible') {
              deco = meta.deco as DecorationSet;
            } else if (meta?.type === 'clear') {
              all = [];
              activeIndex = -1;
              deco = DecorationSet.empty;
            } else {
              // map forward
              deco = deco.map(tr.mapping, tr.doc);
            }
            return { all, activeIndex, deco };
          }
        },
        props: {
          decorations(state) {
            const s = virtualSearchKey.getState(state);
            return s?.deco ?? null;
          }
        },
        view(view) {
          let raf = 0;
          const schedule = (): void => {
            if (raf) return;
            raf = window.requestAnimationFrame(() => {
              raf = 0;
              const s = virtualSearchKey.getState(view.state);
              if (!s || !s.all.length) return;
              const win = visibleWindow(view, 320);
              const last = s.lastWindow;
              const similar = last && Math.abs(last.from - win.from) < 50 && Math.abs(last.to - win.to) < 50;
              if (similar) return;
              const deco = rebuildVisibleDecos(view, s.all, s.activeIndex);
              const tr = view.state.tr.setMeta(virtualSearchKey, { type: '_replaceVisible', deco });
              // carry window over for appendTransaction (no state changes)
              (tr as any)._newWindow = win;
              view.dispatch(tr);
            });
          };
          const onScroll = () => schedule();
          const onResize = () => schedule();

          const clearOnUserInteraction = () => {
            const s = virtualSearchKey.getState(view.state);
            if (!s || !s.all.length) return;
            view.dispatch(view.state.tr.setMeta(virtualSearchKey, { type: 'clear' }));
            ext.editor?.emit('onDisposedSearch');
          };

          interactiveEvents.forEach((ev) =>
            view.dom.addEventListener(ev, clearOnUserInteraction)
          );

          view.dom.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onResize, { passive: true });
          window.addEventListener('scroll', onScroll, { passive: true });
          return {
            update() {schedule(); },
            destroy() {
              if (raf) cancelAnimationFrame(raf);
              interactiveEvents.forEach((ev) =>
                view.dom.removeEventListener(ev, clearOnUserInteraction)
              );
              view.dom.removeEventListener('scroll', onScroll);
              window.removeEventListener('resize', onResize);
              window.removeEventListener('scroll', onScroll);
            }
          };
        },
        appendTransaction(trs, _oldState, state) {
          const last = trs[trs.length - 1];
          if (last && (last as any)._newWindow) {
            (last as any)._newWindow as { from: number; to: number };
            // store lastWindow via a no-op transaction to avoid direct plugin state mutation
            const s = virtualSearchKey.getState(state);
            if (!s) return null;
            // nothing to change in doc; return null (we already dispatched). This is intentionally a no-op.
          }
          return null;
        }
      })
    ];
  }
});

// public helpers (EditorView typed)
import type { EditorView as PMEditorView } from 'prosemirror-view';
export const setAllMatches = (view: PMEditorView, all: TTextPosition[]): void => {
  view.dispatch(view.state.tr.setMeta(virtualSearchKey, { type: 'setAll', all }));
};
export const setActiveIndex = (view: PMEditorView, index: number): void => {
  view.dispatch(view.state.tr.setMeta(virtualSearchKey, { type: 'setActive', index }));
};
export const clearActiveIndex = (view: PMEditorView): void => {
  view.dispatch(view.state.tr.setMeta(virtualSearchKey, { type: 'setActive', index: null }));
}
export const clearVirtualSearch = (view: PMEditorView): void => {
  view.dispatch(view.state.tr.setMeta(virtualSearchKey, { type: 'clear' }));
};
