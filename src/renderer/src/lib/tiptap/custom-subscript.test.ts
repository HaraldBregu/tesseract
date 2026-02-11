
import CustomSubscript from './custom-subscript'

describe('CustomSubscript Extension', () => {
  it('should extend Subscript', () => {
    expect(CustomSubscript.name).toBe('subscript')
  })

  it('should override keyboard shortcuts to be empty', () => {
    expect(CustomSubscript.config.addKeyboardShortcuts).toBeDefined()
    const shortcuts = CustomSubscript.config.addKeyboardShortcuts?.apply({} as any)
    expect(shortcuts).toEqual({})
  })
})
