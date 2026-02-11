import { Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import { mainLogger } from "../shared/logger";
import { is, platform } from "@electron-toolkit/utils";
import { buildFileMenu } from "./items/file-menu";
import { buildEditMenu } from "./items/edit-menu";
import { buildInsertMenu, getAddBookmarkMenuItemEnabled, getAddCommentMenuItemEnabled, getInsertMenuEnabled, getLinkMenuItemEnabled, getRemoveLinkMenuItemEnabled, getSymbolMenuItemEnabled, setAddBookmarkMenuItemEnabled, setAddCommentMenuItemEnabled, setCurrentLineNumberValue, setInsertMenuEnabled, setLinkMenuItemEnabled, setRemoveLinkMenuItemEnabled, setSymbolMenuItemEnabled } from "./items/insert-menu";
import { buildReferencesMenu, getAddCitationMenuItemEnabled, getAddNoteMenuItemEnabled, getAddReadingsEnabled, getDisabledReferencesMenuItemsIds, getReferencesMenuApparatuses, getReferencesMenuCurrentContext, getSiglumMenuItemEnabled, setAddCitationMenuItemEnabled, setAddNoteMenuItemEnabled, setAddReadingsEnabled, setDisabledReferencesMenuItemsIds, setCurrentSection, setReferencesMenuApparatuses, setReferencesMenuCurrentContext, setSiglumMenuItemEnabled } from "./items/references-menu";
import { buildFormatMenu, getEnableTocSettingsMenu, getTextFormattingMenuEnabled, setEnableTocSettingsMenu, setTextFormattingMenuEnabled } from "./items/format-menu";
import { buildViewMenu, getApparatusSubMenuObjectItems, getEnableTocVisibilityMenuItem, getPrintPreviewVisible, getTocVisible, setApparatusSubMenuObjectItems, setEnableTocVisibilityMenuItem, setPrintPreviewVisible, setTocVisible } from "./items/view-menu";
import { buildHelpMenu } from "./items/help-menu";
import { buildDeveloperMenu } from "./items/developer-menu";
import { buildCriterionMacMenu } from "./items/criterion-mac-menu";
import { buildSettingsMenu } from "./items/settings-menu";
import { setIsNewDocument, setMenuViewMode } from "../shared/constants";
import { MenuViewMode, OnMenuItemClick } from "../types";
import { getBaseWindow } from "../main-window";
import { buildKeyboardMenu } from "./items/keyboard-menu";

export class ApplicationMenu {
  static _instance: ApplicationMenu | null = null

  public static get instance(): ApplicationMenu {
    if (!ApplicationMenu._instance) {
      ApplicationMenu._instance = new ApplicationMenu();
    }

    return ApplicationMenu._instance;
  }

  // private currentDocumentTab: DocumentTab | null = null;
  // private onMenuItemClick: OnMenuItemClick = () => null;

  protected constructor() {
    // Singleton constructor
  }

  buildMenu(onClick: OnMenuItemClick): Menu {
    const taskId = mainLogger.startTask("BuildElectronMenu", "Building the Electron menu.");

    const isMacOS = platform.isMacOS;

    const menuTemplate: MenuItemConstructorOptions[] = [];

    let helpMenu = buildHelpMenu(onClick);

    if (isMacOS) {
      menuTemplate.push(buildCriterionMacMenu(onClick));
      if (Array.isArray(helpMenu?.submenu)) {
        const submenuCopy = [...helpMenu.submenu];
        submenuCopy.pop();
        helpMenu = { ...helpMenu, submenu: submenuCopy };
      }
    }

    menuTemplate.push(buildFileMenu(onClick))
    menuTemplate.push(buildEditMenu(onClick))
    menuTemplate.push(buildInsertMenu(onClick))
    menuTemplate.push(buildReferencesMenu(onClick))
    menuTemplate.push(buildFormatMenu(onClick))
    menuTemplate.push(buildViewMenu(onClick))
    // menuTemplate.push(buildToolsMenu(onClick))
    menuTemplate.push(buildKeyboardMenu(onClick))

    if (helpMenu) {
      menuTemplate.push(helpMenu);
    }

    if (!isMacOS) {
      menuTemplate.push(buildSettingsMenu(onClick));
    }

    if (is.dev) {
      menuTemplate.push(buildDeveloperMenu(onClick))
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    mainLogger.endTask(taskId, "BuildElectronMenu", "Electron menu built successfully.");
    return menu;
  }



  // onUpdate(callback: OnMenuItemClick): ApplicationMenu {
  //   // this.onMenuItemClick = callback;
  //   return ApplicationMenu.instance;
  // }

  // static onUpdate(callback: OnMenuItemClick): void {
  //   const instance = ApplicationMenu.instance;
  //   // instance.onUpdate(callback);
  // }


  // sendUpdate(): ApplicationMenu {
  //   this.onMenuItemClick(null);
  //   return ApplicationMenu.instance;
  // }

  // static sendUpdate(): ApplicationMenu {
  //   const instance = ApplicationMenu.instance;
  //   instance.sendUpdate();
  //   return instance;
  // }

  // setCurrentDocumentTab(documentTab: DocumentTab): ApplicationMenu {
  //   // this.currentDocumentTab = documentTab;
  //   return ApplicationMenu.instance;
  // }

  // static setCurrentDocumentTab(tab: DocumentTab): ApplicationMenu {
  //   const instance = ApplicationMenu.instance
  //   // instance.setCurrentDocumentTab(tab)
  //   return instance
  // }


  setMenuViewMode(mode: MenuViewMode): ApplicationMenu {
    setMenuViewMode(mode)
    return ApplicationMenu.instance
  }

  setIsNewDocument(isNew: boolean): ApplicationMenu {
    setIsNewDocument(isNew)
    return ApplicationMenu.instance
  }

  setReferencesMenuApparatuses(apparatuses: DocumentApparatus[]): ApplicationMenu {
    setReferencesMenuApparatuses(apparatuses)
    return ApplicationMenu.instance
  }

  getReferencesMenuApparatuses(): DocumentApparatus[] {
    return getReferencesMenuApparatuses()
  }

  setAddCommentMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setAddCommentMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getAddCommentMenuItemEnabled(): boolean {
    return getAddCommentMenuItemEnabled()
  }

  setAddBookmarkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setAddBookmarkMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getAddBookmarkMenuItemEnabled(): boolean {
    return getAddBookmarkMenuItemEnabled()
  }

  setCurrentSection(section: string): ApplicationMenu {
    setCurrentSection(section);
    return ApplicationMenu.instance;
  }

  setLinkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setLinkMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getLinkMenuItemEnabled(): boolean {
    return getLinkMenuItemEnabled()
  }

  setRemoveLinkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setRemoveLinkMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getRemoveLinkMenuItemEnabled(): boolean {
    return getRemoveLinkMenuItemEnabled()
  }

  setAddCitationMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setAddCitationMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getAddCitationMenuItemEnabled(): boolean {
    return getAddCitationMenuItemEnabled()
  }

  setSymbolMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setSymbolMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getSymbolMenuItemEnabled(): boolean {
    return getSymbolMenuItemEnabled()
  }

  setAddNoteMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setAddNoteMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getAddNoteMenuItemEnabled(): boolean {
    return getAddNoteMenuItemEnabled()
  }

  setAddReadingsEnabled(isEnable: boolean): ApplicationMenu {
    setAddReadingsEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getAddReadingsEnabled(): boolean {
    return getAddReadingsEnabled()
  }

  setReferencesMenuCurrentContext(context: "maintext_editor" | "apparatus_editor"): ApplicationMenu {
    setReferencesMenuCurrentContext(context)
    return ApplicationMenu.instance
  }

  getReferencesMenuCurrentContext(): "maintext_editor" | "apparatus_editor" {
    return getReferencesMenuCurrentContext();
  }

  setDisabledReferencesMenuItemsIds(items: string[]): ApplicationMenu {
    setDisabledReferencesMenuItemsIds(items)
    return ApplicationMenu.instance
  }

  getDisabledReferencesMenuItemsIds(): string[] {
    return getDisabledReferencesMenuItemsIds()
  }

  setApparatusSubMenuObjectItems(items): ApplicationMenu {
    setApparatusSubMenuObjectItems(items)
    return ApplicationMenu.instance
  }

  getApparatusSubMenuObjectItems(): Apparatus[] {
    return getApparatusSubMenuObjectItems();
  }

  setTocVisible(isVisible: boolean): ApplicationMenu {
    setTocVisible(isVisible)
    return ApplicationMenu.instance
  }

  getTocVisible(): boolean {
    return getTocVisible();
  }

  setLineNumberShowLines(lineNumber: number): ApplicationMenu {
    // Update the global current line number value
    setCurrentLineNumberValue(lineNumber);
    return ApplicationMenu.instance;
  }

  setPrintPreviewVisible(isVisible: boolean): ApplicationMenu {
    setPrintPreviewVisible(isVisible)
    return ApplicationMenu.instance
  }

  getPrintPreviewVisible(): boolean {
    return getPrintPreviewVisible()
  }

  setEnableTocVisibilityMenuItem(isEnable: boolean): ApplicationMenu {
    setEnableTocVisibilityMenuItem(isEnable)
    return ApplicationMenu.instance
  }

  getEnableTocVisibilityMenuItem(): boolean {
    return getEnableTocVisibilityMenuItem();
  }

  setEnableTocSettingsMenu(isEnable: boolean): ApplicationMenu {
    setEnableTocSettingsMenu(isEnable)
    return ApplicationMenu.instance
  }

  getEnableTocSettingsMenu(): boolean {
    return getEnableTocSettingsMenu()
  }

  setInsertMenuEnabled(isEnable: boolean): ApplicationMenu {
    setInsertMenuEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getInsertMenuEnabled(): boolean {
    return getInsertMenuEnabled()
  }

  setTextFormattingMenuEnabled(isEnable: boolean): ApplicationMenu {
    setTextFormattingMenuEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getTextFormattingMenuEnabled(): boolean {
    return getTextFormattingMenuEnabled()
  }

  setSiglumMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    setSiglumMenuItemEnabled(isEnable)
    return ApplicationMenu.instance
  }

  getSiglumMenuItemEnabled(): boolean {
    return getSiglumMenuItemEnabled()
  }

  build(onClick: (menuItem: MenuItem) => void): ApplicationMenu {
    const menu = this.buildMenu(onClick);
    if (platform.isMacOS) {
      Menu.setApplicationMenu(menu)
    } else {
      getBaseWindow()?.setMenu(menu);
    }
    return ApplicationMenu.instance
  }

  static setMenuViewMode(mode: MenuViewMode): ApplicationMenu {
    const instance = ApplicationMenu.instance.setMenuViewMode(mode)
    return instance
  }

  static setIsNewDocument(isNew: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setIsNewDocument(isNew)
    return instance
  }

  static setReferencesMenuApparatuses(apparatuses: DocumentApparatus[]): ApplicationMenu {
    const instance = ApplicationMenu.instance.setReferencesMenuApparatuses(apparatuses)
    return instance
  }

  static getReferencesMenuApparatuses(): DocumentApparatus[] {
    return ApplicationMenu.instance.getReferencesMenuApparatuses()
  }

  static setAddCommentMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setAddCommentMenuItemEnabled(isEnable)
    return instance
  }

  static getAddCommentMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getAddCommentMenuItemEnabled()
  }

  static setAddBookmarkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setAddBookmarkMenuItemEnabled(isEnable)
    return instance
  }

  static getAddBookmarkMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getAddBookmarkMenuItemEnabled()
  }

  static setLinkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setLinkMenuItemEnabled(isEnable)
    return instance
  }

  static getLinkMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getLinkMenuItemEnabled()
  }

  static setCurrentSection(section: string): ApplicationMenu {
    const instance = ApplicationMenu.instance.setCurrentSection(section);
    return instance;
  }

  static setRemoveLinkMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setRemoveLinkMenuItemEnabled(isEnable)
    return instance
  }

  static getRemoveLinkMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getRemoveLinkMenuItemEnabled()
  }

  static setAddCitationMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setAddCitationMenuItemEnabled(isEnable)
    return instance
  }

  static getAddCitationMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getAddCitationMenuItemEnabled()
  }

  static setSymbolMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setSymbolMenuItemEnabled(isEnable)
    return instance
  }

  static getSymbolMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getSymbolMenuItemEnabled()
  }

  static setAddNoteMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setAddNoteMenuItemEnabled(isEnable)
    return instance
  }

  static getAddNoteMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getAddNoteMenuItemEnabled()
  }

  static setAddReadingsEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setAddReadingsEnabled(isEnable)
    return instance
  }

  static getAddReadingsEnabled(): boolean {
    return ApplicationMenu.instance.getAddReadingsEnabled()
  }

  static setReferencesMenuCurrentContext(context: "maintext_editor" | "apparatus_editor"): ApplicationMenu {
    const instance = ApplicationMenu.instance.setReferencesMenuCurrentContext(context)
    return instance
  }

  static getReferencesMenuCurrentContext(): "maintext_editor" | "apparatus_editor" {
    return ApplicationMenu.instance.getReferencesMenuCurrentContext()
  }

  static setDisabledReferencesMenuItemsIds(items: string[]): ApplicationMenu {
    const instance = ApplicationMenu.instance.setDisabledReferencesMenuItemsIds(items)
    return instance
  }

  static getDisabledReferencesMenuItemsIds(): string[] {
    return ApplicationMenu.instance.getDisabledReferencesMenuItemsIds()
  }

  static setApparatusSubMenuObjectItems(items): ApplicationMenu {
    const instance = ApplicationMenu.instance.setApparatusSubMenuObjectItems(items)
    return instance
  }

  static getApparatusSubMenuObjectItems(): Apparatus[] {
    return ApplicationMenu.instance.getApparatusSubMenuObjectItems();
  }

  static setTocVisible(isVisible: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setTocVisible(isVisible)
    return instance
  }

  static setLineNumberShowLines(lineNumber: number): ApplicationMenu {
    const instance = ApplicationMenu.instance.setLineNumberShowLines(lineNumber)
    return instance
  }

  static getTocVisible(): boolean {
    return ApplicationMenu.instance.getTocVisible();
  }

  static setPrintPreviewVisible(isVisible: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setPrintPreviewVisible(isVisible)
    return instance
  }

  static getPrintPreviewVisible(): boolean {
    return ApplicationMenu.instance.getPrintPreviewVisible();
  }

  static setEnableTocVisibilityMenuItem(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setEnableTocVisibilityMenuItem(isEnable)
    return instance
  }

  static getEnableTocVisibilityMenuItem(): boolean {
    return ApplicationMenu.instance.getEnableTocVisibilityMenuItem();
  }

  static setEnableTocSettingsMenu(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setEnableTocSettingsMenu(isEnable)
    return instance
  }

  static getEnableTocSettingsMenu(): boolean {
    return ApplicationMenu.instance.getEnableTocSettingsMenu();
  }

  static setInsertMenuEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setInsertMenuEnabled(isEnable)
    return instance
  }

  static getInsertMenuEnabled(): boolean {
    return ApplicationMenu.instance.getInsertMenuEnabled();
  }

  static setTextFormattingMenuEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setTextFormattingMenuEnabled(isEnable)
    return instance
  }

  static getTextFormattingMenuEnabled(): boolean {
    return ApplicationMenu.instance.getTextFormattingMenuEnabled();
  }

  static setSiglumMenuItemEnabled(isEnable: boolean): ApplicationMenu {
    const instance = ApplicationMenu.instance.setSiglumMenuItemEnabled(isEnable)
    return instance
  }

  static getSiglumMenuItemEnabled(): boolean {
    return ApplicationMenu.instance.getSiglumMenuItemEnabled();
  }

  static build(onClick: (menuItem: MenuItem) => void): ApplicationMenu {
    const instance = ApplicationMenu.instance.build(onClick)
    return instance
  }
}