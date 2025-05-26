import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Strikethrough from '@tiptap/extension-strike';
import ListItem from '@tiptap/extension-list-item'
import { Color } from '@tiptap/extension-color';
import { CustomTextStyle, CustomLetterSpacing, IndentExtension, Capitalization } from './custom-text-style';
import { useEditor } from '@tiptap/react';
import { BookmarkMark } from '@/lib/tiptap/bookmark-mark';
import { CommentMark } from '@/lib/tiptap/comment-mark';
import { LineNumbers } from '@/lib/tiptap/line-number-extension';
import { SelectionHandlerExtension } from './selection-handler-extension';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SectionDivider, SectionDividerProtection } from './section-devider';
import { ProtectDividers } from './protect-deviders';
import { SectionDividerView } from './section-devider-view';
import { EditableFilter } from './editable-filter';
import { CustomBulletedList } from './custom-bullet-list-extension';
import { CustomOrderList } from './custom-order-list-extension';
import { CharacterSpacing } from './character-spacing-extension';
import LineSpacing from './line-spacing-extension';
import { CustomHeading } from './custom-heading-extension';
import { NonPrintableCharacters } from './non-printable-character';
import { CharacterCount } from '@tiptap/extension-character-count';
import Ligature from './ligature-mark';

const defaultEditorConfig = (
    withSectionDividers: boolean = false,
    withEditableFilter: boolean = false,
): Parameters<typeof useEditor>[0] => {

    const editorConfig = {
        extensions: [
            IndentExtension.configure({
                maxIndent: 8
            }),
            StarterKit.configure({
                codeBlock: false,
                history: {
                    depth: 100,
                    newGroupDelay: 500
                },
                bulletList: false,
                orderedList: false,
                heading: false, // Disable heading in StarterKit to avoid conflicts
            }),
            ListItem,
            CustomBulletedList.configure({
                keepAttributes: true,
            }),
            CustomOrderList.configure({
                keepAttributes: true,
            }),
            SelectionHandlerExtension,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'left',
            }),
            FontFamily.configure({
                types: ['textStyle']
            }),
            // Use the CustomHeading instead of configuring the heading here
            CustomHeading,
            CharacterSpacing,
            // IdentifiedText,
            CustomTextStyle,
            CustomLetterSpacing,
            Capitalization,
            LineSpacing,
            Underline,
            CodeBlock,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    color: 'white'
                }
            }),
            BookmarkMark,
            CommentMark,
            Color,
            Strikethrough,
            Ligature.configure({
                ligatureTypes: {
                    standard: 'common-ligatures',
                    all: 'common-ligatures discretionary-ligatures historical-ligatures contextual',
                    none: 'none'
                }
            }),
            LineNumbers.configure({
                show: false,
                frequency: 5,
                type: 'arabic',
            }),
            Superscript,
            Subscript,            
            NonPrintableCharacters,
            CharacterCount.configure({
                // mode: 'nodeSize',
                wordCounter: (text) => text.split(/\s+/).filter((word) => word !== '').length,
            }),
            ...(withSectionDividers ? [
                SectionDivider.extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(SectionDividerView);
                    },
                }),
                ProtectDividers,
                SectionDividerProtection
            ] : []),
            ...(withEditableFilter ? [EditableFilter] : []),
        ],
        content: {}
    }

    editorConfig.content = {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                attrs: {
                    textAlign: 'left'
                },
                content: [
                    {
                        type: 'text',
                        text: '', // Nodo di testo vuoto
                        marks: [
                            {
                                type: 'textStyle',
                                attrs: {
                                    fontSize: '12pt',
                                    fontFamily: 'Times New Roman',
                                    color: 'black'
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }

    return editorConfig;
}

export { defaultEditorConfig }