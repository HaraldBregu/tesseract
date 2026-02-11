
import { LetterSpacingMark } from './letter-spacing-mark'

describe('LetterSpacingMark Extension', () => {
  it('should be named letterSpacing', () => {
    expect(LetterSpacingMark.name).toBe('letterSpacing')
  })

  describe('Attributes', () => {
      let attributes: any
      beforeEach(() => {
          attributes = LetterSpacingMark.config.addAttributes?.apply({ parent: () => ({}) } as any)
      })

      it('should parse spacing', () => {
          const element = document.createElement('span')
          element.style.letterSpacing = '0.5em'
          expect(attributes.spacing.parseHTML(element)).toBe('0.5em')
          
          element.style.letterSpacing = ''
          expect(attributes.spacing.parseHTML(element)).toBe('normal')
      })

      it('should render spacing', () => {
          expect(attributes.spacing.renderHTML({ spacing: '0.5em' })).toEqual({ style: 'letter-spacing: 0.5em' })
          expect(attributes.spacing.renderHTML({ spacing: 'normal' })).toEqual({})
      })
  })
})
