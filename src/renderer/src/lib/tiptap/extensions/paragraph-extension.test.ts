
import { ExtendedParagraph } from './paragraph-extension'

describe('ExtendedParagraph Extension', () => {
  it('should be named paragraph', () => {
    expect(ExtendedParagraph.name).toBe('paragraph')
  })

  it('should define extended attributes', () => {
    const attributes = ExtendedParagraph.config.addAttributes?.apply({
        parent: () => ({})
    } as any) as any

    expect(attributes).toHaveProperty('fontSize')
    expect(attributes).toHaveProperty('fontFamily')
    expect(attributes).toHaveProperty('fontWeight')
    expect(attributes).toHaveProperty('fontStyle')
    expect(attributes).toHaveProperty('textAlign')
    expect(attributes).toHaveProperty('marginLeft')
    expect(attributes).toHaveProperty('marginRight')
    expect(attributes).toHaveProperty('marginTop')
    expect(attributes).toHaveProperty('marginBottom')
    expect(attributes).toHaveProperty('lineHeight')
    expect(attributes).toHaveProperty('color')
  })

  describe('Attributes Parsing/Rendering', () => {
      let attributes: any 

      beforeEach(() => {
          attributes = ExtendedParagraph.config.addAttributes?.apply({ parent: () => ({}) } as any)
      })

      it('should render fontSize', () => {
          const result = attributes.fontSize.renderHTML({ fontSize: '14pt' })
          expect(result.style).toBe('font-size: 14pt')
      })

      it('should parse fontSize from style', () => {
          const element = document.createElement('p')
          element.style.fontSize = '14pt'
          expect(attributes.fontSize.parseHTML(element)).toBe('14pt')
      })
      
      it('should default to defaults if missing', () => {
           const element = document.createElement('p')
           expect(attributes.fontSize.parseHTML(element)).toBe('12pt')
      })
  })

  it('should render complete HTML with styles', () => {
    const node = {
        attrs: {
            indent: 1,
            fontSize: '14pt'
        }
    }
    const result = ExtendedParagraph.config.renderHTML?.apply({} as any, [{ node, HTMLAttributes: {} }] as any)
    
    expect(result).toBeDefined()
    expect(result?.[0]).toBe('p')
    const styles = result?.[1].style
    expect(styles).toContain('font-size: 14pt')
    expect(styles).toContain('margin-left: 40px') // indent 1 * 40
  })

  it('should add commands', () => {
      const commands = ExtendedParagraph.config.addCommands?.apply({ parent: () => ({}) } as any)
      expect(commands).toHaveProperty('setParagraph')
      expect(commands).toHaveProperty('setParagraphStyle')
  })
})
