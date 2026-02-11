import { JSONContent } from '@tiptap/core';
import assert from "assert";
import { defaultDocumentData, defaultDocumentTab } from "./constants";
import { getSelectedTab } from '../toolbar';
import { mainLogger } from '../shared/logger';


export type OnDocumentTabUpdated = (documentTab: DocumentTab, documentTabList: DocumentTab[]) => void

export class DocumentTabManager {
    static _instance: DocumentTabManager | null = null;

    public static get instance(): DocumentTabManager {
        if (!DocumentTabManager._instance) {
            DocumentTabManager._instance = new DocumentTabManager();
        }

        return DocumentTabManager._instance;
    }

    private documentTabList: DocumentTab[] = [];
    private documentTab: DocumentTab | null = null;
    private onDocumentTabUpdated: OnDocumentTabUpdated = () => null;

    protected constructor() {
        // Singleton constructor
    }

    private findDocumentTab(targetTab: DocumentTab): DocumentTab | undefined {
        return this.documentTabList.find(doc =>
            (doc.path && targetTab.path && doc.path === targetTab.path) ||
            (doc.id === targetTab.id)
        );
    }

    onUpdate(callback: OnDocumentTabUpdated): DocumentTabManager {
        this.onDocumentTabUpdated = callback;
        return DocumentTabManager.instance;
    }

    static onUpdate(callback: OnDocumentTabUpdated): void {
        const instance = DocumentTabManager.instance;
        instance.onUpdate(callback);
    }

    sendUpdate(): DocumentTabManager {
        const documentTab = this.getCurrentTab()
        this.onDocumentTabUpdated(documentTab, this.documentTabList);
        return DocumentTabManager.instance;
    }

    static sendUpdate(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.sendUpdate();
        return instance;
    }

    create(): DocumentTabManager {
        const newDocumentTab: DocumentTab = {
            ...defaultDocumentTab,
            document: {
                ...defaultDocumentData,
                id: crypto.randomUUID(),
            }
        }
        this.documentTab = structuredClone(newDocumentTab);
        const metadata = this.getMetadata();
        metadata.createdDate = new Date().toISOString();
        return DocumentTabManager.instance;
    }

    static create(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.create();
        return instance;
    }

    setDocumentId(value: string): DocumentTabManager {
        const existingTab = this.documentTabList.find(doc => doc.document?.id === value) || null;
        this.documentTab = existingTab;
        return DocumentTabManager.instance;
    }

    static setDocumentId(value: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setDocumentId(value);
        return instance;
    }

    getDocumentTab(): DocumentTab | null {
        return this.documentTab
    }

    setTab(tab: Tab): DocumentTabManager {
        const currentFilePath = tab?.filePath
        const currentTabId = tab?.id
        if (currentFilePath) {
            this.setPath(currentFilePath);
        } else if (currentTabId) {
            this.setId(currentTabId);
        }
        return DocumentTabManager.instance;
    }

