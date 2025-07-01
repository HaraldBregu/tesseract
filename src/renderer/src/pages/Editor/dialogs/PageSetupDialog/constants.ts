import { AvailableApparatusTypes, LayoutType, TLayout } from "../../store/layout/layout.state";
import { MetadataState } from "../../store/metadata/metadata.slice";

export const defaultLayout = 'vertical-horizontal'


export const sectionLayouts = {
    toc: [{visible: () => true, name: 'vertical-horizontal' }],
    intro: [
      {visible: () => true, name: 'vertical-horizontal' },
      {visible: () => true, name: 'vertical-vertical' },
    ],
    critical: [
      {visible: () => true, name: 'vertical-horizontal' },
      {visible: (apparatusColDetails) => apparatusColDetails.length > 1, name: 'horizontal-horizontal' },
      {visible: () => true, name: 'vertical-vertical' },
      {visible: () => true, name: 'vertical-vertical-reverse'},
    ],
    bibliography: [
      {visible: () => true, name: 'vertical-horizontal' },
      {visible: () => true, name: 'vertical-vertical' },
    ]
  } as {[k: string]: TLayout[]}

  export type TSettingsLayout = {
    [key in LayoutType]?:AvailableApparatusTypes
  }

  export const MAX_APPARATUS_NUMBER = 8;

  export const settingsLayout:TSettingsLayout = {
    ["vertical-horizontal"]: {
        critical: {
            columnDetails: {
                text:{columnNr: 4},
                critical: {columnNr: 2}, 
                pageNotes: {columnNr: 2}, 
                sectionNotes: {columnNr: 2},
                outerMargin:{columnNr:1},
                innerMargin:{columnNr:1}
            }
        },
        toc: {
            columnDetails: {
                text: {columnNr: 1}
            }
        },
        intro: {
            columnDetails: {
                text: {columnNr: 2}, 

            }
        },
        bibliography: {
            columnDetails: {
                text: {columnNr: 2},
            }
        },
    },
    ["vertical-vertical"]: {
        critical: {
            columnDetails: {
                text:{columnNr: 1},
                critical: {columnNr: 1}, 
                pageNotes: {columnNr: 1}, 
                sectionNotes: {columnNr: 1},
                innerMargin:{columnNr: 1},
                outerMargin:{columnNr: 1}
            }
        },
        toc: {
            columnDetails: {
                text: {columnNr: 1}
            }
        },
        intro: {
            columnDetails: {
                text: {columnNr: 2}, 
            }
        },
        bibliography: {
            columnDetails: {
                text: {columnNr: 2},
            }
        },
    },
    ["vertical-vertical-reverse"]: {
        critical: {
            columnDetails: {
                text:{columnNr: 1},
                critical: {columnNr: 1}, 
                pageNotes: {columnNr: 1}, 
                sectionNotes: {columnNr: 1},
                innerMargin:{columnNr: 1},
                outerMargin:{columnNr: 1}
               
            }
        },
        toc: {
            columnDetails: {
                text: {columnNr: 1}
            }
        },
    
        bibliography: {
            columnDetails: {
                text: {columnNr: 2},
            }
        },
    },
    ["horizontal-horizontal"]: {
        critical: {
            columnDetails: {
             text:{columnNr: 4},
                critical: {columnNr: 2}, 
                pageNotes: {columnNr: 2}, 
                sectionNotes: {columnNr: 2},
                outerMargin:{columnNr:1},
                innerMargin:{columnNr:1}
            }
        },
        toc: {
            columnDetails: {
                text: {columnNr: 1}
            }
        },

        bibliography: {
            columnDetails: {
                text: {columnNr: 2},
            }
        },
    },
  };

  export const initialMetadataCustom:DocumentMetadata[] = [{
        id:0 ,
        title: '',
        valueType: 'text',
        optional: true,
        typology:'custom'
  }]




export const initialMetadataFields: MetadataState =  {"metadata": [
  {
    "title": "Title",
    "description": "The title of the document, typically a concise description of its content or purpose.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Subject",
    "description": "A summary or topic of the document, often used to categorize or group documents.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "PersistentIdentifier",
    "description": "A DOI or PID or other permanent ID allowing to uniquely identify the document",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Author",
    "description": "The name of the person who created the document, usually extracted from the Word application settings.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Manager",
    "description": "The name of the manager or supervisor overseeing the document's creation or project.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Company",
    "description": "The name of the organization or business associated with the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Publisher",
    "description": "The name of the organization or business publishing the \"final\" version of the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "CopyrightHolder",
    "description": "The name of the person or the organisation who owns the rights on the document",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "License",
    "description": "The name or identifiers of the license applied to the document",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "LicenseInformation",
    "description": "The content or URL to the document that describes the license information",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Category",
    "description": "A classification or type of the document, such as \"Report,\" \"Proposal,\" or \"Research.\"",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Keywords",
    "description": "Tags or search terms associated with the document to make it easier to find in searches.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Comments",
    "description": "General notes or remarks about the document, often used for additional context.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Status",
    "description": "The current stage or condition of the document, such as \"Draft,\" \"In Review,\" or \"Final.\"",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Template",
    "description": "The file name of the template upon which the document is based.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Last Author",
    "description": "The name of the last person to save or edit the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Revision Number",
    "description": "Tracks the number of times the document has been saved.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Total Editing Time",
    "description": "The cumulative amount of time spent editing the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Created Date",
    "description": "The date and time when the document was initially created.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Last Printed Date",
    "description": "The date and time when the document was last printed.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Last Saved Date",
    "description": "The date and time of the most recent save action.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Content Status",
    "description": "Describes the current condition or usage state of the document, often for workflow purposes.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Content Type",
    "description": "A technical descriptor for the document's format, e.g., \"application/vnd.openxmlformats-officedocument.wordprocessingprocessingml.document.\"",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Language",
    "description": "The primary language set for the document's content.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Word Count",
    "description": "The total number of words in the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Character Count (with spaces)",
    "description": "The total number of characters, including spaces.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Character Count (no spaces)",
    "description": "The total number of characters, excluding spaces.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Line Count",
    "description": "The total number of lines in the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Paragraph Count",
    "description": "The total number of paragraphs in the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Page Count",
    "description": "The total number of pages in the document.",
    "optional": true,
    "typology": 'fixed' as const,
    "value": '' // Added
  },
  {
    "title": "Version",
    "description": "A text field indicating the version of the document, often used for version control.",
    "optional": false,
    "typology": 'fixed' as const,
    "value": '' // Added
  }
].map((item, index) => ({
  ...item,
  id: index
}))};