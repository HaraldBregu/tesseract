
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
interface TextCharSymbol {
  char: string;
  symbol: string;
}

interface TagCharSymbol {
  tag: string;
  name: string;
  symbol: string;
  level?: number;
}

export interface NonPrintableCharacterOptions {
  textCharacters: TextCharSymbol[];
  tagsCharacters: TagCharSymbol[];
  className: string;
  visible: boolean;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        nonPrintingCharacters: {
            setShowNonPrintingCharacters: (visible: boolean) => ReturnType;
        };
    }
}

const pluginKey = new PluginKey<DecorationSet>('nonPrintingCharacterVirtual');

export const NonPrintableCharacters = Extension.create<NonPrintableCharacterOptions>({
  name: 'nonPrintingCharacter',

  addOptions() {
    return {
      visible: false,
      className: 'npc',
      textCharacters: [
        { char: ' ', symbol: '.' },
        { char: '\n', symbol: '¶' },
        { char: '\t', symbol: '→' },
      ],
      tagsCharacters: [
        { tag: '<br>', name: 'hardBreak', symbol: '¶' },
        { tag: '<p>', name: 'paragraph', symbol: '¶' },
        ...Array.from({ length: 6 }, (_, i) => ({
          tag: `<h${i + 1}>`,
          name: 'heading',
          level: i + 1,
          symbol: '¶',
        })),
      ],
    };
  },

  addCommands() {
    return {
      setShowNonPrintingCharacters: (visible: boolean) => () => {
        this.options.visible = visible;
        const tr = this.editor.state.tr.setMeta(pluginKey, { type: 'toggle' });
        this.editor.view.dispatch(tr);
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const ext = this;
    const options = this.options;
    let lastWindow: { from: number; to: number } | undefined;
    let raf = 0;

    const visibleWindow = (view: EditorView, bufferPx = 300) => {
      const rect = view.dom.getBoundingClientRect();
      const top = rect.top - bufferPx;
      const bottom = rect.bottom + bufferPx;
      const left = rect.left + 1;
      const from = view.posAtCoords({ left, top })?.pos ?? 0;
      const to = view.posAtCoords({ left, top: bottom })?.pos ?? view.state.doc.content.size;
      return { from, to };
    };

    const buildDecorations = (doc: ProseMirrorNode, from: number, to: number) => {
      const decorations: Decoration[] = [];

      doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
          for (const { char, symbol } of options.textCharacters) {
            if (!node.text) continue;
            let idx = node.text.indexOf(char);
            while (idx !== -1 && pos + idx < to) {
              decorations.push(
                Decoration.inline(pos + idx, pos + idx + 1, {
                  class: options.className,
                  'data-symbol': symbol,
                })
              );
              idx = node.text.indexOf(char, idx + 1);
            }
          }
        } else {
          for (const { name, level, symbol } of options.tagsCharacters) {
            const matchesType =
              node.type.name === name &&
              (level === undefined || node.attrs.level === level);

            if (matchesType) {
              decorations.push(
                Decoration.widget(pos + node.nodeSize - 1, () => {
                  const span = document.createElement('span');
                  span.className = options.className;
                  span.setAttribute('data-symbol', symbol);
                  return span;
                }, { side: 1 })
              );
            }
          }
        }
      });

      return DecorationSet.create(doc, decorations);
    };

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old, _oldState, newState) {
            const meta = tr.getMeta(pluginKey);
            if (meta?.type === 'toggle') {
              if (!options.visible) return DecorationSet.empty;
              const view = (ext.editor as any).view as EditorView;
              const win = visibleWindow(view, 320);
              lastWindow = win;
              return buildDecorations(newState.doc, win.from, win.to);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations: (state) => pluginKey.getState(state),
        },
        view: (view) => {
          const updateDecorations = () => {
            if (!options.visible) return;
            const win = visibleWindow(view, 320);
            const similar =
              lastWindow &&
              Math.abs(lastWindow.from - win.from) < 50 &&
              Math.abs(lastWindow.to - win.to) < 50;
            if (similar) return;
            lastWindow = win;
            buildDecorations(view.state.doc, win.from, win.to);
            const tr = view.state.tr.setMeta(pluginKey, { type: 'toggle' });
            view.dispatch(tr);
          };

          const scheduleUpdate = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
              raf = 0;
              updateDecorations();
            });
          };

          view.dom.addEventListener('scroll', scheduleUpdate, { passive: true });
          window.addEventListener('resize', scheduleUpdate, { passive: true });

          return {
            update: scheduleUpdate,
            destroy() {
              if (raf) cancelAnimationFrame(raf);
              view.dom.removeEventListener('scroll', scheduleUpdate);
              window.removeEventListener('resize', scheduleUpdate);
            },
          };
        },
      }),
    ];
  },
});
