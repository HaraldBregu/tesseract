interface Bookmark {
    id: string;
    title: string;
    description?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
    categoryId?: string;
    visible: boolean;
}

interface AppComment {
    id: string;
    description?: string;
    content: string;
    target: 'MAIN_TEXT' | 'APPARATUS_TEXT';
    createdAt: string;
    updatedAt: string;
    author: string;
    categoryId?: string;
    visible: boolean;
}

interface BookmarkCategory {
    id: string;
    name: string;
}

interface CommentCategory {
    id: string;
    name: string;
}

interface HistoryAction {
    id: string;
    type: string;
    timestamp: number;
    content: string;
    description: string;
}

interface BulletStyle {
    type: 'ORDER' | 'BULLET' | '';
    style: 'decimal' | 'upper-alpha' | 'lower-alpha' | 'disc' | 'circle' | 'square' | '';
    previousType: 'ORDER' | 'BULLET' | '';
}

interface Spacing {
    before: number | null;
    after: number | null;
    line: number;
}

interface EmphasisState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    alignment: string;
    fontFamily: string;
    fontSize: number | null;
    headingLevel: number;
    blockquote: boolean;
    isCodeBlock: boolean;
    bulletStyle: BulletStyle;
    highlight: string;
    textColor: string;
    superscript: boolean;
    subscript: boolean;
    spacing: Spacing;
    showNonPrintingCharacters: boolean;
}

interface HistoryState {
    lastAction: HistoryAction | null;
    recentActions: HistoryAction[];
    canUndo: boolean;
    canRedo: boolean;
    currentPosition: number;
}

interface BubbleToolbarItemOption {
    label: string;
    value?: string | null;
}

interface BubbleToolbarItem {
    icon: React.ReactNode;
    type: "button" | "dropdown";
    disabled?: boolean;
    options?: BubbleToolbarItemOption[];
    onClick?: (data?: any) => void;
}

type TabInfo = {
    id: number
    name: string
    mode?: string | null
    changed: boolean
}

interface UserInfo {
    gid: number
    homedir: string
    shell: string | null
    uid: number
    username: string
}

type SetupOptionType = {
    template_type: 'Community' | 'Personal',
    paperSize_name: PaperSizeName,
    paperSize_width: number,
    paperSize_height: number,
    paperSize_orientation: 'horizontal' | 'vertical',
    header_show: boolean,
    header_weight: number,
    footer_show: boolean,
    footer_weight: number,
    margin_top: number,
    margin_bottom: number,
    margin_left: number,
    margin_right: number,
    innerMarginNote_show: boolean,
    innerMarginNote_weight: number,
    outerMarginNote_show: boolean,
    outerMarginNote_weight: number,
}

type SetupDialogStateKeys = 'toc' | 'intro' | 'critical' | 'bibliography'

type SetupDialogStateType = {
    [key in SetupDialogStateKeys]: {
        visible: boolean,
        required: boolean,
        layout: LayoutType,
        apparatusDetails: TElement[]
    }
}

interface PageSetupInterface {
    pageSetup: SetupOptionType,
    sectionOrders: SetupDialogStateKeys[],
    layoutTemplate: setupDialogState
}

interface Template {
    template: PageSetupInterface
}

interface Apparatus {
    id: string;
    title: string;
    type: 'CRITICAL' | 'PAGE_NOTES' | 'SECTION_NOTES' | 'INNER_MARGIN' | 'OUTER_MARGIN';
    visible: boolean;
}
