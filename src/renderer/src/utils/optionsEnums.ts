type FontSizes = number[];
type Color = string[];

interface SectionType {
    label: string;
    value: number;
}

interface FontFamilyType {
    label: string;
    value: string;
}

interface NumberFormat {
    label: string;
    value: string;
}

// Definire le costanti per i valori comuni
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 96;
// const DEFAULT_FONT_SIZE = 12;
const DEFAULT_LINE_SPACING = '1';

const numberFormat: NumberFormat[] = [
    { label: 'pageNumber.format.arab', value: '1' },
    { label: 'pageNumber.format.arab-to', value: '2' },
    { label: 'pageNumber.format.roman', value: '3' },
    { label: 'pageNumber.format.roman-to', value: '4' },
    { label: 'pageNumber.format.lowerRoman', value: '5' },
    { label: 'pageNumber.format.lowerRoman-to', value: '6' },
]

const tabLeaderFormat = [
    { label: 'tableOfContents.settings.none', value: '0' },
    { label: '..........', value: '1' },
    { label: '----------', value: '2' },
    { label: '__________', value: '3' },
]

const numberSeparator = [
    { label: 'tableOfContents.settings.none', value: '0' },
    { label: ')', value: '1' },
    { label: '.', value: '2' },
    { label: '-', value: '3' },
]

const levelFormat = [
    { label: '1,2,3', value: '1' },
    { label: 'a,b,c', value: '2' },
    { label: 'A,B,C', value: '3' },
    { label: 'i,ii,iii', value: '4' },
    { label: 'I,II,III', value: '5' },
]

const sectionDividerLabels: Record<SectionTypes, string> = {
    introduction: 'dividerSection.introduction',
    toc: 'dividerSection.toc',
    maintext: 'dividerSection.maintext',
    bibliography: 'dividerSection.bibliography',
    appendix: 'dividerSection.appendix'
};

const fontSizes: FontSizes = [
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    32,
    36,
    40,
    48,
    56,
    64,
    72,
    80,
    88,
    96,
    104,
    112,
    120,
    128,
];

export const siglumFontSizes: FontSizes = [
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    32,
    36,
    40,
];

const sectionTypes: SectionType[] = [
    { label: "editor.sectionTypes.title", value: 1 },
    { label: "editor.sectionTypes.heading", value: 2 },
    { label: "editor.sectionTypes.heading2", value: 3 },
    { label: "editor.sectionTypes.heading3", value: 4 },
    { label: "editor.sectionTypes.heading4", value: 5 },
    { label: "editor.sectionTypes.heading5", value: 6 },
    { label: "editor.sectionTypes.body", value: 0 },
    // { label: "editor.sectionTypes.note", value: -1 },

    // { label: "editor.sectionTypes.heading6", value: 6 },
    // { label: "editor.sectionTypes.footerHeader", value: -2 },
];

const fontFamilies: FontFamilyType[] = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Fira Code", value: "Fira Code" },
    { label: "Cascadia Code", value: "Cascadia Code" },
    { label: "Roboto", value: "Roboto" },
    { label: "Source Serif Pro", value: "Source Serif Pro" },
    { label: "EB Garamond", value: "EB Garamond" },
    { label: "Literata", value: "Literata" },
    { label: "Libre Baskerville", value: "Libre Baskerville" },
    { label: "Cormorant", value: "Cormorant" },
    { label: "Lora", value: "Lora" },
    { label: "Merriweather", value: "Merriweather" },
];


const HighlightColors: Color = [
    "#FFFF99", "#99FFFF", "#FF99FF", "#9999FF",
    "#FF9999", "#6666CC", "#66CC66", "#CC66CC",
    "#D96666", "#CCCC66", "#E0E0E0", "#808080"
]

