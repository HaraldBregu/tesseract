export const useElectron = () => {
  const ipcRenderer = window?.electron?.ipcRenderer

  return {
    ipcRenderer
  }
}