
import LineSpacing from './line-spacing-extension'

describe('LineSpacing Extension', () => {
  it('should be named lineSpacing', () => {
    expect(LineSpacing.name).toBe('lineSpacing')
  })

  describe('Global Attributes', () => {
      let attributes: any
      
      beforeEach(() => {
          const globalAttrs = LineSpacing.config.addGlobalAttributes?.apply({ options: { types: ['paragraph'] } } as any)
          attributes = globalAttrs?.[0].attributes
      })

      it('should parse lineHeight', () => {
        const element = document.createElement('p')
        element.setAttribute('data-line-height', '1.5')
        expect(attributes.lineHeight.parseHTML(element)).toBe(1.5)
      })

      it('should render lineHeight', () => {
        const result = attributes.lineHeight.renderHTML({ lineHeight: 1.5, marginTop: 10, marginBottom: 10 })
        expect(result.style).toContain('line-height: 1.5')
        expect(result['data-line-height']).toBe(1.5)
      })
  })

  it('should add commands', () => {
      const commands = LineSpacing.config.addCommands?.apply({ options: { types: ['paragraph'] } } as any)
      expect(commands).toHaveProperty('setLineSpacing')
      expect(commands).toHaveProperty('resetLineSpacing')
  })
})
