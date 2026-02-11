
import { CitationMark } from './citation-mark'

export enum CITATION_STYLES {
  PARENTHETICAL = 'parenthetical',
  NARRATIVE = 'narrative'
}

describe('CitationMark Extension', () => {
  it('should be named citation', () => {
    expect(CitationMark.name).toBe('citation')
  })

  it('should not be inclusive', () => {
    expect(CitationMark.config.inclusive).toBe(false)
  })

  it('should define attributes', () => {
    const attributes = CitationMark.config.addAttributes?.apply({} as any)
    expect(attributes).toHaveProperty('bibliography')
    expect(attributes).toHaveProperty('citationStyle')
    expect(attributes).toHaveProperty('fontSize')
    expect(attributes).toHaveProperty('fontWeight')
    expect(attributes).toHaveProperty('fontFamily')
    expect(attributes).toHaveProperty('textAlign')
    expect(attributes).toHaveProperty('lineHeight')
    expect(attributes).toHaveProperty('marginLeft')
    expect(attributes).toHaveProperty('marginRight')
    expect(attributes).toHaveProperty('marginTop')
    expect(attributes).toHaveProperty('marginBottom')
    expect(attributes).toHaveProperty('color')
  })

  describe('Attributes Parsing/Rendering', () => {
    let attributes: any

    beforeEach(() => {
        attributes = CitationMark.config.addAttributes?.apply({} as any)
    })

    it('should parse/render bibliography', () => {
        const element = document.createElement('span')
        const bib = { id: '1', title: 'Test' }
        element.setAttribute('data-bibliography', JSON.stringify(bib))
        
        // Mock getAttribute to behave as parseHTML expects
        // But parseHTML implementation uses element.getAttribute('data-bibliography')
        // We can just verify the logic
        expect(attributes.bibliography.parseHTML(element)).toBe(JSON.stringify(bib))
        
        expect(attributes.bibliography.renderHTML({ bibliography: bib })).toEqual({
            'data-bibliography': JSON.stringify(bib)
        })
    })

    it('should parse/render formatting attributes', () => {
        const element = document.createElement('span')
        element.style.fontSize = '14pt'
        expect(attributes.fontSize.parseHTML(element)).toBe('14pt')
        expect(attributes.fontSize.renderHTML({ fontSize: '14pt' })).toEqual({ style: 'font-size: 14pt' })
    })
  })

  it('should parse HTML tag', () => {
    const rules = CitationMark.config.parseHTML?.apply({} as any)
    expect(rules).toHaveLength(1)
    expect(rules?.[0].tag).toBe('span[data-bibliography]')
  })

  it('should add commands', () => {
    const commands = CitationMark.config.addCommands?.apply({ name: 'citation' } as any)
    expect(commands).toHaveProperty('setCitation')
    expect(commands).toHaveProperty('unsetCitation')
  })
})