    static setTab(tab: Tab): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setTab(tab);
        return instance;
    }

    setCurrentTab(): DocumentTabManager {
        const tab = getSelectedTab()
        mainLogger.assert(!!tab, "setCurrentTab()", "Tab not found");
        assert(tab, "Tab not found");
        this.setTab(tab);
        return DocumentTabManager.instance;
    }

    static setCurrentTab(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setCurrentTab();
        return instance;
    }

    getCurrentTab(): DocumentTab {
        mainLogger.assert(!!this.documentTab, "getCurrentTab()", "Content view document not found");
        assert(this.documentTab, "Content view document not found");
        return this.documentTab;
    }

    static getCurrentTab = (): DocumentTab => DocumentTabManager.instance.getCurrentTab();

    setId(id: number): DocumentTabManager {
        const existingTab = this.documentTabList.find(doc => doc.id === id);

        if (existingTab) {
            this.documentTab = existingTab;
        } else if (this.documentTab) {
            this.documentTab.id = id;
        } else {
            const newTab = structuredClone(defaultDocumentTab);
            newTab.id = id;
            this.documentTab = newTab;
            this.documentTabList.push(newTab);
        }

        return DocumentTabManager.instance;
    }

    static setId(id: number): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setId(id);
        return instance;
    }

    setPath(path: string): DocumentTabManager {
        const existingTab = this.documentTabList.find(doc => doc.path === path);

        if (existingTab) {
            this.documentTab = existingTab;
        } else if (this.documentTab) {
            this.documentTab.path = path;
        } else {
            const newTab = structuredClone(defaultDocumentTab);
            newTab.path = path;
            this.documentTab = newTab;
            this.documentTabList.push(newTab);
        }

        return DocumentTabManager.instance;
    }

    static setPath(path: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setPath(path);
        return instance;
    }

    add(): DocumentTabManager {
        const documentTab = this.getCurrentTab();
        this.documentTabList.push(documentTab);
        return DocumentTabManager.instance;
    }

    static add(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.add();
        return instance;
    }

    setTouched(value: boolean = true): DocumentTabManager {
        const documentTab = this.getCurrentTab();
        documentTab.touched = value;
        mainLogger.info("DocumentTabManager", "setTouched: " + value);
        return DocumentTabManager.instance;
    }

    static setTouched(value: boolean = true): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setTouched(value);
        return instance;
    }

    removeWithId(id: number): DocumentTabManager {
        this.documentTabList = this.documentTabList.filter(doc => doc.id !== id);
        mainLogger.info("DocumentTabManager", "removeWithId");
        return DocumentTabManager.instance;
    }

    static removeWithId(id: number): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.removeWithId(id);
        return instance;
    }

    getApparatuses(): DocumentApparatus[] {
        const document = this.getDocument();
        mainLogger.info("DocumentTabManager", "getApparatuses");
        return document.apparatuses;
    }

    getApparatusWithId(apparatusId: string): DocumentApparatus | undefined {
        const apparatuses = this.getApparatuses();
        const apparatus = apparatuses.find(app => app.id === apparatusId);
        return apparatus;
    }

    getAnnotations(): Annotations {
        const document = this.getDocument();
        mainLogger.info("DocumentTabManager", "getAnnotations");
        return document.annotations;
    }

    setComments(comments: AppComment[]): DocumentTabManager {
        const annotations = this.getAnnotations();
        annotations.comments = comments;
        mainLogger.info("DocumentTabManager", "setComments");
        return DocumentTabManager.instance;
    }

    static setComments(comments: AppComment[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setComments(comments);
        return instance;
    }

    setCommentCategories(commentCategories: CommentCategory[]): DocumentTabManager {
        const annotations = this.getAnnotations();
        annotations.commentCategories = commentCategories;
        mainLogger.info("DocumentTabManager", "setCommentCategories");
        return DocumentTabManager.instance;
    }

    static setCommentCategories(commentCategories: CommentCategory[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setCommentCategories(commentCategories);
        return instance;
    }

    setBookmarks(bookmarks: Bookmark[]): DocumentTabManager {
        const annotations = this.getAnnotations();
        annotations.bookmarks = bookmarks;
        mainLogger.info("DocumentTabManager", "setBookmarks");
        return DocumentTabManager.instance;
    }

    static setBookmarks(bookmarks: Bookmark[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setBookmarks(bookmarks);
        return instance;
    }

    setBookmarkCategories(bookmarkCategories: BookmarkCategory[]): DocumentTabManager {
        const annotations = this.getAnnotations();
        annotations.bookmarkCategories = bookmarkCategories;
        mainLogger.info("DocumentTabManager", "setBookmarkCategories");
        return DocumentTabManager.instance;
    }

    static setBookmarkCategories(bookmarkCategories: BookmarkCategory[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setBookmarkCategories(bookmarkCategories);
        return instance;
    }

    getTemplate(): Template {
        const document = this.getDocument();
        assert(document.template, "Document template not found");
        mainLogger.info("DocumentTabManager", "getTemplate");
        return document.template;
    }

    setTemplate(template: Template): DocumentTabManager {
        const document = this.getDocument();
        document.template = template;
        mainLogger.info("DocumentTabManager", "setTemplate");
        return DocumentTabManager.instance;
    }

    static setTemplate(template: Template): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setTemplate(template);
        return instance;
    }

    setMainText(mainText: JSONContent): DocumentTabManager {
        const document = this.getDocument();
        document.mainText = mainText || document.mainText;
        mainLogger.info("DocumentTabManager", "setMainText");
        return DocumentTabManager.instance;
    }

    static setMainText(mainText: JSONContent): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setMainText(mainText);
        return instance;
    }

    getMainText(): JSONContent | null {
        const document = this.getDocument();
        mainLogger.info("DocumentTabManager", "getMainText");
        return document.mainText;
    }

    setApparatuses(apparatuses: DocumentApparatus[]): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = apparatuses.map(app => ({
            ...app,
            content: app.content || document.apparatuses.find(a => a.id === app.id)?.content
        }));
        mainLogger.info("DocumentTabManager", "setApparatuses");
        return DocumentTabManager.instance;
    }

    static setApparatuses(apparatuses: DocumentApparatus[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setApparatuses(apparatuses);
        return instance;
    }

    toggleApparatusVisibility(apparatus: Apparatus): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === apparatus.id ? { ...app, visible: !apparatus.visible } : app);
        mainLogger.info("DocumentTabManager", "toggleApparatusVisibility");
        return DocumentTabManager.instance;
    }

    static toggleApparatusVisibility(apparatus: Apparatus): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.toggleApparatusVisibility(apparatus);
        return instance;
    }

    removeApparatusWithId(apparatusId: string): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.filter(app => app.id !== apparatusId);
        mainLogger.info("DocumentTabManager", "removeApparatusWithId");
        return DocumentTabManager.instance;
    }

    static removeApparatusWithId(apparatusId: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.removeApparatusWithId(apparatusId);
        return instance;
    }

    hideApparatus(apparatusId: string): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === apparatusId ? { ...app, visible: false } : app);
        mainLogger.info("DocumentTabManager", "hideApparatus");
        return DocumentTabManager.instance;
    }

    static hideApparatus(apparatusId: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.hideApparatus(apparatusId);
        return instance;
    }

    updateApparatusType(apparatusId: string, type: ApparatusType): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === apparatusId ? { ...app, type } : app);
        mainLogger.info("DocumentTabManager", "updateApparatusType");
        return DocumentTabManager.instance;
    }

    static updateApparatusType(apparatusId: string, type: ApparatusType): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateApparatusType(apparatusId, type);
        return instance;
    }

    updateApparatusTitle(apparatusId: string, title: string): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === apparatusId ? { ...app, title } : app);
        mainLogger.info("DocumentTabManager", "updateApparatusTitle");
        return DocumentTabManager.instance;
    }

    static updateApparatusTitle(apparatusId: string, title: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateApparatusTitle(apparatusId, title);
        return instance;
    }

    updateApparatusExpanded(apparatusId: string, expanded: boolean): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === apparatusId ? { ...app, expanded } : app);
        mainLogger.info("DocumentTabManager", "updateApparatusExpanded");
        return DocumentTabManager.instance;
    }

    static updateApparatusExpanded(apparatusId: string, expanded: boolean): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateApparatusExpanded(apparatusId, expanded);
        return instance;
    }

    addApparatusTypeAtIndex(type: ApparatusType, index: number): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses.splice(index, 0, {
            id: crypto.randomUUID(),
            title: "Apparatus " + (document.apparatuses.length + 1),
            type: type,
            visible: true,
            expanded: false,
            content: null,
            notesVisible: true,
            commentsVisible: true,
        })
        mainLogger.info("DocumentTabManager", "addApparatusTypeAtIndex");
        return DocumentTabManager.instance;
    }

    static addApparatusTypeAtIndex(type: ApparatusType, index: number): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.addApparatusTypeAtIndex(type, index);
        return instance;
    }

    reorderApparatusesByIds(apparatusesIds: string[]): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.sort((a, b) => apparatusesIds.indexOf(a.id) - apparatusesIds.indexOf(b.id));
        mainLogger.info("DocumentTabManager", "reorderApparatusesByIds");
        return DocumentTabManager.instance;
    }

    static reorderApparatusesByIds(apparatusesIds: string[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.reorderApparatusesByIds(apparatusesIds);
        return instance;
    }

    apparatusAtIndex(index: number): DocumentApparatus | undefined {
        const document = this.getDocument();
        mainLogger.info("DocumentTabManager", "apparatusAtIndex");
        return document.apparatuses[index];
    }

    updateApparatusIdWithContent(id: string, content: JSONContent): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === id ? { ...app, content } : app);
        mainLogger.info("DocumentTabManager", "updateApparatusIdWithContent");
        return DocumentTabManager.instance;
    }

    static updateApparatusIdWithContent(id: string, content: JSONContent): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateApparatusIdWithContent(id, content);
        return instance;
    }

    toggleApparatusNoteVisibility(id: string): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === id ? {
            ...app,
            notesVisible: (app.notesVisible != undefined && app.notesVisible != null) ? !app.notesVisible : false
        } : app);
        mainLogger.info("DocumentTabManager", "toggleApparatusNoteVisibility");
        return DocumentTabManager.instance;
    }

    static toggleApparatusNoteVisibility(id: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.toggleApparatusNoteVisibility(id);
        return instance;
    }

    toggleApparatusCommentVisibility(id: string): DocumentTabManager {
        const document = this.getDocument();
        document.apparatuses = document.apparatuses.map(app => app.id === id ? {
            ...app,
            commentsVisible: (app.commentsVisible != undefined && app.commentsVisible != null) ? !app.commentsVisible : false
        } : app);
        mainLogger.info("DocumentTabManager", "toggleApparatusCommentVisibility");
        return DocumentTabManager.instance;
    }

    static toggleApparatusCommentVisibility(id: string): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.toggleApparatusCommentVisibility(id);
        return instance;
    }

    updateLayout(): DocumentTabManager {
        const document = this.getDocument();
        const apparatuses = this.getApparatuses();
        const apparatusDetails = document.template.layout.critical.apparatusDetails
        const apparatusDetailsText = apparatusDetails.find((data) => data.sectionType === 'text') || {
            id: "element1",
            title: "Text",
            sectionType: "text",
            type: "text",
            columns: 1,
            disabled: true,
            visible: true
        } as ApparatusLayout

        const apparatusDetailsFromApparatuses = apparatuses.map(app => ({
            id: app.id,
            title: app.title,
            sectionType: app.type as ApparatusType,
            type: apparatusDetails.find((data) => data.id === app.id)?.type || "apparatus",
            columns: apparatusDetails.find((data) => data.id === app.id)?.columns || 1,
            disabled: apparatusDetails.find((data) => data.id === app.id)?.disabled || false,
            visible: apparatusDetails.find((data) => data.id === app.id)?.visible ?? true,
        }))

        document.template.layout.critical.apparatusDetails = [
            apparatusDetailsText,
            ...apparatusDetailsFromApparatuses,
        ]
        mainLogger.info("DocumentTabManager", "updateLayout");

        return DocumentTabManager.instance;
    }

    static updateLayout(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateLayout();
        return instance;
    }

    updateApparatusesFromLayout(): DocumentTabManager {
        const document = this.getDocument();
        const apparatusDetails = document.template.layout.critical.apparatusDetails
        const layoutApparatuses = apparatusDetails.filter(app => app.type !== "text")
        document.apparatuses = layoutApparatuses.map(app => ({
            id: app.id,
            title: app.title,
            type: app.sectionType as ApparatusType,
            visible: document.apparatuses.find(a => a.id === app.id)?.visible ?? true,
            expanded: document.apparatuses.find(a => a.id === app.id)?.expanded ?? true,
            content: document.apparatuses.find(a => a.id === app.id)?.content,
            notesVisible: document.apparatuses.find(a => a.id === app.id)?.notesVisible ?? true,
            commentsVisible: document.apparatuses.find(a => a.id === app.id)?.commentsVisible ?? true,
        } satisfies DocumentApparatus));
        mainLogger.info("DocumentTabManager", "updateApparatusesFromLayout");
        return DocumentTabManager.instance;
    }

    static updateApparatusesFromLayout(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateApparatusesFromLayout();
        return instance;
    }

    // Instead of pushing, sync using another function (syncronize())
    setDocument(document: DocumentData): DocumentTabManager {
        assert(this.documentTab, "Content view document not found");
        const existingTab = this.findDocumentTab(this.documentTab);
        if (existingTab) {
            existingTab.document = document;
        } else {
            this.documentTab.document = document;
            this.documentTabList.push(this.documentTab);
        }
        mainLogger.info("DocumentTabManager", "setDocument");
        return DocumentTabManager.instance;
    }

    static setDocument(document: DocumentData): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setDocument(document);
        return instance;
    }

    getDocument(): DocumentData {
        const currentTab = this.getCurrentTab();
        assert(currentTab.document, "Document not found");
        mainLogger.info("DocumentTabManager", "getDocument");
        return currentTab.document;
    }

    setSigla(sigla: DocumentSiglum[]): DocumentTabManager {
        const document = this.getDocument();
        document.sigla = sigla;
        mainLogger.info("DocumentTabManager", "setSigla");
        return DocumentTabManager.instance;
    }

    static setSigla(sigla: DocumentSiglum[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setSigla(sigla);
        return instance;
    }

    getSigla(): DocumentSiglum[] {
        const document = this.getDocument();
        assert(document.sigla, "Document sigla not found");
        mainLogger.info("DocumentTabManager", "getSigla");
        return document.sigla;
    }

    getMetadata(): Metadata {
        const document = this.getDocument();
        assert(document.metadata, "Document metadata not found");
        return document.metadata;
    }

    setMetadata(metadata: Metadata): DocumentTabManager {
        const document = this.getDocument();
        document.metadata = metadata;
        mainLogger.info("DocumentTabManager", "setMetadata");
        return DocumentTabManager.instance;
    }

    static setMetadata(metadata: Metadata): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setMetadata(metadata);
        return instance;
    }

    updateMetadata(): DocumentTabManager {
        const document = this.getDocument();
        document.metadata = {
            ...document.metadata,
            templateName: document.template.name,
        };
        mainLogger.info("DocumentTabManager", "updateMetadata");
        return DocumentTabManager.instance;
    }

    static updateMetadata(): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.updateMetadata();
        return instance;
    }

    setBibliographies(bibliographies: Bibliography[]): DocumentTabManager {
        const document = this.getDocument();
        document.bibliographies = bibliographies;
        mainLogger.info("DocumentTabManager", "setBibliographies");
        return DocumentTabManager.instance;
    }

    static setBibliographies(bibliographies: Bibliography[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setBibliographies(bibliographies);
        return instance;
    }

    getBibliographies(): Bibliography[] {
        const document = this.getDocument();
        assert(document.bibliographies, "Bibliographies not found");
        mainLogger.info("DocumentTabManager", "getBibliographies");
        return document.bibliographies;
    }

    setReferencesFormat(referencesFormat: ReferencesFormat): DocumentTabManager {
        const document = this.getDocument();
        document.referencesFormat = referencesFormat;
        mainLogger.info("DocumentTabManager", "setReferencesFormat");
        return DocumentTabManager.instance;
    }

    static setReferencesFormat(referencesFormat: ReferencesFormat): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setReferencesFormat(referencesFormat);
        return instance;
    }

    getReferencesFormat(): ReferencesFormat {
        const document = this.getDocument();
        assert(document.referencesFormat, "References format not found");
        mainLogger.info("DocumentTabManager", "getReferencesFormat");
        return document.referencesFormat;
    }

    getPageNumberSettings(): PageNumberSettings {
        const paratextual = this.getParatextual();
        assert(paratextual.pageNumberSettings, "Page number settings not found");
        mainLogger.info("DocumentTabManager", "getPageNumberSettings");
        return paratextual.pageNumberSettings;
    }

    setPageNumberSettings(pageNumberSettings: PageNumberSettings): DocumentTabManager {
        const paratextual = this.getParatextual();
        paratextual.pageNumberSettings = pageNumberSettings;
        mainLogger.info("DocumentTabManager", "setPageNumberSettings");
        return DocumentTabManager.instance;
    }

    static setPageNumberSettings(pageNumberSettings: PageNumberSettings): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setPageNumberSettings(pageNumberSettings);
        return instance;
    }

    getLineNumberSettings(): LineNumberSettings {
        const paratextual = this.getParatextual();
        assert(paratextual.lineNumberSettings, "Line number settings not found");
        mainLogger.info("DocumentTabManager", "getLineNumberSettings");
        return paratextual.lineNumberSettings;
    }

    setLineNumberSettings(lineNumberSettings: LineNumberSettings): DocumentTabManager {
        const paratextual = this.getParatextual();
        paratextual.lineNumberSettings = lineNumberSettings;
        mainLogger.info("DocumentTabManager", "setLineNumberSettings");
        return DocumentTabManager.instance;
    }

    setLineNumberShowLines(showLines: number): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        const lineNumberSettings = instance.getLineNumberSettings();
        lineNumberSettings.showLines = showLines;
        instance.setLineNumberSettings(lineNumberSettings);
        mainLogger.info("DocumentTabManager", "setLineNumberShowLines");
        return instance;
    }

    static setLineNumberSettings(lineNumberSettings: LineNumberSettings): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setLineNumberSettings(lineNumberSettings);
        return instance;
    }

    getParatextual(): Paratextual {
        const template = this.getTemplate()
        assert(template.paratextual, "Paratextual not found");
        mainLogger.info("DocumentTabManager", "getParatextual");
        return template.paratextual;
    }

    getTocSettings(): TocSettings {
        const paratextual = this.getParatextual()
        assert(paratextual.tocSettings, "Toc settings not found");
        mainLogger.info("DocumentTabManager", "getTocSettings");
        return paratextual.tocSettings;
    }

    setTocSettings(tocSettings: TocSettings): DocumentTabManager {
        const paratextual = this.getParatextual();
        paratextual.tocSettings = tocSettings;
        mainLogger.info("DocumentTabManager", "setTocSettings");
        return DocumentTabManager.instance;
    }

    static setTocSettings(tocSettings: TocSettings): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setTocSettings(tocSettings);
        return instance;
    }

    getPageSetup(): SetupOptionType {
        const template = this.getTemplate();
        assert(template.pageSetup, "Page setup not found");
        mainLogger.info("DocumentTabManager", "getPageSetup");
        return template.pageSetup;
    }

    setPageSetup(pageSetup: SetupOptionType): DocumentTabManager {
        const template = this.getTemplate();
        template.pageSetup = pageSetup;
        mainLogger.info("DocumentTabManager", "setPageSetup");
        return DocumentTabManager.instance;
    }

    static setPageSetup(pageSetup: SetupOptionType): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setPageSetup(pageSetup);
        return instance;
    }

    getHeaderSettings(): HeaderSettings {
        const paratextual = this.getParatextual();
        assert(paratextual.headerSettings, "Header settings not found");
        mainLogger.info("DocumentTabManager", "getHeaderSettings");
        return paratextual.headerSettings;
    }

    setHeaderSettings(headerSettings: HeaderSettings): DocumentTabManager {
        const paratextual = this.getParatextual();
        paratextual.headerSettings = headerSettings;
        mainLogger.info("DocumentTabManager", "setHeaderSettings");
        return DocumentTabManager.instance;
    }

    static setHeaderSettings(headerSettings: HeaderSettings): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setHeaderSettings(headerSettings);
        return instance;
    }

    getFooterSettings(): FooterSettings {
        const paratextual = this.getParatextual();
        assert(paratextual.footerSettings, "Footer settings not found");
        mainLogger.info("DocumentTabManager", "getFooterSettings");
        return paratextual.footerSettings;
    }

    setFooterSettings(footerSettings: FooterSettings): DocumentTabManager {
        const paratextual = this.getParatextual();
        paratextual.footerSettings = footerSettings;
        mainLogger.info("DocumentTabManager", "setFooterSettings");
        return DocumentTabManager.instance;
    }

    static setFooterSettings(footerSettings: FooterSettings): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setFooterSettings(footerSettings);
        return instance;
    }

    setLayout(layout: Layout): DocumentTabManager {
        const template = this.getTemplate();
        template.layout = layout;
        mainLogger.info("DocumentTabManager", "setLayout");
        return DocumentTabManager.instance;
    }

    static setLayout(layout: Layout): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setLayout(layout);
        return instance;
    }

    getLayout(): Layout {
        const template = this.getTemplate();
        assert(template.layout, "Layout template not found");
        mainLogger.info("DocumentTabManager", "getLayout");
        return template.layout;
    }

    setSort(sort: string[]): DocumentTabManager {
        const template = this.getTemplate();
        template.sort = sort;
        mainLogger.info("DocumentTabManager", "setSort");
        return DocumentTabManager.instance;
    }

    static setSort(sort: string[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setSort(sort);
        return instance;
    }

    getSort(): string[] {
        const template = this.getTemplate();
        assert(template.sort, "Sort not found");
        mainLogger.info("DocumentTabManager", "getSort");
        return template.sort;
    }

    setStyles(styles: Style[]): DocumentTabManager {
        const template = this.getTemplate();
        template.styles = styles;
        mainLogger.info("DocumentTabManager", "setStyles");
        return DocumentTabManager.instance;
    }

    static setStyles(styles: Style[]): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setStyles(styles);
        return instance;
    }

    getStyles(): Style[] {
        const template = this.getTemplate();
        assert(template.styles, "Styles not found");
        mainLogger.info("DocumentTabManager", "getStyles");
        return template.styles;
    }

    setPrintPreview(printPreview: { path: string | null; isLoaded: boolean; error: string | null }): DocumentTabManager {
        const documentTab = this.getCurrentTab();
        documentTab.printPreview = printPreview;
        mainLogger.info("DocumentTabManager", "setPrintPreview");
        return DocumentTabManager.instance;
    }

    static setPrintPreview(printPreview: { path: string | null; isLoaded: boolean; error: string | null }): DocumentTabManager {
        const instance = DocumentTabManager.instance;
        instance.setPrintPreview(printPreview);
        mainLogger.info("DocumentTabManager", "setPrintPreview");
        return instance;
    }

    getPrintPreview(): { path: string | null; isLoaded: boolean; error: string | null } | undefined {
        const documentTab = this.getCurrentTab();
        mainLogger.info("DocumentTabManager", "getPrintPreview");
        return documentTab.printPreview;
    }

    static getPrintPreview(): { path: string | null; isLoaded: boolean; error: string | null } | undefined {
        const instance = DocumentTabManager.instance;
        return instance.getPrintPreview();
    }

}