const textFormatColors: Color = [
    // Neutrals:
    "#000000", // Black
    "#333333", // Dark Gray
    "#808080", // Gray
    "#999999", // Gray
    "#C0C0C0", // Silver
    "#F2F2F2", // Very Light Gray

    // Reds:
    "#993300", // Reddish Brown
    "#800000", // Maroon
    "#FF0000", // Red
    "#C0504D", // Brick Red

    // Oranges:
    "#FF6600", // Orange
    "#FF9900", // Vivid Orange
    "#F79646", // Orange-Peach

    // Yellows:
    "#FFCC00", // Golden Yellow
    "#FFFF00", // Yellow

    // Greens:
    "#333300", // Olive/Dark Yellow-Green
    "#003300", // Dark Green
    "#808000", // Olive Green
    "#008000", // Green
    "#99CC00", // Chartreuse Green
    "#339966", // Green
    "#00FF00", // Bright Green
    "#9BBB59", // Soft Green

    // Blues/Cyans:
    "#003366", // Dark Blue
    "#000080", // Navy Blue
    "#0000FF", // Blue
    "#008080", // Teal
    "#33CCCC", // Cyan
    "#3366FF", // Vivid Blue
    "#00FFFF", // Cyan
    "#00CCFF", // Sky Blue
    "#1F497D", // Deep Blue
    "#4F81BD", // Soft Blue
    "#4BACC6", // Blue-Green

    // Purples/Magentas:
    "#333399", // Blueish Purple
    "#666699", // Muted Lavender
    "#800080", // Purple
    "#FF00FF", // Magenta
    "#993366", // Mauve
    "#8064A2"  // Soft Purple
];


const minorWords = new Set([
    "a", "an", "the", "and", "but", "or", "for", "nor", "so", "yet",
    "at", "by", "in", "of", "on", "to", "up", "with", "as",
]);

const converterFromEditorToSetup = (type: string): string => {
    switch (type) {
        case "TEXT":
            return "text";
        case "CRITICAL":
            return "critical";
        case "PAGE_NOTES":
            return "pageNotes";
        case "SECTION_NOTES":
            return "sectionNotes";
        case "INNER_MARGIN":
            return "innerMargin";
        case "OUTER_MARGIN":
            return "outerMargin";
        default:
            return "critical"

    }
}

const converterFromSetupToEditor = (type: string): string => {
    switch (type) {
        case "text":
            return "TEXT";
        case "critical":
            return "CRITICAL";
        case "pageNotes":
            return "PAGE_NOTES";
        case "sectionNotes":
            return "SECTION_NOTES";
        case "innerMargin":
            return "INNER_MARGIN";
        case "outerMargin":
            return "OUTER_MARGIN";
        default:
            return "critical"
    }
}

export const converterApparatusTypeFromLayoutToData = (type: string): ApparatusType => {
    switch (type) {
        case "critical":
            return "CRITICAL";
        case "pageNotes":
            return "PAGE_NOTES";
        case "sectionNotes":
            return "SECTION_NOTES";
        case "innerMargin":
            return "INNER_MARGIN";
        case "outerMargin":
            return "OUTER_MARGIN";
        default:
            return 'CRITICAL';
    }
}


const STATUS_BAR_OPTIONS: StatusBarOption[] = [
    {
        key: "wordCount",
        label: "customizeStatusBar.totalWords",
    },
    {
        key: "characterCount",
        label: "customizeStatusBar.totalCharacters",
    },
    {
        key: "lastEditDate",
        label: "customizeStatusBar.lastEditDate",
    },
    {
        key: "author",
        label: "customizeStatusBar.author",
    },
    {
        key: "zoom",
        label: "customizeStatusBar.zoom",
        disabled: true,
    },
];

const CITATION_STYLES: CitationStyle[] = [{
    id: 'chicago-17-author-date',
    label: 'citations.styleOptions.chicago17AuthDate.title',
    subLabel: 'citations.styleOptions.chicago17AuthDate.description'
}, {
    id: 'chicago-17-note-bibliography',
    label: 'citations.styleOptions.chicago17NoteBib.title',
    subLabel: 'citations.styleOptions.chicago17NoteBib.description'
}];

const REFERENCE_SOURCE_TYPES: ReferenceSourceType[] = [{
    value: 'book',
    label: 'bibliography.references.sources.book'
}, {
    value: 'book_section',
    label: 'bibliography.references.sources.book_section'
}, {
    value: 'journal',
    label: 'bibliography.references.sources.journal'
}];

