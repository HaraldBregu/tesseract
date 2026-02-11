
import LigatureMark from './ligature-mark'

describe('LigatureMark Extension', () => {
  it('should be named ligature', () => {
    expect(LigatureMark.name).toBe('ligature')
  })

  it('should have correct default options', () => {
    expect(LigatureMark.options.ligatureTypes).toEqual({
      standard: 'common-ligatures',
      all: 'common-ligatures discretionary-ligatures historical-ligatures contextual',
      none: 'none'
    })
  })

  describe('Attributes', () => {
    let typeAttr: any

    beforeEach(() => {
      const attributes = LigatureMark.config.addAttributes?.apply({} as any)
      typeAttr = (attributes as any)?.type
    })

    it('should parse standard ligatures', () => {
      const element = document.createElement('span')
      element.style.fontVariantLigatures = 'common-ligatures'
      // Mock getAttribute to behave as parseHTML expects (it reads 'style' attr string)
        // Actually the code uses element.getAttribute('style')
      element.setAttribute('style', 'font-variant-ligatures: common-ligatures;')
      expect(typeAttr.parseHTML(element)).toBe('standard')
    })

    it('should parse all ligatures', () => {
      const element = document.createElement('span')
      element.setAttribute('style', 'font-variant-ligatures: discretionary-ligatures;')
      expect(typeAttr.parseHTML(element)).toBe('all')
    })
    
     it('should parse none ligatures', () => {
      const element = document.createElement('span')
      element.setAttribute('style', 'font-variant-ligatures: none;')
      expect(typeAttr.parseHTML(element)).toBe('none')
    })
  })

  describe('renderHTML', () => {
    it('should render correctly for standard type', () => {
      const result = LigatureMark.config.renderHTML?.apply({ options: LigatureMark.options } as any, [{ HTMLAttributes: { type: 'standard' } }] as any)
      // result is ['span', attrs, 0]
      const attrs = result?.[1]
      expect(attrs?.style).toContain('font-variant-ligatures: common-ligatures')
      expect(attrs?.class).toBe('ligature-standard')
    })
  })
})
