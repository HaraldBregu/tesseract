import { Content, Editor, HTMLContent, JSONContent } from "@tiptap/core";
import { useCallback, useRef } from "react";
import { Node } from 'prosemirror-model';
import generateInlineCitationText from "@/utils/generateInlineCitationText";
import { useEditorState } from "@tiptap/react";
import _ from "lodash-es";
import { UseApparatusTextEditorHistoryReturn } from "./use-apparatus-text-editor-history";

interface UseApparatusTextEditorReturn {
    comments: { id: string, content: string }[];
    apparatusEntryNodes: { noteId: string, nodes: Node[], style: ApparatusEntryStyle }[];
    content: JSONContent;
    focus: () => void;
    getJSON: () => JSONContent;
    getHTML: () => HTMLContent;
    setContent: (content: Content) => void;
    setFontFamily: (fontFamily: string) => void;
    setFontSize: (fontSize: string) => void;
    setSuperscript: (superscript: boolean) => void;
    setSubscript: (subscript: boolean) => void;
    setBold: (bold: boolean) => void;
    setItalic: (italic: boolean) => void;
    setUnderline: (underline: boolean) => void;
    setStrikeThrough: (strikeThrough: boolean) => void;
    setTextColor: (color: string) => void;
    setHighlightColor: (color: string) => void;
    addComment: (color: string) => void;
    addReadingSeparator: (data: ReadingSeparator) => void;
    addReadingTypeAdd: (data: ReadingTypeAdd) => void;
    addReadingTypeOm: (data: ReadingTypeOm) => void;
    addReadingTypeTr: (data: ReadingTypeTr) => void;
    addReadingTypeDel: (data: ReadingTypeDel) => void;
    addReadingTypeCustom: (data: string, style: ReadingTypeCustomStyle) => void;
    addSiglum: (siglum: Siglum, highlightColor: string) => void;
    setLink: (link: string) => void;
    removeLink: () => void;
    undo: () => void;
    redo: () => void;
    insertCharacter: (character: number) => void;
    setShowNonPrintingCharacters: (visible: boolean) => void;
    insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style) => void;
    updateReadingSeparator: (readingSeparator: ReadingSeparator) => void;
    updateLemmaStyleAndSeparator: (lemmaStyle: LemmaStyle, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => void;
    updateReadingType: (readingTypeAdd: ReadingTypeAdd, readingTypeOm: ReadingTypeOm, readingTypeTr: ReadingTypeTr, readingTypeDel: ReadingTypeDel) => void;
    scrollToApparatusId: (id: string) => void;
    focusToApparatusId: (id: string) => void;
    getExportData: (apparatusTitle: string, extractReadingData: boolean, readingText: string) => ExportApparatus;
    getInsertedBibliographyEntries: (existingEntries: InsertBibliography[]) => InsertBibliography[];
    insertApparatusEntryFromNodes: (type: string, nodes: Node[], style: Style) => void;
    insertApparatusesEntriesFromNodes: (type: string, nodes: Node[], style: Style) => void;
    updateApparatusEntries: (entries: ApparatusEntryContent[]) => void;
    deleteAllApparatusesEntries: () => void;
    deleteApparatusEntryWithId: (id: string) => void;
    deleteApparatusesEntryWithIds: (ids: string[]) => void;
    getApparatusesIds: () => string[];
    getApparatusesEntriesNodes: () => Node[];
    getApparatusEntryNodesWithId: (id: string) => Node[];
    swapApparatusEntriesInnerOuterMarginType: () => void;
    getApparatusIdFromCommentId: (commentId: string) => string | undefined;
    updateApparatusesLemma: (data: { id: string, content: string }[]) => void;
    getCommentsIds: () => string[];
    scrollToCommentId: (id: string) => void;
    selectCommentId: (id: string) => void;
    unsetCommentsWithIds: (ids: string[]) => void;
    selectAll: () => void;
    deleteSelection: () => void;
    deselectAll: () => void;
    selectedText: () => string;
    currentTextStyle: ApparatusTextStyle;
}

