import Store from 'electron-store'

const store = new Store()

export interface Tab {
  id: number
  url: string
  selected: boolean
  filePath: string
}

export function getTabs(): Tab[] | null {
  const initialTab = {
    url: '',
    selected: false,
    filePath: ''
  }

  return store.get('tabs', [initialTab]) as Tab[]
}

export function setTabsFromUrls(urls: string[]): void {
  const currentTabs = getTabs()

  const newTabs = urls.map((tabUrl, index) => ({
    url: tabUrl,
    selected: index === urls.length - 1,
    filePath: currentTabs?.[index]?.filePath
  }))

  store.set('tabs', newTabs ?? [])
}

export function setSelectedTabIndex(index: number): void {
  const tabs = getTabs()

  tabs?.forEach((tab, i) => {
    if (i === index) {
      tab.selected = true
    } else {
      tab.selected = false
    }
  })

  store.set('tabs', tabs)
}

export function getSelectedTab(): Tab | null {
  return getTabs()?.find((tab) => tab.selected) ?? null
}

export function getSelectedTabIndex(): number {
  const tabs = getTabs()

  if (!tabs) return -1

  const selectedTabIndex = tabs.findIndex((tab) => tab.selected)

  if (selectedTabIndex === -1) return -1

  return selectedTabIndex;
}

export function setFilePathForSelectedTab(path: string): void {
  const tabs = getTabs()
  if (!tabs) return

  const selectedTabIndex = getSelectedTabIndex()
  tabs[selectedTabIndex].filePath = path
  store.set('tabs', tabs)
}