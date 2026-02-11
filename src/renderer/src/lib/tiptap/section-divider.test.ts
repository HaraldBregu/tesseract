
import SectionDivider from './section-divider'

describe('SectionDivider Extension', () => {
  it('should be named sectionDivider', () => {
    expect(SectionDivider.name).toBe('sectionDivider')
  })

  it('should be a block node', () => {
    expect(SectionDivider.type).toBe('node')
    expect(SectionDivider.config.group).toBe('block')
  })

  it('should define attributes', () => {
    const attributes = SectionDivider.config.addAttributes?.apply({} as any)
    expect(attributes).toHaveProperty('sectionType')
    expect(attributes).toHaveProperty('label')
  })

  it('should parse HTML', () => {
    const rules = SectionDivider.config.parseHTML?.apply({} as any)
    expect(rules).toHaveLength(1)
    expect(rules?.[0].tag).toBe('div[data-type="section-divider"]')
    
    // Test getAttrs
    const element = document.createElement('div')
    element.setAttribute('data-section-type', 'chapter')
    const attrs = rules?.[0].getAttrs?.(element)
    expect(attrs).toEqual({ sectionType: 'chapter' })
  })

  it('should render HTML', () => {
    const result = SectionDivider.config.renderHTML?.apply({} as any, [{ HTMLAttributes: { sectionType: 'part', label: 'Part 1' } }] as any)
    
    // result is ['div', attrs]
    const attrs = result?.[1]
    expect(attrs?.['data-type']).toBe('section-divider')
    expect(attrs?.['data-section-type']).toBe('part')
    expect(attrs?.class).toContain('section-divider-part')
  })
})
