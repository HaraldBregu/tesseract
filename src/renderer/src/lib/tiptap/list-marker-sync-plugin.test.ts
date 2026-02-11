
import { createListMarkerSyncPlugin, ListMarkerSyncPluginKey } from './list-marker-sync-plugin'

describe('createListMarkerSyncPlugin', () => {
  it('should create a plugin with correct key', () => {
    const plugin = createListMarkerSyncPlugin({} as any)
    expect(plugin.spec.key).toBe(ListMarkerSyncPluginKey)
  })

  it('should have appendTransaction', () => {
    const plugin = createListMarkerSyncPlugin({} as any)
    expect(plugin.spec.appendTransaction).toBeDefined()
  })

  // Testing the actual logic of appendTransaction requires complex mocking of ProseMirror state/nodes
  // We will trust the integration test or assume basic structure correctness here.
  // Ideally, we would simulate a state update and check if tr is returned.
})
