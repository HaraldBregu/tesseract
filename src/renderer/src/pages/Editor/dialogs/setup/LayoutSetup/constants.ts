import { AvailableApparatusTypes, LayoutType, TLayout } from "./types";

export const defaultLayout = 'vertical-horizontal'


export const sectionLayouts = {
    toc: [{ visible: () => true, name: 'vertical-horizontal' }],
    intro: [
        { visible: () => true, name: 'vertical-horizontal' },
        { visible: () => true, name: 'vertical-vertical' },
    ],
    critical: [
        { visible: () => true, name: 'vertical-horizontal' },
        { visible: (apparatusColDetails) => apparatusColDetails.length > 1, name: 'horizontal-horizontal' },
        { visible: () => true, name: 'vertical-vertical' },
        { visible: () => true, name: 'vertical-vertical-reverse' },
    ],
    bibliography: [
        { visible: () => true, name: 'vertical-horizontal' },
        { visible: () => true, name: 'vertical-vertical' },
    ]
} as { [k: string]: TLayout[] }

export type TSettingsLayout = {
    [key in LayoutType]?: AvailableApparatusTypes
}

export const MAX_APPARATUS_NUMBER = 8;

// Section-specific supported layouts configuration
export const SECTION_SUPPORTED_LAYOUTS: Record<string, LayoutType[]> = {
    toc: ["vertical-horizontal"],
    intro: ["vertical-horizontal", "vertical-vertical"],
    critical: ["vertical-horizontal"], // Restricted to only vertical-horizontal for critical section
    bibliography: ["vertical-horizontal", "vertical-vertical"]
};

// Fallback for unknown sections
export const DEFAULT_SUPPORTED_LAYOUTS: LayoutType[] = ["vertical-horizontal"];

// Allowed apparatus types - only one of each type per section
export const ALLOWED_APPARATUS_TYPES = ["PAGE_NOTES", "SECTION_NOTES", "INNER_MARGIN", "OUTER_MARGIN", "CRITICAL"] as const;
export type AllowedApparatusType = typeof ALLOWED_APPARATUS_TYPES[number];

// Helper function to check if layout is supported for a specific section
export const isLayoutSupported = (layout: LayoutType, section?: string): boolean => {
    if (!section) {
        return DEFAULT_SUPPORTED_LAYOUTS.includes(layout);
    }
    const supportedLayouts = SECTION_SUPPORTED_LAYOUTS[section] || DEFAULT_SUPPORTED_LAYOUTS;
    return supportedLayouts.includes(layout);
};

export const settingsLayout: TSettingsLayout = {
    ["vertical-horizontal"]: {
        critical: {
            columnDetails: {
                text: { columnNr: 4 }, // Max 4 columns for text
                CRITICAL: { columnNr: 1 }, // Single column for apparatus
                PAGE_NOTES: { columnNr: 1 }, // Single column for apparatus
                SECTION_NOTES: { columnNr: 1 }, // Single column for apparatus
                OUTER_MARGIN: { columnNr: 1 }, // Single column for apparatus
                INNER_MARGIN: { columnNr: 1 } // Single column for apparatus
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
    },
    ["vertical-vertical"]: {
        critical: {
            columnDetails: {
                text: { columnNr: 1 },
                CRITICAL: { columnNr: 1 },
                PAGE_NOTES: { columnNr: 1 },
                SECTION_NOTES: { columnNr: 1 },
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
    },
    ["vertical-vertical-reverse"]: {
        critical: {
            columnDetails: {
                text: { columnNr: 1 },
                CRITICAL: { columnNr: 1 },
                PAGE_NOTES: { columnNr: 1 },
                SECTION_NOTES: { columnNr: 1 },
                INNER_MARGIN: { columnNr: 1 },
                OUTER_MARGIN: { columnNr: 1 }

            }
        },
        toc: {
            columnDetails: {
                text: { columnNr: 1 }
            }
        },

        bibliography: {
            columnDetails: {
                text: { columnNr: 2 },
            }
        },
    },
    ["horizontal-horizontal"]: {
        critical: {
            columnDetails: {
                text: { columnNr: 4 },
                CRITICAL: { columnNr: 1 }, // Single column for apparatus
                PAGE_NOTES: { columnNr: 1 }, // Single column for apparatus
                SECTION_NOTES: { columnNr: 1 }, // Single column for apparatus
                OUTER_MARGIN: { columnNr: 1 }, // Single column for apparatus
                INNER_MARGIN: { columnNr: 1 } // Single column for apparatus
            }
        },
        toc: {
            columnDetails: {
                text: { columnNr: 1 }
            }
        },

        bibliography: {
            columnDetails: {
                text: { columnNr: 2 },
            }
        },
    },
};

export const standardPageDimensions: StandardPageDimension[] = [
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

export const customPageDimensions: StandardPageDimension = {
    name: 'custom',
    width: 2.0,
    height: 4.0,
}

export const availableApparatusTypes: AvailableApparatusTypes = {
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