const REFERENCE_FIELD_VALIDATION_PATTERNS: Record<BIB_REFERENCE_FIELDS_EXCLUDED_SOURCE, VALIDATION> = {
    title: { required: true, pattern: '^[\\s\\S]*$' }, // any text
    editor: { required: false, pattern: '^[^,]+(?:,[^,]+)*$' }, // comma-separated list
    author: { required: true, pattern: '^[^,]+(?:,[^,]+)*$' }, // comma-separated list
    bookTitle: { required: false, pattern: '^[\\s\\S]*$' },
    series: { required: false, pattern: '^[\\s\\S]*$' },
    seriesNumber: { required: false, pattern: '^[\\s\\S]*$' },
    volume: { required: false, pattern: '^[\\s\\S]*$' },
    numberOfVolumes: { required: false, pattern: '^[\\s\\S]*$' },
    issue: { required: false, pattern: '^[\\s\\S]*$' },
    // doi: { required: false, pattern: '^10.\\d{4,9}\\/[-._;()/:A-Z0-9]+$/i' },
    doi: { required: false, pattern: '^[\\s\\S]*$' },
    place: { required: false, pattern: '^[\\s\\S]*$' },
    publisher: { required: false, pattern: '^[\\s\\S]*$' },
    // date: { required: false, pattern: '^(?:(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01]))|(?:(?:0[1-9]|[12]\\d|3[01])-(?:0[1-9]|1[0-2])-\\d{4})|(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])-\\d{4})|(?:(?:\\d{4}/(?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01]))|(?:(?:0[1-9]|[12]\\d|3[01])/(?:0[1-9]|1[0-2])/\\d{4})|(?:(?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01])/\\d{4})))$' }, // old: strict date format validation
    date: { required: false, pattern: String.raw`^[\s\S]*$` }, // any text - free format
    pages: { required: false, pattern: '^(\\s*\\d+\\s*(?:-{1,2}\\s*\\d+\\s*)?)(?:\\s*,\\s*\\d+\\s*(?:-{1,2}\\s*\\d+\\s*)?)*$' }, // 123, 123-125, 123-125,128, 123--125
    shortTitle: { required: false, pattern: '^[\\s\\S]*$' },
    url: { required: false, pattern: '^(https?:\\/\\/).+$' },
    // accessed: { required: false, pattern: '^(?:(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01]))|(?:(?:0[1-9]|[12]\\d|3[01])-(?:0[1-9]|1[0-2])-\\d{4})|(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])-\\d{4})|(?:(?:\\d{4}/(?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01]))|(?:(?:0[1-9]|[12]\\d|3[01])/(?:0[1-9]|1[0-2])/\\d{4})|(?:(?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01])/\\d{4})))$' },
    accessed: { required: false, pattern: '^[\\s\\S]*$' },
};

const SHOW_FIELDS_BASED_ON_SOURCE: Record<BIB_REFERENCE_TYPES, BIB_REFERENCE_FIELDS[]> = {
    book: [
        "title",
        "author",
        "series",
        "seriesNumber",
        "volume",
        "numberOfVolumes",
        "place",
        "publisher",
        "date",
        "shortTitle",
        "url",
        "accessed",
    ],
    book_section: [
        "title",
        "editor",
        "author",
        "bookTitle",
        "series",
        "seriesNumber",
        "volume",
        "numberOfVolumes",
        "place",
        "publisher",
        "date",
        "pages",
        "shortTitle",
        "url",
        "accessed",
    ],
    journal: [
        "title",
        "author",
        "bookTitle", // assuming "bookTitle" here means "publication" or journal name
        "volume",
        "issue",
        "pages",
        "date",
        "doi",
        "shortTitle",
        "url",
        "accessed",
    ],
};

export {
    converterFromEditorToSetup,
    converterFromSetupToEditor,
    sectionTypes,
    sectionDividerLabels,
    tabLeaderFormat,
    fontSizes,
    numberSeparator,
    numberFormat,
    levelFormat,
    fontFamilies,
    HighlightColors,
    textFormatColors,
    minorWords,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    DEFAULT_LINE_SPACING,
    STATUS_BAR_OPTIONS,
    CITATION_STYLES,
    REFERENCE_SOURCE_TYPES,
    REFERENCE_FIELD_VALIDATION_PATTERNS,
    SHOW_FIELDS_BASED_ON_SOURCE
};