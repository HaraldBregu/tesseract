import { mergeAttributes, CommandProps, JSONContent } from '@tiptap/core'
import { ReactNodeViewRenderer, Node as TTNode, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import AppButton from '@/components/app/app-button';
import IconMore from '@/components/app/icons/IconMore';
import {
  AppDropdownMenu,
  AppDropdownMenuContent,
  AppDropdownMenuItem,
  AppDropdownMenuTrigger,
} from '@/components/app/app-dropdown-menu';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectApparatuses } from '@/pages/editor/store/editor/editor.selector';

export interface ApparatusEntryOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    apparatus: {
      /**
       * Insert entries
       */
      insertApparatusEntries: (entries: ApparatusEntryContent[], textStyle: ApparatusEntryStyle, emphasis: ApparatusNoteEmphasis) => ReturnType,
      /**
       * Insert a new apparatus entry from nodes at the current cursor position
       */
      insertApparatusEntryFromNodes: (type: string, nodes: Node[], style: Style) => ReturnType,
    }
  }
}

export default TTNode.create<ApparatusEntryOptions>({
  name: 'apparatusEntry',

  group: 'block',

  content: 'paragraph',

  draggable: true,

  inline: false,

  handleContextMenu: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      type: {
        default: null,
      },
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="apparatus-entry"]',
        getAttrs: element => {
          if (typeof element === 'string')
            return false

          return {
            id: element.getAttribute('data-apparatus-entry-id'),
            type: element.getAttribute('data-apparatus-entry-type'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-apparatus-entry-id': HTMLAttributes.id,
          'data-apparatus-entry-type': HTMLAttributes.type,
        }
      ),
      0,
    ]
  },

  addCommands() {
    return {
      insertApparatusEntries: (entries: ApparatusEntryContent[], textStyle: ApparatusEntryStyle, emphasis: ApparatusNoteEmphasis) => ({ commands, editor }: CommandProps) => {
        const content: JSONContent[] = []

        for (const { id, type, lemmaContent, lemmaStyle, fromToSeparatorContent, fromToSeparatorStyle, separatorContent, separatorStyle, nodes } of entries) {
          const marks: { type: string, attrs?: Record<string, any> }[] = []
          if (emphasis.bold)
            marks.push({ type: 'bold' })

          if (emphasis.italic)
            marks.push({ type: 'italic' })

          const textNode: JSONContent = {
            type: 'text',
            text: ' ',
            marks: marks
          }

          const emptyNodes: JSONContent[] = [textNode]

          const newNodes = nodes.length === 0 ? emptyNodes : nodes

          content.push({
            type: this.name,
            attrs: {
              id,
              type,
            },
            content: [
              {
                type: 'paragraph',
                attrs: {
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  color: textStyle.color,
                  fontWeight: textStyle.fontWeight,
                  fontStyle: textStyle.fontStyle,
                },
                content: [
                  {
                    type: 'lemma',
                    attrs: {
                      id,
                      lemma: {
                        content: lemmaContent,
                        style: lemmaStyle,
                      },
                      fromToSeparator: {
                        content: fromToSeparatorContent,
                        style: fromToSeparatorStyle,
                      },
                      separator: {
                        content: separatorContent,
                        style: separatorStyle,
                      },
                    }
                  },
                  ...newNodes,
                ]
              }
            ]
          })
        }
        commands.setMeta('addToHistory', false)
        return commands.insertContentAt(editor.state.doc.content.size, content);
      },
      insertApparatusEntryFromNodes: (type: string, nodes: Node[], style: Style) => ({ commands, editor }: CommandProps) => {
        const { from, to } = editor.state.selection;
        const insertPosition = from === 0 ? editor.state.doc.content.size : to;

        const lemma = nodes.find((node) => node.type.name === 'lemma')
        const lemmaId = lemma?.attrs.id
        const content = nodes.map((node: Node) => node.toJSON()) satisfies JSONContent[]

        const newContent = [
          {
            type: 'paragraph',
            attrs: {
              fontSize: style.fontSize,
              fontFamily: style.fontFamily,
              color: style.color,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
            content: [
              ...content
            ]
          }
        ] satisfies JSONContent[]

        return commands
          .insertContentAt(insertPosition, {
            type: this.name,
            attrs: {
              id: lemmaId,
              type,
            },
            content: newContent
          })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ApparatusEntryNodeView)
  },

})

declare module '@tiptap/core' {
  interface EditorEvents {
    deleteApparatusWithId: string;
    highlightApparatus: string;
    swapMarginApparatusEntry: { id: string, type: "INNER_MARGIN" | "OUTER_MARGIN" };
  }
}

function ApparatusEntryNodeView({ editor, node, getPos }: any) {
  const { t } = useTranslation();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isInnerOrOuterMargin, setIsInnerOrOuterMargin] = useState(false);
  const apparatuses = useSelector(selectApparatuses)
  const canSwapMargin = useMemo(() => {
    const hasInnerMargin = apparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
    const hasOuterMargin = apparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN')
    return hasInnerMargin && hasOuterMargin
  }, [apparatuses])

  const handleDelete = () => {
    const pos = getPos();
    if (pos !== undefined) {
      editor.emit('deleteApparatusWithId', node.attrs.id);
    }
  };

  const handleSwapMargin = () => {
    editor.emit('swapMarginApparatusEntry', {
      ...node.attrs,
    });
  };

  useEffect(() => {
    const handleHighlight = (apparatusId: string) => {
      if (apparatusId === node.attrs.id) {
        setIsHighlighted(true);
        setTimeout(() => {
          setIsHighlighted(false);
        }, 3000);
      } else {
        setIsHighlighted(false);
      }
    };

    const handleUpdate = () => {
      const docNode = editor.state?.doc;
      let firstApparatusEntryAttrs: { type: string } | null = null;
      docNode.descendants((node) => {
        if (node?.type?.name === 'apparatusEntry') {
          firstApparatusEntryAttrs = node.attrs;
          return false;
        }
        return true;
      });

      if (!firstApparatusEntryAttrs) {
        setIsInnerOrOuterMargin(false);
        return;
      }

      const { type } = firstApparatusEntryAttrs;
      const typeSupported = type === 'INNER_MARGIN' || type === 'OUTER_MARGIN'
      setIsInnerOrOuterMargin(typeSupported);
    };

    editor.on('highlightApparatus', handleHighlight);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('highlightApparatus', handleHighlight);
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return (
    <NodeViewWrapper
      id={node.attrs.id}
      type={node.attrs.type}
      className={cn(
        'draggable-item flex items-center gap-2 hover:bg-grey-90 dark:hover:bg-grey-50 transition-all duration-200 rounded-sm px-1 py-0.5',
        isHighlighted && 'bg-grey-80'
      )}>
      <NodeViewContent className="content flex-1" />
      <AppDropdownMenu>
        <AppDropdownMenuTrigger>
          <AppButton
            asChild
            variant="transparent"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <IconMore />
          </AppButton>
        </AppDropdownMenuTrigger>
        <AppDropdownMenuContent align="end" className="w-48">
          {isInnerOrOuterMargin && <AppDropdownMenuItem
            disabled={!canSwapMargin}
            onClick={(e) => {
              e.stopPropagation();
              handleSwapMargin();
            }}>
            {t('apparatusesMenu.swapMargin', "###Swap Margin###")}
          </AppDropdownMenuItem>}
          <AppDropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}>
            {t('apparatusesMenu.delete', "###Delete###")}
          </AppDropdownMenuItem>
        </AppDropdownMenuContent>
      </AppDropdownMenu>
    </NodeViewWrapper>
  )
}
