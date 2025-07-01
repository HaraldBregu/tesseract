import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Text from '@tiptap/extension-text'
import { ForwardedRef, forwardRef, HTMLAttributes, memo, useCallback, useImperativeHandle } from "react"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import cn from "@/utils/classNames"
import OneLiner from "../nodes/one-liner-node"
import { ExtendedParagraph } from "../extensions/paragraph-extension"
import CharacterCount from "@tiptap/extension-character-count"
import { defaultExtensionsConfig } from "./constants"
import FontFamily from "@tiptap/extension-font-family"
import TextStyle from "@tiptap/extension-text-style"


export type HTMLRichTextEditorElement = {
    setFontFamily: (fontFamily: string) => void;
    setBold: () => void;
    setItalic: () => void;
    setUnderline: () => void;
    setSuperscript: () => void;
    setSubscript: () => void;
    getHTML: () => string;
    getText: () => string;
    getCharacters: () => number;
    getWords: () => number;
    setFocus: () => void;
    getTextFormatting: () => TextFormatting;
    setContent: (content: string | null | undefined) => void;
    insertContent: (content: string) => void;
}

type RichTextEditorProps = {
    className?: string;
    props?: HTMLAttributes<HTMLDivElement>;
    extensions?: RichTextEditorExtension[];
    characterCountLimit?: number;
    content?: string;
    defaultFontFamily?: string;
    onCreate?: () => void;
    onUpdate?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onSelectionUpdate?: () => void;
}

const RichTextEditor = forwardRef(({
    className,
    props,
    extensions = defaultExtensionsConfig,
    characterCountLimit = Number.MAX_SAFE_INTEGER,
    content,
    defaultFontFamily = "Times New Roman",
    onCreate,
    onFocus,
    onBlur,
    onUpdate,
    onSelectionUpdate,
}: RichTextEditorProps,
    ref: ForwardedRef<HTMLRichTextEditorElement>) => {

    const handleOnCreate = useCallback(() => {
        onCreate?.()
    }, [])

    const handleOnFocus = useCallback(() => {
        onFocus?.()
    }, [])

    const handleOnBlur = useCallback(() => {
        onBlur?.()
    }, [])

    const handleOnUpdate = useCallback(() => {
        onUpdate?.()
    }, [])

    const handleOnSelectionUpdate = useCallback(() => {
        onSelectionUpdate?.()
    }, [])

    const editor = useEditor({
        extensions: [
            ...extensions?.map((extension: RichTextEditorExtension) => {
                switch (extension) {
                    case "STARTER_KIT":
                        return StarterKit.configure({
                            // paragraph: false,
                            // text: false,
                        })
                    case "ONE_LINER":
                        return OneLiner
                    case "CHARACTER_COUNT":
                        return CharacterCount.configure({
                            limit: characterCountLimit,
                        })
                    case "EXTENDED_PARAGRAPH":
                        return ExtendedParagraph
                    case "TEXT":
                        return Text
                    case "TEXT_STYLE":
                        return TextStyle
                    case "UNDERLINE":
                        return Underline
                    case "SUPERSCRIPT":
                        return Superscript
                    case "SUBSCRIPT":
                        return Subscript

                    case "FONT_FAMILY":
                        return FontFamily.configure()
                }
            }) ?? []
        ],
        content: content,
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
        getHTML: () => {
            return editor.getHTML() || ""
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
        setContent: (content: string | null | undefined) => {
            editor.commands.setContent(content ?? "")
        },
        insertContent: (content: string) => {
            editor
                .chain()
                .focus()
                .insertContent(content)
                .run()
        },
        getTextFormatting: handleTextFormatting
    }))

    return (
        <EditorContent
            editor={editor}
            className={cn("!bg-white h-full !p-0 !m-0 rounded-sm", className)}
            {...props}
        />
    )
})

export default memo(RichTextEditor)