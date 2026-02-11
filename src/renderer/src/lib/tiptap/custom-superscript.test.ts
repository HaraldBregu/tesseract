
import CustomSuperscript from './custom-superscript'

describe('CustomSuperscript Extension', () => {
  it('should extend Superscript', () => {
    expect(CustomSuperscript.name).toBe('superscript')
  })

  it('should override keyboard shortcuts to be empty', () => {
    expect(CustomSuperscript.config.addKeyboardShortcuts).toBeDefined()
    const shortcuts = CustomSuperscript.config.addKeyboardShortcuts?.apply({} as any)
    expect(shortcuts).toEqual({})
  })
})
