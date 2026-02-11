interface HistoryAction {
    id: string;
    type: string;
    timestamp: number;
    content: string;
    description: string;
}

type EditorType = 'TEXT' | 'APPARATUS'

type BulletStyleType = 'ORDER' | 'BULLET' | '';

type BulletStyles = 'decimal' | 'upper-alpha' | 'lower-alpha' | 'upper-roman' | 'lower-roman' | 'disc' | 'circle' | 'square' | '';
type ListStyle = 'decimal' | 'upper-alpha' | 'lower-alpha' | 'upper-roman' | 'lower-roman' | 'disc' | 'circle' | 'square' | '';


type OrderedListType = '1' | 'a' | 'A' | 'i' | 'I';
type BulletListType = 'disc' | 'circle' | 'square';

type ListType = OrderedListType | BulletListType;

type BulletStyle = {
    type: BulletStyleType;
    style: BulletStyles;
    previousType: BulletStyleType;
}

interface StandardPageDimension {
    name: PaperSizeName;
    width: number;
    height: number;
}
interface Spacing {
    before: number;
    after: number;
    line: number;
}

type ToolbarState = {
    headingLevel: number | undefined;
    styleId: string | undefined;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
    highlightColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
    alignment: Alignment;
    listStyle: ListStyle;
    spacing: Spacing;
    link: string;
}

type MainTextStyle = {
    headingLevel: number | undefined;
    styleId: string | undefined;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
    highlightColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
    alignment: Alignment;
    listStyle: ListStyle;
    spacing: Spacing;
    link: string;
}

type ApparatusTextStyle = {
    headingLevel: number;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
    highlightColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
    link: string;
}

interface EmphasisState {
    styleId: string | undefined;
    headingLevel: number | undefined;
    fontFamily: string;
    fontSize: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    alignment: Alignment;
    blockquote: boolean;
    isCodeBlock: boolean;
    bulletStyle: BulletStyle;
    highlight: string;
    textColor: string;
    superscript: boolean;
    subscript: boolean;
    spacing: Spacing;
    link: string;
    listStyle: ListStyle;
}

type TextFormatting = {
    fontFamily: string;
    fontSize: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
}


interface HistoryState {
    lastAction: HistoryAction | null;
    recentActions: HistoryAction[];
    canUndo: boolean;
    canRedo: boolean;
    currentPosition: number;
}

type ItemOption = {
    label: string;
    value: any;
}

type BubbleToolbarItemOption = {
    label: string;
    value?: unknown;
}

interface BubbleToolbarItem {
    icon: React.ReactNode;
    type: "button" | "dropdown";
    disabled?: boolean;
    options?: BubbleToolbarItemOption[];
    onClick?: (data?: any) => void;
}

interface UserInfo {
    gid: number
    homedir: string
    shell: string | null
    uid: number
    username: string
}
interface PaginationSetupProps {
    settings: HeaderSettings;
    setSettings: (settings: HeaderSettings) => void;
}

type CasingType = 'none-case' | 'all-caps' | 'small-caps' | 'title-case' | 'start-case'

type SectionTypes = 'introduction' | 'toc' | 'maintext' | 'bibliography' | 'appendix';

type TreeItem = {
    id: string;
    headingsId?: string; // ID personalizzato per la visualizzazione
    headingIndex: number;
    name: string;
    customName: string; // Nome personalizzato per la visualizzazione
    showHeadingNumbers?: boolean; // Indica se mostrare i numeri di intestazione
    level: number;
    children: TreeItem[];
}

type TTextPosition = { from: number; to: number };

type StatusBarOption = {
    key: string;
    label: string;
    disabled?: boolean;
    checked?: boolean;
};

type Siglum = {
    id: string
} & DocumentSiglum

type SpacingList = {
    label: string;
    value: string;
    onClick: () => void;
}

type BulletList = {
    label: string;
    value: ListStyle;
    icon: React.MemoExoticComponent;
    onClick: (value: ListStyle) => void;
}

/**
 * Apparatus Note types
 */
type ApparatusNote = {
    noteId: string; // Note id in main text
    noteContent: string; // Note content in main text (string)
    apparatusId: string; // Box of apparatus
    entryNodes: JSONContent[]; // Content of the apparatus entry
    visible: boolean; // If the note is visible in the apparatus
}

/**
 * Apparatus Entry types
 */
type ApparatusEntryStyle = {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
}

type ApparatusNoteEmphasis = {
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

type ApparatusEntryContent = {
    id: string
    type: string
    lemmaContent: string
    lemmaStyle: LemmaStyle
    fromToSeparatorContent: string
    fromToSeparatorStyle: LemmaFromToSeparatorStyle
    separatorContent: string
    separatorStyle: LemmaSeparatorStyle
    nodes: JSONContent[]
}

/**
 * Apparatus Entry types
 */
type ApparatusEntryStyle = {
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    fontSize: string;
    color: string;
}

/**
 * Lemma types
 */

type LemmaStyle = {
    fontFamily: string;
    fontSize: string;
    textColor: string;
    highlightColor: string;
    bold: boolean;
    italic: boolean;
}

type Lemma = {
    content: string;
    style: LemmaStyle;
}

type LemmaSeparatorStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline'>

type LemmaSeparator = {
    content: string;
    style: LemmaSeparatorStyle;
}

type LemmaFromToSeparatorStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline'>

type LemmaFromToSeparator = {
    content: string;
    style: LemmaFromToSeparatorStyle;
}

type ReadingSeparatorStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingSeparator = {
    content: string;
    style: ReadingSeparatorStyle;
}

type ReadingTypeAddStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingTypeAdd = {
    content: string;
    style: ReadingTypeAddStyle;
}

type ReadingTypeOmStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingTypeOm = {
    content: string;
    style: ReadingTypeOmStyle;
}

type ReadingTypeTrStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingTypeTr = {
    content: string;
    style: ReadingTypeTrStyle;
}

type ReadingTypeDelStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingTypeDel = {
    content: string;
    style: ReadingTypeDelStyle;
}

type ReadingTypeCustomStyle = Pick<LemmaStyle, 'bold' | 'italic' | 'underline' | 'highlightColor'>

type ReadingType = ReadingTypeAdd | ReadingTypeOm | ReadingTypeTr | ReadingTypeDel;

type SiglumStyle = {
    fontFamily: string;
    fontSize: string;
    superscript: boolean;
    subscript: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

type SiglumNode = {
    content: string;
    style: SiglumStyle;
}
