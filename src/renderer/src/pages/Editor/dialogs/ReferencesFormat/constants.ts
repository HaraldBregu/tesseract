export const separators = [
    { key: "lemma_separator", label: "referencesFormat.lemmaSeparator" },
    { key: "from_to_separator", label: "referencesFormat.fromToSeparator" },
    { key: "readings_separator", label: "referencesFormat.readingsSeparator" },
    { key: "apparatus_separator", label: "referencesFormat.apparatusSeparator" },
];

export const readingTypes = [
    { key: "add_reading_type", label: "referencesFormat.addReadingType" },
    { key: "om_reading_type", label: "referencesFormat.omReadingType" },
    { key: "tr_reading_type", label: "referencesFormat.trReadingType" },
    { key: "del_reading_type", label: "referencesFormat.delReadingType" },
];

export const separatorOptions = {
    lemma_separator: [
        { value: "none", label: "referencesFormat.separator.none" },
        { value: " ]", label: "referencesFormat.separator.bracket" },
    ],
    from_to_separator: [
        { value: "none", label: "referencesFormat.separator.none" },
        { value: " -", label: "referencesFormat.separator.dash" },
    ],
    readings_separator: [
        { value: "none", label: "referencesFormat.separator.none" },
        { value: " :", label: "referencesFormat.separator.colon" },
    ],
    apparatus_separator: [
        { value: "none", label: "referencesFormat.separator.none" },
        { value: " ;", label: "referencesFormat.separator.semicolon" },
    ],
}

export const guideColors = [
    { key: "lemma_color", label: 'referencesFormat.guide.lemma' },
    { key: "sigla_color", label: 'referencesFormat.guide.sigla' },
    { key: "reading_type_separator_color", label: 'referencesFormat.guide.readingTypeSeparator' },
    { key: "comments_color", label: 'referencesFormat.guide.comments' },
    { key: "bookmarks_color", label: 'referencesFormat.guide.bookmarks' },
];

export const highlightColors = [
    { key: "none", label: "referencesFormat.highlight.none", value: "#fafafa" },
    { key: "pink", label: "referencesFormat.highlight.pink", value: "#ffc7ff" },
    { key: "yellow", label: "referencesFormat.highlight.yellow", value: "#fbffb3" },
    { key: "blue", label: "referencesFormat.highlight.blue", value: "#98a5ff" },
    { key: "gray", label: "referencesFormat.highlight.gray", value: "#e5e5e5" },
    { key: "mint", label: "referencesFormat.highlight.mint", value: "#99eed2" }
];

export const NUMERATION_OPTIONS = [
    { value: "whole", label: "referencesFormat.numeration.whole" },
    { value: "page", label: "referencesFormat.numeration.page" },
    { value: "section", label: "referencesFormat.numeration.section" },
];

export const SECTION_LEVELS = [
    { value: "1", label: "referencesFormat.sectionLevel.1" },
    { value: "2", label: "referencesFormat.sectionLevel.2" },
    { value: "3", label: "referencesFormat.sectionLevel.3" },
    { value: "4", label: "referencesFormat.sectionLevel.4" },
    { value: "5", label: "referencesFormat.sectionLevel.5" },
];