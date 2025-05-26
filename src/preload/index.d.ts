
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    store: unknown
    tabs: ITabsAPI
    menu: IMenuAPI
    system: ISystemAPI,
    application: IApplicationAPI,
    doc: IDocumentAPI
  }
}

interface ITabsAPI {
  new: () => Promise<number>
  close: (id: number) => Promise<void>
  select: (id: number) => Promise<void>
  reorder: (tabIds: number[]) => Promise<void>
  getAllContentViewsIds: () => Promise<number[]>
  getSelectedTabId: () => Promise<number>
}

interface IMenuAPI {
  disableReferencesMenuItems: (items: string[]) => Promise<void>
  updateViewApparatusesMenuItems: (items: { id: string, title: string, visible: boolean }[]) => Promise<void>
}

interface IDocumentAPI {
  getTemplatesFilenames: () => Promise<string[]>
  getApparatuses: () => Promise<unknown[]>
  setApparatuses: (apparatuses: unknown[]) => Promise<void>
}

interface ISystemAPI {
  getUserInfo: () => Promise<void>
}

interface IApplicationAPI {
  toolbarIsVisible: () => Promise<boolean>
}

