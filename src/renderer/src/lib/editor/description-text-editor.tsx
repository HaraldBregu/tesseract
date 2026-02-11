import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Text from '@tiptap/extension-text'
import { ForwardedRef, forwardRef, HTMLAttributes, memo, useCallback, useImperativeHandle } from "react"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import cn from "@/utils/classNames"
import Paragraph from "@tiptap/extension-paragraph"
import CharacterCount from "@tiptap/extension-character-count"
import FontFamily from "@tiptap/extension-font-family"
import TextStyle from "@tiptap/extension-text-style"
import Italic from '@tiptap/extension-italic'
import Bold from '@tiptap/extension-bold'
import Siglum from "./extensions/siglum"
import { Node } from "@tiptap/pm/model"


export type HTMLDescriptionTextEditorElement = {
    setFontFamily: (fontFamily: string) => void;
    setFontSize: (fontSize: string) => void;
    setBold: () => void;
    setItalic: () => void;
    setUnderline: () => void;
    setSuperscript: () => void;
    setSubscript: () => void;
    insertSiglum: (siglum: Siglum, highlightColor: string) => void;
    getHTML: () => string;
    getJSON: () => unknown;
    getContentJSON: () => unknown;
    getText: () => string;
    getCharacters: () => number;
    getWords: () => number;
    setFocus: () => void;
    getTextFormatting: () => TextFormatting;
    setContent: (content: string | unknown | null | undefined) => void;
    insertContent: (content: string | unknown) => void;
}

type DescriptionTextEditorProps = {
    className?: string;
    props?: HTMLAttributes<HTMLDivElement>;
    characterCountLimit?: number;
    content?: string | unknown;
    defaultFontFamily?: string;
    onCreate?: () => void;
    onUpdate?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onSelectionUpdate?: () => void;
}

const DescriptionTextEditor = forwardRef(({
    className,
    props,
    characterCountLimit = Number.MAX_SAFE_INTEGER,
    content,
    defaultFontFamily = "Times New Roman",
    onCreate,
    onFocus,
    onBlur,
    onUpdate,
    onSelectionUpdate,
}: DescriptionTextEditorProps,
    ref: ForwardedRef<HTMLDescriptionTextEditorElement>) => {

    const handleOnCreate = useCallback(() => {
        onCreate?.()
    }, [onCreate])

    const handleOnFocus = useCallback(() => {
        onFocus?.()
    }, [onFocus])

    const handleOnBlur = useCallback(() => {
        onBlur?.()
    }, [onBlur])

    const handleOnUpdate = useCallback(() => {
        onUpdate?.()
    }, [onUpdate])

    const handleOnSelectionUpdate = useCallback(() => {
        onSelectionUpdate?.()
    }, [onSelectionUpdate])

    const extensions = [
        Document,
        Paragraph.configure({
            HTMLAttributes: {
                class: "!p-0 !m-0",
            }
        }),
        Text,
        TextStyle.extend({
            addAttributes() {
                return {
                    ...this.parent?.(),
                    fontSize: {
                        default: '12pt',
                        parseHTML: element => element.style.fontSize,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`
                            }
                        }
                    },
                }
            },
        }),
        Italic,
        Bold,
        Underline,
        Superscript,
        Subscript,
        FontFamily,
        CharacterCount.configure({
            limit: characterCountLimit,
        }),
        Siglum,
    ]

    const editor = useEditor({
        extensions: extensions,
        content: content as object,
        onCreate: handleOnCreate,
        onFocus: handleOnFocus,
        onBlur: handleOnBlur,
        onUpdate: handleOnUpdate,
        onSelectionUpdate: handleOnSelectionUpdate
    })

    if (!editor)
        throw new Error("Editor not initialized")

    const handleTextFormatting = useCallback(() => {
        const textFormatting: TextFormatting = {
            fontFamily: editor.getAttributes("textStyle").fontFamily || defaultFontFamily,
            fontSize: editor.getAttributes("textStyle").fontSize,
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strikethrough: editor.isActive("strikethrough"),
            superscript: editor.isActive("superscript"),
            subscript: editor.isActive("subscript"),
        }
        return textFormatting
    }, [editor])

    useImperativeHandle(ref, () => ({
        setFontFamily: (fontFamily: string) => {
            editor
                .chain()
                .focus()
                .setFontFamily(fontFamily)
                .run();
        },
        setFontSize: (fontSize: string) => {
            editor
                .chain()
                .focus()
                .setMark("textStyle", {
                    fontSize: fontSize,
                })
                .run();
        },
        setBold: () => {
            editor
                .chain()
                .focus()
                .toggleBold()
                .run()
        },
        setItalic: () => {
            editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
        },
        setUnderline: () => {
            editor
                .chain()
                .focus()
                .toggleUnderline()
                .run()
        },
        setSuperscript: () => {
            editor
                .chain()
                .focus()
                .toggleSuperscript()
                .run()
        },
        setSubscript: () => {
            editor
                .chain()
                .focus()
                .toggleSubscript()
                .run()
        },
        insertSiglum: (siglum: Siglum, highlightColor: string) => {
            const node = editor.schema.nodeFromJSON(siglum.value.content)

            const paragraphs: Node[] = [];
            node.descendants((node: Node) => {
                if (node.type && node.type.name === 'paragraph') {
                    paragraphs.push(node);
                }
            });

            const firstParagraph = paragraphs[0];
            const content = firstParagraph.content;

            const siglumNodeList: SiglumNode[] = []
            content.forEach((node) => {
                if (node.type && node.text && node.type.name === 'text') {
                    const textStyleAttrs = node.marks.find(mark => mark.type.name === 'textStyle')?.attrs
                    const siglumNode = {
                        content: node.text,
                        style: {
                            fontFamily: textStyleAttrs?.fontFamily ?? 'Times New Roman',
                            fontSize: textStyleAttrs?.fontSize,
                            superscript: node.marks?.some(mark => mark.type.name === 'superscript'),
                            subscript: node.marks?.some(mark => mark.type.name === 'subscript'),
                            bold: node.marks?.some(mark => mark.type.name === 'bold'),
                            italic: node.marks?.some(mark => mark.type.name === 'italic'),
                            underline: node.marks?.some(mark => mark.type.name === 'underline'),
                        }
                    } satisfies SiglumNode as SiglumNode
                    siglumNodeList.push(siglumNode)
                }
            })

            editor
                .chain()
                .focus()
                .addSiglumNodes(siglumNodeList, highlightColor)
                .run()
        },
        getHTML: () => {
            return editor.getHTML() || ""
        },
        getJSON: () => {
            return editor.getJSON() || ""
        },
        getContentJSON: () => {
            return editor.state.doc.content.toJSON() || ""
        },
        getText: () => {
            return editor.getText() || ""
        },
        getCharacters: () => {
            return editor.storage.characterCount.characters()
        },
        getWords: () => {
            return editor.storage.characterCount.words()
        },
        setFocus: () => {
            editor.view.dom.focus()
        },
        setContent: (content: string | unknown | null | undefined) => {
            editor.commands.setContent(content ?? null)
        },
        insertContent: (content: string | unknown) => {
            editor
                .chain()
                .focus()
                .insertContent(content as object)
                .run()
        },
        getTextFormatting: handleTextFormatting
    }))

    return (
        <EditorContent
            editor={editor}
            className={cn("!bg-white h-full !p-0 !m-0 !rounded-md !border-[1px]", className)}
            {...props}
        />
    )
})

export default memo(DescriptionTextEditor)