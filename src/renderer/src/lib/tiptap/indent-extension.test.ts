
import IndentExtension from './indent-extension'

describe('IndentExtension', () => {
  it('should be named indent', () => {
    expect(IndentExtension.name).toBe('indent')
  })

  it('should have default options', () => {
    expect(IndentExtension.options).toEqual({
      maxIndent: 8,
      indentStep: 40,
    })
  })

  describe('Global Attributes', () => {
    let attributes: any
    let options: any

    beforeEach(() => {
      options = IndentExtension.options
      const attrs = IndentExtension.config.addGlobalAttributes?.apply({ options } as any)
      attributes = attrs?.[0].attributes
    })

    it('should parse indent from data-indent', () => {
      const element = document.createElement('p')
      element.setAttribute('data-indent', '3')
      expect(attributes.indent.parseHTML(element)).toBe(3)
    })

    it('should default indent to 0', () => {
      const element = document.createElement('p')
      expect(attributes.indent.parseHTML(element)).toBe(0)
    })

    it('should render style and data attribute', () => {
      const result = attributes.indent.renderHTML({ indent: 2 })
      expect(result.style).toContain('margin-left: 80px') // 2 * 40
      expect(result['data-indent']).toBe(2)
    })
  })

  it('should add commands', () => {
    expect(IndentExtension.config.addCommands).toBeDefined()
    const commands = IndentExtension.config.addCommands?.apply({
        options: IndentExtension.options
    } as any)
    expect(commands).toHaveProperty('increaseIndent')
    expect(commands).toHaveProperty('decreaseIndent')
  })

  it('should add keyboard shortcuts', () => {
    expect(IndentExtension.config.addKeyboardShortcuts).toBeDefined()
    const shortcuts = IndentExtension.config.addKeyboardShortcuts?.apply({} as any)
    expect(shortcuts).toHaveProperty('Shift-Tab')
    expect(shortcuts).toHaveProperty('Backspace')
  })
})
