export type LayoutType = 'vertical-horizontal' | 'horizontal-horizontal' | 'vertical-vertical' | 'vertical-vertical-reverse'

export type TLayout = {
    name: LayoutType
    visible: (v: unknown[]) => boolean,
}


export type TElement = {
    id: string,
    title: string,
    columns: number,
    sectionType: ApparatusType,
    disabled: boolean,
    type: 'text' | 'apparatus',
    visible: boolean
}

export type SetupSettingsState = {
    setupDialogState: SetupDialogStateType,
    sort: SetupDialogStateKeys[],
    setupOption: SetupOptionType,
}

export type StandardPageDimensionsState = {
    name: string,
    width: number,
    height: number,
}

// export type ApparatusTypes = 'text' | 'critical' | 'pageNotes' | 'sectionNotes' | 'innerMargin' | 'outerMargin'

export type ColDetailsType = { columnNr: number }

export type AvailableApparatusTypes = {
    [key in SetupDialogStateKeys]?: {
        columnDetails: {
            [key in ApparatusType]?: ColDetailsType
        }
    }
}

export type SetupPageState = {
    settings: SetupSettingsState,
    standardPageDimensions: StandardPageDimensionsState[],
    availableApparatusTypes: AvailableApparatusTypes
}

// This is the initial state for the setup page in the editor

const setupOption: SetupOptionType = {
    template_type: 'Personal', // 'Personal' | 'Community'
    paperSize_name: "A4",
    paperSize_width: 21.0,
    paperSize_height: 29.7,
    paperSize_orientation: 'vertical',
    header_show: true,
    header_weight: 1.25,
    footer_show: true,
    footer_weight: 1.25,
    margin_top: 1.25,
    margin_bottom: 1.25,
    margin_left: 1.25,
    margin_right: 1.25,
    innerMarginNote_show: true,
    innerMarginNote_weight: 0.5,
    outerMarginNote_show: true,
    outerMarginNote_weight: 0.5,
}

const defaultLayout = 'vertical-horizontal'

const sort: SetupDialogStateKeys[] = ['toc', 'intro', 'critical', 'bibliography']

//initial state text/apparatus in layout
export const setupDialogState: SetupDialogStateType = {
    toc: {
        visible: false,
        required: false,
        layout: defaultLayout,
        apparatusDetails: [{
            id: crypto.randomUUID(),
            title: 'Text',
            sectionType: "text",
            type: 'text',
            columns: 1,
            disabled: true,
            visible: true
        }],

    },
    intro: {
        visible: false,
        required: false,
        layout: defaultLayout,
        apparatusDetails: [{
            id: crypto.randomUUID(),
            title: 'Text',
            sectionType: "text",
            type: 'text',
            columns: 2,
            disabled: true,
            visible: true
        }],
    },
    critical: {
        visible: true,
        required: true,
        layout: defaultLayout,
        apparatusDetails: [{
            id: crypto.randomUUID(),
            title: 'Text',
            sectionType: "text",
            type: 'text',
            columns: 1,
            disabled: true,
            visible: true
        }, {
            id: crypto.randomUUID(),
            title: 'Apparatus notes',
            type: 'apparatus',
            sectionType: "CRITICAL",
            columns: 1,
            disabled: true,
            visible: true

        }],
    },
    bibliography: {
        visible: false,
        required: false,
        layout: defaultLayout,
        apparatusDetails: [{
            id: crypto.randomUUID(),
            title: 'Text',
            sectionType: "text",
            type: 'text',
            columns: 2,
            disabled: true,
            visible: true
        }],
    }
}

const standardPageDimensions: StandardPageDimension[] = [
    {
        name: 'A3',
        width: 29.7,
        height: 42,
    },
    {
        name: 'A4',
        width: 21.0,
        height: 29.7,
    },
    {
        name: 'A5',
        width: 14.8,
        height: 21,
    },
    {
        name: 'A6',
        width: 10.5,
        height: 14.8,
    }
]

const settings = { setupDialogState, sort, setupOption }

export const apparatusTypes = [
    { item: 'CRITICAL', disabled: false },
    { item: 'PAGE_NOTES', disabled: false },
    { item: 'SECTION_NOTES', disabled: false },
    { item: 'INNER_MARGIN', disabled: false },
    { item: 'OUTER_MARGIN', disabled: false }
]

const availableApparatusTypes: AvailableApparatusTypes = {
    critical: {
        columnDetails: {
            text: { columnNr: 4 },
            CRITICAL: { columnNr: 4 },
            PAGE_NOTES: { columnNr: 4 },
            SECTION_NOTES: { columnNr: 4 },
            INNER_MARGIN: { columnNr: 1 },
            OUTER_MARGIN: { columnNr: 1 }
        }
    },
    toc: {
        columnDetails: {
            text: { columnNr: 1 }
        }
    },
    intro: {
        columnDetails: {
            text: { columnNr: 2 },
        }
    },
    bibliography: {
        columnDetails: {
            text: { columnNr: 2 },
        }
    },
}

export type Section = {
    [key in SetupDialogStateKeys]: {
        columnDetails: { [key in ApparatusType]?: ColDetailsType; };
    };
}

export const setupPageInitialState: SetupPageState = {
    settings, standardPageDimensions, availableApparatusTypes
}


