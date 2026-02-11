import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadApparatuses as loadApparatusesAction } from "../store/editor/editor.slice";
import { useDispatch, useSelector } from "react-redux";
import { useDocumentAPI } from "@/hooks/use-electron";
import { selectApparatuses, selectVisibleApparatuses } from "../store/editor/editor.selector";
import { useEditor } from "./use-editor";
import { DEFAULT_APP_LEM_STYLE } from "@/utils/constants";
import { Mark } from '@tiptap/pm/model';
import { Editor } from "@tiptap/react";

interface UseMainResult {
    apparatuses: Apparatus[];
    visibleApparatuses: Apparatus[];
    documentApparatuses: DocumentApparatus[];
    loadApparatuses: () => Promise<Apparatus[]>;
    loadDocumentApparatuses: () => Promise<DocumentApparatus[]>;
    lemmaStyle: LemmaStyle;
    apparatusEntryStyleCriticalType: ApparatusEntryStyle;
    criticalNotesEmphasis: ApparatusNoteEmphasis;
    apparatusEntryStyleOuterMarginInnerMarginType: ApparatusEntryStyle;
    marginNotesEmphasis: ApparatusNoteEmphasis;
    apparatusEntryStylePageNotesType: ApparatusEntryStyle;
    pageNotesEmphasis: ApparatusNoteEmphasis;
    apparatusEntryStyleSectionNotesType: ApparatusEntryStyle;
    sectionNotesEmphasis: ApparatusNoteEmphasis;
    lemmaFromToSeparatorStyle: LemmaFromToSeparatorStyle;
    lemmaFromToSeparator: LemmaFromToSeparator;
    lemmaSeparator: LemmaSeparator;
    readingSeparator: ReadingSeparator;
    readingTypeAdd: ReadingTypeAdd;
    readingTypeOm: ReadingTypeOm;
    readingTypeTr: ReadingTypeTr;
    readingTypeDel: ReadingTypeDel;
    readingTypes: ReadingType[];
    readingTypeCustomStyle: ReadingTypeCustomStyle;
    lemmaSeparatorStyle: LemmaSeparatorStyle;
    fromToSeparatorReferenceFormat: ReferenceFormatChar;
    lemmaSeparatorReferenceFormat: ReferenceFormatChar;
    marginNotesStyle: ApparatusEntryStyle;
    siglumColorReferenceFormat: string;
    statusBarVisible: boolean;
    toolbarIsVisible: boolean;
    apparatusNoteStyle: ((apparatusType: ApparatusType) => ApparatusEntryStyle)
    apparatusNoteEmphasis: (apparatusType: ApparatusType) => ApparatusNoteEmphasis
    copyStyle: (editor?: Editor) => void;
    pasteStyle: (editor?: Editor) => void;
    lemmaColor: string;
}

