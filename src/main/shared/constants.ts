import { MenuViewMode } from "../types";


let viewMode: MenuViewMode = "critix_editor"
export const setMenuViewMode = (mode: MenuViewMode): void => { viewMode = mode }
export const getMenuViewMode = (): MenuViewMode => viewMode

let isNewDocument = true;
export const setIsNewDocument = (isNew: boolean): void => { isNewDocument = isNew }
export const getIsNewDocument = (): boolean => isNewDocument

export const Route = {
    root: "/",
    fileViewer: "/file-viewer"
} satisfies Record<string, WebContentsRoute>;

export const routeToMenuMapping: Record<WebContentsRoute, MenuViewMode> = {
    "/": "critix_editor",
    "/file-viewer": "file_viewer",
}

export const fileTypeToRouteMapping: Record<FileType, WebContentsRoute> = {
    "critx": "/",
    "pdf": "/file-viewer",
    "png": "/file-viewer",
    "jpg": "/file-viewer",
    "jpeg": "/file-viewer",
}

export const typeTypeToRouteMapping: Record<TabType, WebContentsRoute> = {
    "critx": "/",
    "pdf": "/file-viewer",
    "png": "/file-viewer",
    "jpg": "/file-viewer",
    "jpeg": "/file-viewer",
}

export const defaultSpecialCharacterConfig: CharacterConfiguration[] = [
    { code: 169, character: "Copyright", shortcut: null },
    { code: 8211, character: "En Dash", shortcut: null },
    { code: 8209, character: "Non-breaking Hyphen", shortcut: null },
    { code: 8482, character: "Trademark", shortcut: null },
    { code: 174, character: "Registered", shortcut: null },
];

export const LINK_TO_SUPPORT_PAGE : string = 'https://accounts.d4science.org/auth/realms/d4science/protocol/saml?SAMLRequest=fZJJT8MwEIX%2FSm4%2BJU7S0MVqIkWtkCoVhMpy4FK5zkAtvASPzfLvSVK1FAm4et775s2M58i1alkd%2FN5s4DUA%2BqhGBOelNQtrMGhwt%2BDepID7zboke%2B9bZJRiaFvrfNIUKCQYAYl1z5R3HNojqeBK7bh4IdGyY0rDe%2BC3nQthg%2FH4m98BVxrpqUJbZ70VVg1kEq2WJdleTCbTaT5L413a5HHBizTmeTGKxTgrRsVIzKZ81kkRA6wMem58SfI0H8dpFueTuyxl2Zhl%2BSOJHsDhkC1PUhJ9aGWQ9Y1KEpxhlqNEZrgGZF6w2%2FpqzToh48clnVva%2Fz3HOUg179VsSOcqB42WBrZduQmiZ25Ps8%2FpuXJ%2BuNZ1R14tb6yS4jOqlbLvi25nHkriXQASXVqnuf87S5Zkw4ts4qdBykBzqeqmcYBIaHXo%2BvNbVF8%3D'