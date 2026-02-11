
import { ListMarkerSyncExtension } from './list-marker-sync-extension'

describe('ListMarkerSyncExtension', () => {
  it('should be named listMarkerSync', () => {
    expect(ListMarkerSyncExtension.name).toBe('listMarkerSync')
  })

  it('should add proseMirror plugins', () => {
    expect(ListMarkerSyncExtension.config.addProseMirrorPlugins).toBeDefined()
    const plugins = ListMarkerSyncExtension.config.addProseMirrorPlugins?.apply({ editor: {} } as any)
    expect(plugins).toHaveLength(1)
  })
})