export function useMain(): UseMainResult {
    const [state] = useEditor()
    const documentAPI = useDocumentAPI();
    const dispatch = useDispatch();
    const apparatuses = useSelector(selectApparatuses)
    const visibleApparatuses = useSelector(selectVisibleApparatuses);
    const [documentApparatuses, setDocumentApparatuses] = useState<DocumentApparatus[]>([])

    const style = useRef<{ marks: Mark[] } | null>(null);

    const copyStyle = useCallback((editor?: Editor) => {
        if (!editor)
            return;
        const { from, to } = editor.state.selection;

        const marks: Mark[] = [];
        editor.state.doc.nodesBetween(from, to, (node, _pos) => {
            const nodeMarks = node.marks;
            if (nodeMarks) {
                marks.push(...nodeMarks);
            }
        });

        style.current = { marks };
    }, []);

    const pasteStyle = useCallback((editor?: Editor) => {
        const marks = style.current?.marks;
        if (!editor || !marks)
            return;
        marks.forEach(mark => {
            editor
                .chain()
                .focus()
                .setMark(mark.type, mark.attrs)
                .run();
        });
    }, []);

    const siglumColorReferenceFormat = useMemo(() => state.referenceFormat.sigla_color, [state.referenceFormat.sigla_color])
    const statusBarVisible = useMemo(() => state.statusBarVisible, [state.statusBarVisible]);
    const toolbarIsVisible = useMemo(() => state.toolbarVisible, [state.toolbarVisible])

    const loadDocumentApparatuses = useCallback(async (): Promise<DocumentApparatus[]> => {
        const documentApparatuses = await documentAPI.getApparatuses()
        setDocumentApparatuses(documentApparatuses)
        return documentApparatuses
    }, [documentAPI])

    const loadApparatuses = useCallback(async (): Promise<Apparatus[]> => {
        setDocumentApparatuses([])
        const documentApparatuses = await loadDocumentApparatuses()
        const apparatuses = documentApparatuses.map((apparatus) => ({
            id: apparatus.id,
            title: apparatus.title,
            type: apparatus.type,
            visible: apparatus.visible ?? true,
            expanded: apparatus.expanded ?? true,
            notesVisible: apparatus.notesVisible ?? true,
            commentsVisible: apparatus.commentsVisible ?? true,
        })) as Apparatus[];

        dispatch(loadApparatusesAction(apparatuses))
        return apparatuses
    }, [documentAPI, loadDocumentApparatuses])

    useEffect(() => {
        loadDocumentApparatuses()
            .then((documentApparatuses) => {
                const apparatuses = documentApparatuses.map((apparatus) => ({
                    id: apparatus.id,
                    title: apparatus.title,
                    type: apparatus.type,
                    visible: apparatus.visible ?? true,
                    expanded: apparatus.expanded ?? true,
                    notesVisible: apparatus.notesVisible ?? true,
                    commentsVisible: apparatus.commentsVisible ?? true,
                })) as Apparatus[];
                dispatch(loadApparatusesAction(apparatuses))
            })
    }, [])

    const apparatusStyle = useMemo(() => state.styles.find(style => style.type === "APP_LEM") ?? {} as Style, [state.styles])
    const lemmaColor = useMemo(() => state.referenceFormat.lemma_color, [state.referenceFormat.lemma_color])
    const lemmaStyle = useMemo(() => ({
        fontFamily: apparatusStyle?.fontFamily || DEFAULT_APP_LEM_STYLE.fontFamily,
        fontSize: apparatusStyle?.fontSize || DEFAULT_APP_LEM_STYLE.fontSize,
        textColor: apparatusStyle?.color || DEFAULT_APP_LEM_STYLE.color,
        highlightColor: lemmaColor,
        bold: apparatusStyle.bold,
        italic: apparatusStyle.italic,
    } satisfies LemmaStyle), [apparatusStyle, lemmaColor])

    const fromToSeparatorReferenceFormat = useMemo(() => state.referenceFormat.from_to_separator, [state.referenceFormat.from_to_separator])

    const criticalNotesStyleSelector = useMemo(() => state.styles.find(style => style.type === "APP_VAR") ?? {} as Style, [state.styles])
    const pageNotesStyleSelector = useMemo(() => state.styles.find(style => style.type === "PAGE_NOTE") ?? {} as Style, [state.styles])
    const sectionNotesStyleSelector = useMemo(() => state.styles.find(style => style.type === "SECTION_NOTE") ?? {} as Style, [state.styles])
    const marginNotesStyleSelector = useMemo(() => state.styles.find(style => style.type === "MARGIN_NOTES") ?? {} as Style, [state.styles])
    const readingSeparatorReferenceFormat = useMemo(() => state.referenceFormat.readings_separator, [state.referenceFormat.readings_separator])
    const readingTypeAddReferenceFormat = useMemo(() => state.referenceFormat.add_reading_type, [state.referenceFormat.add_reading_type])
    const readingTypeOmReferenceFormat = useMemo(() => state.referenceFormat.om_reading_type, [state.referenceFormat.om_reading_type])
    const readingTypeTrReferenceFormat = useMemo(() => state.referenceFormat.tr_reading_type, [state.referenceFormat.tr_reading_type])
    const readingTypeDelReferenceFormat = useMemo(() => state.referenceFormat.del_reading_type, [state.referenceFormat.del_reading_type])

    // CRITICAL NOTES 
    
    const apparatusEntryStyleCriticalType = useMemo(() => ({
        fontFamily: criticalNotesStyleSelector.fontFamily,
        fontSize: criticalNotesStyleSelector.fontSize,
        color: criticalNotesStyleSelector.color,
        fontWeight: 'normal',
        fontStyle: 'normal',
    } satisfies ApparatusEntryStyle), [criticalNotesStyleSelector])

    const criticalNotesEmphasis = useMemo(() => ({
        bold: criticalNotesStyleSelector.bold,
        italic: criticalNotesStyleSelector.italic,
        underline: criticalNotesStyleSelector.underline,
    } satisfies ApparatusNoteEmphasis), [criticalNotesStyleSelector])

    // OUTER MARGIN INNER MARGIN 

    const apparatusEntryStyleOuterMarginInnerMarginType = useMemo(() => ({
        fontFamily: marginNotesStyleSelector.fontFamily,
        fontSize: marginNotesStyleSelector.fontSize,
        color: marginNotesStyleSelector.color,
        fontWeight: 'normal',
        fontStyle: 'normal',
    } satisfies ApparatusEntryStyle), [marginNotesStyleSelector])

    const marginNotesEmphasis = useMemo(() => ({
        bold: marginNotesStyleSelector.bold,
        italic: marginNotesStyleSelector.italic,
        underline: marginNotesStyleSelector.underline,
    } satisfies ApparatusNoteEmphasis), [marginNotesStyleSelector])

    // PAGE NOTES 

    const apparatusEntryStylePageNotesType = useMemo(() => ({
        fontFamily: pageNotesStyleSelector.fontFamily,
        fontSize: pageNotesStyleSelector.fontSize,
        color: pageNotesStyleSelector.color,
        fontWeight: 'normal',
        fontStyle: 'normal',
    } satisfies ApparatusEntryStyle), [pageNotesStyleSelector])

    const pageNotesEmphasis = useMemo(() => ({
        bold: pageNotesStyleSelector.bold,
        italic: pageNotesStyleSelector.italic,
        underline: pageNotesStyleSelector.underline,
    } satisfies ApparatusNoteEmphasis), [pageNotesStyleSelector])

    // SECTION NOTES 

    const apparatusEntryStyleSectionNotesType = useMemo(() => ({
        fontFamily: sectionNotesStyleSelector.fontFamily,
        fontSize: sectionNotesStyleSelector.fontSize,
        color: sectionNotesStyleSelector.color,
        fontWeight: 'normal',
        fontStyle: 'normal',
    } satisfies ApparatusEntryStyle), [sectionNotesStyleSelector])

    const sectionNotesEmphasis = useMemo(() => ({
        bold: sectionNotesStyleSelector.bold,
        italic: sectionNotesStyleSelector.italic,
        underline: sectionNotesStyleSelector.underline,
    } satisfies ApparatusNoteEmphasis), [sectionNotesStyleSelector])

    const fromToSeparator = useMemo(() => state.referenceFormat.from_to_separator, [state.referenceFormat.from_to_separator])
    const lemmaSeparatorReferenceFormat = useMemo(() => state.referenceFormat.lemma_separator, [state.referenceFormat.lemma_separator])
    const readingTypesSeparatorColor = useMemo(() => state.referenceFormat.reading_type_separator_color, [state.referenceFormat.reading_type_separator_color])

    const lemmaFromToSeparatorStyle = useMemo(() => ({
        bold: fromToSeparator.bold,
        italic: fromToSeparator.italic,
        underline: fromToSeparator.underline,
    } satisfies LemmaFromToSeparatorStyle), [fromToSeparator])

    const lemmaFromToSeparator = useMemo(() => ({
        content: fromToSeparator.value || '',
        style: lemmaFromToSeparatorStyle,
    } satisfies LemmaFromToSeparator), [fromToSeparator, lemmaFromToSeparatorStyle])

    const lemmaSeparatorStyle = useMemo(() => ({
        bold: lemmaSeparatorReferenceFormat.bold,
        italic: lemmaSeparatorReferenceFormat.italic,
        underline: lemmaSeparatorReferenceFormat.underline,
    } satisfies LemmaSeparatorStyle), [lemmaSeparatorReferenceFormat])

    const lemmaSeparator = useMemo(() => ({
        content: lemmaSeparatorReferenceFormat.value || '',
        style: lemmaSeparatorStyle
    } satisfies LemmaSeparator), [lemmaSeparatorReferenceFormat, lemmaSeparatorStyle])

    const readingSeparatorStyle = useMemo(() => ({
        bold: readingSeparatorReferenceFormat.bold,
        italic: readingSeparatorReferenceFormat.italic,
        underline: readingSeparatorReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingSeparatorStyle), [readingSeparatorReferenceFormat, readingTypesSeparatorColor])

    const readingSeparator = useMemo(() => ({
        content: readingSeparatorReferenceFormat.value || '',
        style: readingSeparatorStyle
    } satisfies ReadingSeparator as ReadingSeparator), [readingSeparatorReferenceFormat, readingSeparatorStyle])

    const readingTypeAddStyle = useMemo(() => ({
        bold: readingTypeAddReferenceFormat.bold,
        italic: readingTypeAddReferenceFormat.italic,
        underline: readingTypeAddReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingTypeAddStyle), [readingTypeAddReferenceFormat, readingTypesSeparatorColor])

    const readingTypeAdd = useMemo(() => ({
        content: readingTypeAddReferenceFormat.value,
        style: readingTypeAddStyle
    } satisfies ReadingTypeAdd as ReadingTypeAdd), [readingTypeAddReferenceFormat, readingTypeAddStyle])

    const readingTypeOmStyle = useMemo(() => ({
        bold: readingTypeOmReferenceFormat.bold,
        italic: readingTypeOmReferenceFormat.italic,
        underline: readingTypeOmReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingTypeOmStyle), [readingTypeOmReferenceFormat, readingTypesSeparatorColor])

    const readingTypeOm = useMemo(() => ({
        content: readingTypeOmReferenceFormat.value,
        style: readingTypeOmStyle
    } satisfies ReadingTypeOm as ReadingTypeOm), [readingTypeOmReferenceFormat, readingTypeOmStyle])

    const readingTypeTrStyle = useMemo(() => ({
        bold: readingTypeTrReferenceFormat.bold,
        italic: readingTypeTrReferenceFormat.italic,
        underline: readingTypeTrReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingTypeTrStyle), [readingTypeTrReferenceFormat, readingTypesSeparatorColor])

    const readingTypeTr = useMemo(() => ({
        content: readingTypeTrReferenceFormat.value,
        style: readingTypeTrStyle
    } satisfies ReadingTypeTr as ReadingTypeTr), [readingTypeTrReferenceFormat, readingTypeTrStyle])

    const readingTypeDelStyle = useMemo(() => ({
        bold: readingTypeDelReferenceFormat.bold,
        italic: readingTypeDelReferenceFormat.italic,
        underline: readingTypeDelReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingTypeDelStyle), [readingTypeDelReferenceFormat, readingTypesSeparatorColor])

    const readingTypeDel = useMemo(() => ({
        content: readingTypeDelReferenceFormat.value,
        style: readingTypeDelStyle
    } satisfies ReadingTypeDel as ReadingTypeDel), [readingTypeDelReferenceFormat, readingTypeDelStyle])

    const readingTypes = useMemo(() => {
        return [readingTypeAdd, readingTypeOm, readingTypeTr, readingTypeDel] as ReadingType[]
    }, [readingTypeAdd, readingTypeOm, readingTypeTr, readingTypeDel])

    const readingTypeCustomStyle = useMemo(() => ({
        bold: readingTypeAddReferenceFormat.bold,
        italic: readingTypeAddReferenceFormat.italic,
        underline: readingTypeAddReferenceFormat.underline,
        highlightColor: readingTypesSeparatorColor,
    } satisfies ReadingTypeCustomStyle), [readingTypeAddReferenceFormat, readingTypesSeparatorColor])

    const marginNotesStyle = useMemo(() => ({
        fontFamily: marginNotesStyleSelector?.fontFamily || '',
        fontWeight: marginNotesStyleSelector?.fontWeight === 'bold' ? 'bold' : 'normal',
        fontStyle: marginNotesStyleSelector?.fontWeight === 'italic' ? 'italic' : 'normal',
        fontSize: marginNotesStyleSelector?.fontSize || '',
        color: marginNotesStyleSelector?.color || '',
    } satisfies ApparatusEntryStyle), [marginNotesStyleSelector])

    const apparatusNoteStyle = useCallback((apparatusType: ApparatusType): ApparatusEntryStyle => {
        switch (apparatusType) {
            case "text":
            case "CRITICAL":
                return apparatusEntryStyleCriticalType
            case "INNER_MARGIN":
            case "OUTER_MARGIN":
                return apparatusEntryStyleOuterMarginInnerMarginType
            case "PAGE_NOTES":
                return apparatusEntryStylePageNotesType
            case "SECTION_NOTES":
                return apparatusEntryStyleSectionNotesType
        }
    }, [apparatusEntryStyleCriticalType, apparatusEntryStyleOuterMarginInnerMarginType, apparatusEntryStylePageNotesType, apparatusEntryStyleSectionNotesType])

    const apparatusNoteEmphasis = useCallback((apparatusType: ApparatusType): ApparatusNoteEmphasis => {
        switch (apparatusType) {
            case "text":
            case "CRITICAL":
                return criticalNotesEmphasis
            case "INNER_MARGIN":
            case "OUTER_MARGIN":
                return marginNotesEmphasis
            case "PAGE_NOTES":
                return pageNotesEmphasis
            case "SECTION_NOTES":
                return sectionNotesEmphasis
        }
    }, [criticalNotesEmphasis, marginNotesEmphasis, pageNotesEmphasis, sectionNotesEmphasis])



    return {
        apparatuses,
        visibleApparatuses,
        documentApparatuses,
        loadApparatuses,
        loadDocumentApparatuses,
        lemmaStyle,
        apparatusEntryStyleCriticalType,
        criticalNotesEmphasis,
        apparatusEntryStyleOuterMarginInnerMarginType,
        marginNotesEmphasis,
        apparatusEntryStylePageNotesType,
        pageNotesEmphasis,
        apparatusEntryStyleSectionNotesType,
        sectionNotesEmphasis,
        lemmaFromToSeparator,
        lemmaSeparator,
        readingSeparator,
        readingTypeAdd,
        readingTypeOm,
        readingTypeTr,
        readingTypeDel,
        readingTypes,
        readingTypeCustomStyle,
        lemmaFromToSeparatorStyle,
        lemmaSeparatorStyle,
        fromToSeparatorReferenceFormat,
        lemmaSeparatorReferenceFormat,
        marginNotesStyle,
        siglumColorReferenceFormat,
        statusBarVisible,
        toolbarIsVisible,
        apparatusNoteStyle,
        apparatusNoteEmphasis,
        copyStyle,
        pasteStyle,
        lemmaColor,
    };
}

