import { DEAFAULT_STYLES, DEFAULT_LAYOUT, DEFAULT_PAGE_SETUP, DEFAULT_PARATEXTUAL, DEFAULT_SORT, TEMPLATE_VERSION } from "@/utils/utils";
import { FileTemplate } from "./types";

const DEFAULT_TEMPLATE = {
    name: "Default",
    type: "DEFAULT",
    version: TEMPLATE_VERSION,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    layout: DEFAULT_LAYOUT,
    pageSetup: DEFAULT_PAGE_SETUP,
    sort: DEFAULT_SORT,
    styles: DEAFAULT_STYLES,
    paratextual: DEFAULT_PARATEXTUAL
} satisfies Template;

export const defaultFileTemplate: FileTemplate = {
    filename: "blank.tml",
    template: DEFAULT_TEMPLATE
}