export function useApparatusTextEditor(
    editor: Editor,
    history: UseApparatusTextEditorHistoryReturn,
    emphasis: ApparatusNoteEmphasis,
    textStyle: ApparatusEntryStyle,
): UseApparatusTextEditorReturn {

    const docVersionRef = useRef(0)
    const lastDocRef = useRef(editor.state.doc)

    const selectedText = useCallback(() => {
        const from = editor.state.selection.from
        const to = editor.state.selection.to
        const text = editor.state.doc.textBetween(from, to, ' ');
        return text
    }, [editor])

    const comments = useEditorState({
        editor,
        selector: ({ editor }) => {
            const result: any[] = []
            const { from } = editor.state.selection;
            const $from = editor.state.doc.resolve(from);
            const commentMarksAtCursor = $from.marks().filter(mark => mark.type.name === "comment");
            const commentIds = commentMarksAtCursor.map(mark => mark.attrs?.id).filter(Boolean);

            if (commentIds.length === 0)
                return result;

            const commentMarkRanges = new Map<string, Array<{ from: number; to: number }>>();
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name !== 'text')
                    return true;
                const commentMarks = node.marks.filter(mark => mark.type.name === "comment");
                for (const commentMark of commentMarks) {
                    if (commentMark) {
                        const id = commentMark.attrs?.id;
                        if (id && commentIds.includes(id)) {
                            const markRange = {
                                from: pos,
                                to: pos + node.nodeSize
                            };
                            if (!commentMarkRanges.has(id)) {
                                commentMarkRanges.set(id, []);
                            }
                            commentMarkRanges.get(id)?.push(markRange);
                        }
                    }
                }
                return true;
            });

            for (const [id, ranges] of commentMarkRanges) {
                if (ranges.length > 0) {
                    const firstMark = ranges[0];
                    const lastMark = ranges.reduce(
                        (a, b) => (b.to > a.to ? b : a),
                        ranges[0]
                    );
                    const content = editor.state.doc.textBetween(firstMark.from, lastMark.to, ' ');
                    result.push({ id, content });
                }
            }

            return result
        }
    })

    const apparatusEntryNodes = useEditorState({
        editor,
        selector: ({ editor }) => {
            const apparatusEntryNodes: {
                noteId: string,
                nodes: Node[];
                style: ApparatusEntryStyle;
                version: number;
            }[] = [];

            if (!lastDocRef.current || !editor.state.doc.eq(lastDocRef.current)) {
                docVersionRef.current += 1
                lastDocRef.current = editor.state.doc
            }

            editor.state.doc.descendants((node) => {
                if (node.type.name === 'apparatusEntry') {
                    const noteId = node.attrs.id
                    const paragraph = node.content.content[0]
                    const newcontent = paragraph.content
                    const allnodes = newcontent.content as Node[]
                    const nodes = allnodes.filter(node => node.type.name === 'text'
                        || node.type.name === 'readingSeparator'
                        || node.type.name === 'readingType'
                        || node.type.name === 'siglum')

                    const style = {
                        fontFamily: paragraph.attrs.fontFamily,
                        fontSize: paragraph.attrs.fontSize,
                        fontWeight: paragraph.attrs.fontWeight,
                        fontStyle: paragraph.attrs.fontStyle,
                        color: paragraph.attrs.color,
                    } satisfies ApparatusEntryStyle;

                    apparatusEntryNodes.push({
                        noteId,
                        nodes,
                        style,
                        version: docVersionRef.current,
                    });
                }
                return true;
            });

            const uniqueApparatusEntryNodes: {
                noteId: string,
                nodes: Node[];
                style: ApparatusEntryStyle;
                version: number;
            }[] = [];

            const seenNoteIds = new Set<string>();
            for (const entry of apparatusEntryNodes) {
                if (!seenNoteIds.has(entry.noteId)) {
                    uniqueApparatusEntryNodes.push(entry);
                    seenNoteIds.add(entry.noteId);
                }
            }

            return uniqueApparatusEntryNodes;
        }
    })

    const content = editor.getJSON().content || [];

    const currentTextStyle = useEditorState({
        editor,
        selector: ({ editor }) => {
            const state = editor.view.state;
            const from = state.selection.from;
            const pos = state.doc.resolve(from);
            const currentNode = pos.node();
            const currentNodeAttributes = currentNode.attrs;

            const citationAttributes = editor.getAttributes("citation")

            const bold = editor.isActive("bold")
            const italic = editor.isActive("italic")
            const underline = editor.isActive("underline")
            const strike = editor.isActive("strike")
            const superscript = editor.isActive("superscript")
            const subscript = editor.isActive("subscript")

            const textStyleAttributes = editor.getAttributes("textStyle")
            const highlight = editor.getAttributes("highlight")

            const fontFamily = textStyleAttributes?.fontFamily || currentNodeAttributes.fontFamily || 'Times New Roman'
            const fontSize = textStyleAttributes?.fontSize || currentNodeAttributes.fontSize || '12pt'
            const fontWeight = bold ? 'bold' : (currentNodeAttributes.fontWeight || 'normal');
            const fontStyle = italic ? 'italic' : (currentNodeAttributes.fontStyle || 'normal');
            const color = citationAttributes.color || textStyleAttributes.color || currentNodeAttributes.color || '#000000';
            const highlightColor = highlight.color || '#ffffff';
            const link = editor.getAttributes("link")?.href || '';

            return {
                headingLevel: 0,
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                color,
                highlightColor,
                bold,
                italic,
                underline,
                strikethrough: strike,
                superscript,
                subscript,
                link,
            } satisfies ApparatusTextStyle
        }
    })

    const focus = useCallback(() => {
        editor.commands.focus();
    }, [editor]);

    const getJSON = useCallback(() => {
        return editor.getJSON();
    }, [editor]);

    const getHTML = useCallback(() => {
        return editor.getHTML();
    }, [editor]);

    const setContent = useCallback((content: Content) => {
        editor
            .chain()
            .setMeta('addToHistory', false)
            .setContent(content, true)
            .run();
    }, [editor]);

    const setFontFamily = useCallback((fontFamily: string) => {
        editor
            .chain()
            .focus()
            .setFontFamily(fontFamily)
            .run();
    }, [editor]);

    const setFontSize = useCallback((fontSize: string) => {
        editor
            .chain()
            .focus()
            .setMark("textStyle", {
                fontSize: fontSize,
            })
            .run();
    }, [editor]);

    const setSuperscript = useCallback((superscript: boolean) => {
        editor
            .chain()
            .unsetSubscript()
            .focus()[superscript ? 'setSuperscript' : 'unsetSuperscript']()
            .run();
    }, [editor]);

    const setSubscript = useCallback((subscript: boolean) => {
        editor
            .chain()
            .unsetSuperscript()
            .focus()[subscript ? 'setSubscript' : 'unsetSubscript']()
            .run();
    }, [editor]);

    const setBold = useCallback((bold: boolean) => {
        editor
            .chain()
            .focus()[bold ? 'setBold' : 'unsetBold']()
            .run();
    }, [editor]);

    const setItalic = useCallback((italic: boolean) => {
        editor
            .chain()
            .focus()[italic ? 'setItalic' : 'unsetItalic']()
            .run();
    }, [editor]);

    const setUnderline = useCallback((underline: boolean) => {
        editor
            .chain()
            .focus()[underline ? 'setUnderline' : 'unsetUnderline']()
            .run();
    }, [editor]);

    const setStrikeThrough = useCallback((strikeThrough: boolean) => {
        editor
            .chain()
            .focus()[strikeThrough ? 'setStrike' : 'unsetStrike']()
            .run();
    }, [editor]);

    const setTextColor = useCallback((color: string) => {
        const state = editor.view.state;
        const from = state.selection.from;
        const pos = state.doc.resolve(from);
        const currentNode = pos.node();
        const currentNodeAttributes = currentNode.attrs;

        const textStyleAttributes = editor.getAttributes("textStyle")

        const fontFamily = textStyleAttributes?.fontFamily || currentNodeAttributes.fontFamily || 'Times New Roman'
        const fontSize = textStyleAttributes?.fontSize || currentNodeAttributes.fontSize || '12pt'

        editor
            .chain()
            .focus()
            .setMark('textStyle', {
                color,
                fontFamily,
                fontSize,
            })
            .run();
    }, [editor]);

    const setHighlightColor = useCallback((color: string) => {
        editor
            .chain()
            .focus()
            .setHighlight({ color })
            .run();
    }, [editor]);

    const addComment = useCallback((color: string) => {
        const selection = editor.state.selection;
        if (selection.empty)
            return

        editor
            .chain()
            .focus()
            .setApparatusComment({ highlightColor: color })
            .run();
    }, [editor]);

    const addReadingSeparator = useCallback((readingSeparator: ReadingSeparator) => {
        editor
            .chain()
            .focus()
            .setReadingSeparator(readingSeparator)
            .run();
    }, [editor]);

    const addReadingTypeAdd = useCallback((readingType: ReadingTypeAdd) => {
        editor
            .chain()
            .focus()
            .setReadingTypeAdd(readingType)
            .run();
    }, [editor]);

    const addReadingTypeOm = useCallback((readingType: ReadingTypeOm) => {
        editor
            .chain()
            .focus()
            .setReadingTypeOm(readingType)
            .run();
    }, [editor]);

    const addReadingTypeTr = useCallback((readingType: ReadingTypeTr) => {
        editor
            .chain()
            .focus()
            .setReadingTypeTr(readingType)
            .run();
    }, [editor]);

    const addReadingTypeDel = useCallback((readingType: ReadingTypeDel) => {
        editor
            .chain()
            .focus()
            .setReadingTypeDel(readingType)
            .run();
    }, [editor]);

    const addReadingTypeCustom = useCallback((readingType: string, style: ReadingTypeCustomStyle) => {
        editor
            .chain()
            .focus()
            .setReadingTypeCustom(readingType, style)
            .run();
    }, [editor]);

    const addSiglum = useCallback((siglum: Siglum, highlightColor: string) => {
        const node = editor.schema.nodeFromJSON(siglum.value.content);
        const manuscriptsNode = siglum.manuscripts.contentHtml

        const paragraphs: Node[] = [];
        node.descendants((node: Node) => {
            if (node.type?.name === 'paragraph') {
                paragraphs.push(node);
            }
        });

        const firstParagraph = paragraphs[0];
        const content = firstParagraph.content;

        const siglumNodeList: SiglumNode[] = [];

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
                siglumNodeList.push(siglumNode);
            }
        });

        editor
            .chain()
            .focus()
            .addSiglumNodes(siglumNodeList, highlightColor, manuscriptsNode)
            .run();
    }, [editor]);

    const setLink = useCallback((url: string) => {
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }, [editor]);

    const removeLink = useCallback(() => {
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .unsetLink()
            .run();
    }, [editor]);

    const undo = useCallback(() => {
        history.undo(editor)
    }, [editor]);

    const redo = useCallback(() => {
        history.redo(editor)
    }, [editor]);

    const insertCharacter = useCallback((character: number) => {
        editor
            .chain()
            .focus()
            .insertContent(String.fromCharCode(character))
            .run();
    }, [editor]);

    const setShowNonPrintingCharacters = useCallback((visible: boolean) => {
        editor
            .chain()
            .focus()
            .setShowNonPrintingCharacters(visible);
    }, [editor]);

    const insertCitation = useCallback((citationStyle: CITATION_STYLES, citation: BibReference, style: Style) => {
        if (!citation.id) return;

        editor
            .chain()
            .focus()
            .setCitation(citation, citationStyle, style)
            .insertContent(generateInlineCitationText(citation, citationStyle, false))
            .run();
    }, [editor]);

    const updateReadingSeparator = useCallback((readingSeparator: ReadingSeparator) => {
        editor.state.doc.descendants((node: any, pos) => {
            if (node.type.name === 'readingSeparator') {
                editor
                    .chain()
                    .focus()
                    .setNodeSelection(pos)
                    .updateReadingSeparator(readingSeparator)
                    .run();
            }
        });
    }, [editor]);

    const updateLemmaStyleAndSeparator = useCallback((lemmaStyle: LemmaStyle, fromToSeparator: LemmaFromToSeparator, separator: LemmaSeparator) => {
        editor.state.doc.descendants((node: any, pos) => {
            if (node.type.name === 'lemma') {
                editor
                    .chain()
                    .focus()
                    .setNodeSelection(pos)
                    .updateLemmaStyleAndSeparators(lemmaStyle, fromToSeparator, separator)
                    .run();
            }
        });
    }, [editor]);

    const updateReadingType = useCallback((readingTypeAdd: ReadingTypeAdd, readingTypeOm: ReadingTypeOm, readingTypeTr: ReadingTypeTr, readingTypeDel: ReadingTypeDel) => {
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'readingType') {
                const { readingType, type } = node.attrs;
                switch (type) {
                    case 'tr':
                        if (JSON.stringify(readingTypeTr) !== JSON.stringify(readingType)) {
                            editor
                                .chain()
                                .focus()
                                .setNodeSelection(pos)
                                .updateReadingType(readingTypeTr)
                                .run();
                        }
                        break;
                    case 'om':
                        if (JSON.stringify(readingTypeOm) !== JSON.stringify(readingType)) {
                            editor
                                .chain()
                                .focus()
                                .setNodeSelection(pos)
                                .updateReadingType(readingTypeOm)
                                .run();
                        }
                        break;
                    case 'add':
                        if (JSON.stringify(readingTypeAdd) !== JSON.stringify(readingType)) {
                            editor
                                .chain()
                                .focus()
                                .setNodeSelection(pos)
                                .updateReadingType(readingTypeAdd)
                                .run();
                        }
                        break;
                    case 'del':
                        if (JSON.stringify(readingTypeDel) !== JSON.stringify(readingType)) {
                            editor
                                .chain()
                                .focus()
                                .setNodeSelection(pos)
                                .updateReadingType(readingTypeDel)
                                .run();
                        }
                        break;
                }
            }
        });
    }, [editor]);

    const scrollToApparatusId = useCallback((id: string) => {
        let selectedNodePos: number = 0;

        editor.state.doc.descendants((node: any, pos: number) => {
            const isApparatus = node.type.name === 'apparatusEntry';
            const isApparatusId = node.attrs.id === id;
            if (isApparatus && isApparatusId) {
                selectedNodePos = pos;
            }
        });

        const coords = editor.view.coordsAtPos(selectedNodePos);
        const element = editor.view.dom;

        const scrollTop = coords.top - element.getBoundingClientRect().top + element.scrollTop;

        element.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });

        editor.emit('highlightApparatus', id);
    }, [editor]);

    const focusToApparatusId = useCallback((id: string) => {
        let selectedNodePos: number = 0;
        let selectedNodeEnd: number = 0;

        editor.state.doc.descendants((node: any, pos: number) => {
            const isApparatus = node.type.name === 'apparatusEntry';
            const isApparatusId = node.attrs.id === id;
            if (isApparatus && isApparatusId) {
                selectedNodePos = pos;
                selectedNodeEnd = pos + node.nodeSize - 1;
            }
        });

        editor.chain().setTextSelection(selectedNodeEnd).focus().run();

        const coords = editor.view.coordsAtPos(selectedNodePos);
        const element = editor.view.dom;

        const scrollTop = coords.top - element.getBoundingClientRect().top + element.scrollTop;

        element.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });

        editor.emit('highlightApparatus', id);
    }, [editor]);

    const getExportData = useCallback((apparatusTitle: string, extractReadingData: boolean, readingText: string): ExportApparatus => {
        const data: Record<string, string>[] = [];
        const additionalHeaders: string[] = [];
        let totalReadings = 0;

        editor.state.doc.descendants((node: any) => {
            if (node.type.name === 'apparatusEntry') {
                let nodeReadings = 0;
                const dataDescendants = node.content.content.filter((n: any) => (n.type.name === 'paragraph')).map((n: any) => n.content.content).flat();
                let apparatusEntry = '';
                const readingData: Record<string, string> = {};
                let lemma = '';
                let readingTextData = '';
                let rowReadings = 0;
                dataDescendants.map((n: any, index: number) => {
                    if (n.type.name === 'lemma') {
                        lemma = (n?.attrs?.lemma?.content ?? '');
                        rowReadings = 0;
                    }

                    if (n.type.name === 'readingType') {
                        apparatusEntry += (n?.attrs?.readingType?.content ?? '');
                        readingTextData += (n?.attrs?.readingType?.content ?? '');
                    } else if (n.type.name === 'readingSeparator') {
                        apparatusEntry += (n?.attrs?.readingSeparator?.content ?? '');
                    } else if (n.type.name === 'siglum') {
                        apparatusEntry += (n?.attrs?.siglumNodes ?? []).map((s: any) => s.content).join('');
                        readingTextData += (n?.attrs?.siglumNodes ?? []).map((s: any) => s.content).join('');
                    } else if (n.type.name === 'text') {
                        apparatusEntry += (n?.text ?? '');
                        readingTextData += (n?.text ?? '');
                    } else {
                        readingTextData += (n?.text ?? '');
                    }

                    if (dataDescendants[index + 1]?.type.name === 'readingSeparator' || index === dataDescendants.length - 1) {
                        rowReadings++;
                        readingData[`${readingText.replace('%d%', rowReadings.toString())}`] = readingTextData;
                        readingTextData = '';
                    }

                    if (rowReadings > nodeReadings) {
                        nodeReadings = rowReadings;
                    }
                });

                let rowData = {
                    apparatusType: node.attrs.type,
                    apparatusTitle,
                    apparatusEntry,
                    lemma,
                };

                if (extractReadingData) {
                    rowData = {
                        ...rowData,
                        ...readingData
                    };
                }

                data.push(rowData);

                if (extractReadingData && totalReadings < nodeReadings) {
                    const addReadings = nodeReadings - totalReadings;
                    for (let i = 0; i < addReadings; i++) {
                        additionalHeaders.push(readingText.replace('%d%', (totalReadings + i + 1).toString()));
                    }
                    totalReadings = nodeReadings;
                }
            }
        });

        return {
            additionalHeaders,
            data
        };
    }, [editor]);

    const getInsertedBibliographyEntries = useCallback((existingEntries: InsertBibliography[] = []): InsertBibliography[] => {
        const entryIds: string[] = existingEntries.map(entry => `${entry.bib.id}-${entry.citationStyle}`).filter(id => id !== '');

        editor.state.doc.descendants((node: any) => {
            if (node.isText) {
                const { marks } = node;
                const mark = marks.find(mark => mark.type.name === 'citation');
                if (mark?.attrs?.bibliography) {
                    const { bibliography: bib, citationStyle } = mark.attrs;
                    const entryId = `${bib.id}-${citationStyle}`;
                    if (entryId && !entryIds.includes(entryId)) {
                        existingEntries.push({ bib, citationStyle });
                        entryIds.push(entryId);
                    }
                }
            }
        });

        return existingEntries;
    }, [editor]);

    const insertApparatusEntryFromNodes = useCallback((type: string, nodes: Node[], style: Style) => {
        editor
            .chain()
            .focus()
            .insertApparatusEntryFromNodes(type, nodes, style)
            .run();
    }, [editor]);

    const insertApparatusesEntriesFromNodes = useCallback((type: string, nodes: Node[], style: Style) => {
        nodes.forEach((node) => {
            const paragraph = node.content.content[0];
            const fragment = paragraph.content;
            const fragmentNodes = Array.from(fragment.content);
            editor
                .chain()
                .focus()
                .insertApparatusEntryFromNodes(type, fragmentNodes, style)
                .run();
        });
    }, [editor]);

    const deleteAllApparatusesEntries = useCallback(() => {
        const nodesToDelete: { from: number; to: number }[] = [];

        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'apparatusEntry') {
                nodesToDelete.push({ from: pos, to: pos + node.nodeSize });
            }
        });

        nodesToDelete
            .sort((a, b) => b.from - a.from)
            .forEach(({ from, to }) => {
                editor.chain().focus().deleteRange({ from, to }).run();
            });
    }, [editor]);

    const deleteApparatusEntryWithId = useCallback((id: string) => {
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'apparatusEntry' && node.attrs.id === id) {
                editor
                    .chain()
                    .focus()
                    .setMeta('addToHistory', false)
                    .setNodeSelection(pos)
                    .deleteSelection()
                    .run();
            }
        });
    }, [editor]);

    const deleteApparatusesEntryWithIds = useCallback((ids: string[]) => {
        const nodesToDelete: { from: number; to: number }[] = [];
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'apparatusEntry' && ids.includes(node.attrs.id)) {
                nodesToDelete.push({ from: pos, to: pos + node.nodeSize });
            }
        });
        const nodesToDeleteSorted = nodesToDelete.toSorted((a, b) => b.from - a.from)
        for (const { from, to } of nodesToDeleteSorted) {
            editor.commands.deleteRange({ from, to })
        }
    }, [editor]);

    const getApparatusesIds = useCallback((): string[] => {
        const apparatusesIds: string[] = [];
        editor.state.doc.descendants((node: any) => {
            if (node.type.name === 'apparatusEntry') {
                apparatusesIds.push(node.attrs.id);
            }
            return true;
        });
        return apparatusesIds;
    }, [editor]);

    const getApparatusesEntriesNodes = useCallback((): Node[] => {
        const apparatusEntryNodes: Node[] = [];
        editor.state.doc.descendants((node: any) => {
            if (node.type.name === 'apparatusEntry') {
                apparatusEntryNodes.push(node);
            }
        });
        return apparatusEntryNodes;
    }, [editor]);

    const getApparatusEntryNodesWithId = useCallback((id: string): Node[] => {
        let apparatusEntryNodes: Node[] = [];
        editor.state.doc.descendants((node: any) => {
            if (node.type.name === 'apparatusEntry' && node.attrs.id === id) {
                const paragraph = node.content.content[0];
                const fragment = paragraph.content;
                const nodes = fragment.content;
                apparatusEntryNodes = nodes;
            }
        });
        return apparatusEntryNodes;
    }, [editor]);

    const swapApparatusEntriesInnerOuterMarginType = useCallback(() => {
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'apparatusEntry') {
                const type = node.attrs.type === 'INNER_MARGIN' ? 'OUTER_MARGIN' : 'INNER_MARGIN';
                editor
                    .chain()
                    .setNodeSelection(pos)
                    .updateAttributes('apparatusEntry', {
                        type
                    })
                    .run();
            }
        });
    }, [editor]);

    const getApparatusIdFromCommentId = useCallback((commentId: string): string | undefined => {
        let apparatusId: string | undefined;

        editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
            if (node.marks?.some(mark => mark.type.name === "comment" && mark.attrs.id === commentId)) {
                let currentParent = parent;
                while (currentParent) {
                    if (currentParent.type.name === 'apparatusEntry') {
                        apparatusId = currentParent.attrs.id;
                        return false;
                    }
                    let grandParent: any = null;
                    editor.state.doc.descendants((docNode: any, _: number, docParent: any) => {
                        if (docNode === currentParent && docParent) {
                            grandParent = docParent;
                            return false;
                        }
                        return true;
                    });
                    currentParent = grandParent;
                }
            }
            return true;
        });

        return apparatusId;
    }, [editor]);

    const updateApparatusesLemma = useCallback((data: { id: string, content: string }[]) => {
        if (data.length === 0) return;

        const lemmaNodesWithParents: Array<{
            node: any;
            pos: number;
            parent: any;
            grandParent: any;
        }> = [];

        editor.state.doc.descendants((node: any, pos: number, parent: any) => {
            if (node.type.name === 'lemma') {
                let grandParent: any = null;
                if (parent) {
                    editor.state.doc.descendants((docNode: any, _: number, docParent: any) => {
                        if (docNode === parent && docParent) {
                            grandParent = docParent;
                            return false;
                        }
                        return true;
                    });
                }

                lemmaNodesWithParents.push({
                    node,
                    pos,
                    parent,
                    grandParent
                });
            }
            return true;
        });

        const tr = editor.state.tr;

        lemmaNodesWithParents
            .reverse()
            .forEach(({ node, pos, parent, grandParent }) => {
                if (parent.type.name !== 'paragraph') return;

                const content = data.find(textNote => textNote.id === grandParent.attrs.id)?.content;

                const lemmaNode = editor.schema.nodes.lemma.create({
                    ...node.attrs,
                    lemma: {
                        ...node.attrs.lemma,
                        content,
                    },
                });

                tr.setMeta('addToHistory', false);
                tr.replaceWith(pos, pos + node.nodeSize, lemmaNode);
            });

        editor.view.dispatch(tr);
    }, [editor]);

    const getCommentsIds = useCallback((): string[] => {
        let commentsIds: string[] = [];
        editor.state.doc.descendants((node: any) => {
            const marks = node.marks.filter(mark => mark.type.name === 'comment');
            const data = marks.map(mark => mark.attrs.id);
            commentsIds.push(...data);
            return true;
        });
        return commentsIds;
    }, [editor]);

    const scrollToCommentId = useCallback((id: string) => {
        const positions: { start: number, end: number }[] = [];
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.marks?.some(mark => mark.type.name === "comment" && mark.attrs.id === id)) {
                positions.push({
                    start: pos,
                    end: pos + node.nodeSize
                });
            }
        });

        let pos: { start: number, end: number } | null = null;
        if (positions.length > 0) {
            const minStart = Math.min(...positions.map(p => p.start));
            const maxEnd = Math.max(...positions.map(p => p.end));
            pos = { start: minStart, end: maxEnd };
        }

        if (!pos)
            return;

        editor.commands.focus();
        editor.commands.setTextSelection({ from: pos.start, to: pos.end });
        editor.commands.scrollIntoView();
    }, [editor]);

    const selectCommentId = useCallback((id: string) => {
        const positions: { start: number, end: number }[] = [];
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.marks?.some(mark => mark.type.name === "comment" && mark.attrs.id === id)) {
                positions.push({
                    start: pos,
                    end: pos + node.nodeSize
                });
            }
        });

        if (positions.length === 0) return;

        const minStart = Math.min(...positions.map(p => p.start));
        const maxEnd = Math.max(...positions.map(p => p.end));
        const pos = { start: minStart, end: maxEnd };

        editor.commands.setTextSelection({ from: pos.start, to: pos.end });
        editor.commands.focus();
    }, [editor]);

    const unsetCommentsWithIds = useCallback((ids: string[]) => {
        editor.commands.unsetCommentsWithIds(ids)
    }, [editor]);

    const selectAll = useCallback(() => {
        editor
            .chain()
            .focus()
            .selectAll()
            .run();
    }, [editor]);

    const deselectAll = useCallback(() => {
        if (editor?.isFocused) {
            editor.commands.blur();
        }
    }, [editor]);

    const deleteSelection = useCallback(() => {
        editor
            .chain()
            .focus()
            .deleteSelection()
            .run();
    }, [editor]);

    const debounceUpdateApparatusEntries = _.debounce((entries: ApparatusEntryContent[], textStyle: ApparatusEntryStyle, emphasis: ApparatusNoteEmphasis) => {
        editor.commands.setMeta('addToHistory', false);
        editor.commands.clearContent(true);
        if (entries.length === 0)
            return;

        editor.commands.insertApparatusEntries(entries, textStyle, emphasis);
    }, 500);

    const updateApparatusEntries = useCallback((entries: ApparatusEntryContent[]) => {
        debounceUpdateApparatusEntries(entries, textStyle, emphasis);
    }, [editor, textStyle, emphasis]);

    return {
        comments,
        apparatusEntryNodes,
        content,
        focus,
        getJSON,
        getHTML,
        setContent,
        setFontFamily,
        setFontSize,
        setSuperscript,
        setSubscript,
        setBold,
        setItalic,
        setUnderline,
        setStrikeThrough,
        setTextColor,
        setHighlightColor,
        addComment,
        addReadingSeparator,
        addReadingTypeAdd,
        addReadingTypeOm,
        addReadingTypeTr,
        addReadingTypeDel,
        addReadingTypeCustom,
        addSiglum,
        setLink,
        removeLink,
        undo,
        redo,
        insertCharacter,
        setShowNonPrintingCharacters,
        insertCitation,
        updateReadingSeparator,
        updateLemmaStyleAndSeparator,
        updateReadingType,
        scrollToApparatusId,
        focusToApparatusId,
        getExportData,
        getInsertedBibliographyEntries,
        insertApparatusEntryFromNodes,
        insertApparatusesEntriesFromNodes,
        deleteAllApparatusesEntries,
        deleteApparatusEntryWithId,
        deleteApparatusesEntryWithIds,
        getApparatusesIds,
        getApparatusesEntriesNodes,
        getApparatusEntryNodesWithId,
        swapApparatusEntriesInnerOuterMarginType,
        getApparatusIdFromCommentId,
        updateApparatusesLemma,
        updateApparatusEntries,
        getCommentsIds,
        scrollToCommentId,
        selectCommentId,
        unsetCommentsWithIds,
        selectAll,
        deleteSelection,
        deselectAll,
        selectedText,
        currentTextStyle,
    };
}
