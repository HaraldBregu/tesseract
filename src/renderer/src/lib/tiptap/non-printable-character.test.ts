
import { NonPrintableCharacters } from './non-printable-character'

describe('NonPrintableCharacters Extension', () => {
  it('should be named nonPrintingCharacter', () => {
    expect(NonPrintableCharacters.name).toBe('nonPrintingCharacter')
  })

  it('should have default options', () => {
    expect(NonPrintableCharacters.options.visible).toBe(false)
    expect(NonPrintableCharacters.options.textCharacters).toHaveLength(3)
  })

  it('should add commands', () => {
    expect(NonPrintableCharacters.config.addCommands).toBeDefined()
    const commands = NonPrintableCharacters.config.addCommands?.apply({ options: { visible: false } } as any)
    expect(commands).toHaveProperty('setShowNonPrintingCharacters')
  })

  it('should add proseMirror plugins', () => {
    expect(NonPrintableCharacters.config.addProseMirrorPlugins).toBeDefined()
    const plugins = NonPrintableCharacters.config.addProseMirrorPlugins?.apply({ options: NonPrintableCharacters.options, editor: { on: jest.fn() } } as any)
    expect(plugins).toHaveLength(1)
  })
})
