
import { CustomStyleMark } from './custom-style-mark'

describe('CustomStyleMark Extension', () => {
  it('should be named customStyleMark', () => {
    expect(CustomStyleMark.name).toBe('customStyleMark')
  })

  it('should have inclusive true', () => {
      expect(CustomStyleMark.config.inclusive).toBe(true)
  })

  describe('Attributes', () => {
      let attributes: any

      beforeEach(() => {
          attributes = CustomStyleMark.config.addAttributes?.apply({} as any)
      })

      it('should have styleId', () => {
          const element = document.createElement('span')
          element.setAttribute('data-style-id', 'test-id')
          expect(attributes.styleId.parseHTML(element)).toBe('test-id')
          expect(attributes.styleId.renderHTML({ styleId: 'test-id' })).toEqual({ 'data-style-id': 'test-id' })
      })

      it('should have fontSize', () => {
          const element = document.createElement('span')
          element.style.fontSize = '10pt'
          expect(attributes.fontSize.parseHTML(element)).toBe('10pt')
          expect(attributes.fontSize.renderHTML({ fontSize: '10pt' })).toEqual({ style: 'font-size: 10pt' })
      })
  })

  it('should add commands', () => {
    const commands = CustomStyleMark.config.addCommands?.apply({ name: 'customStyleMark' } as any)
    expect(commands).toHaveProperty('setCustomStyleMark')
    expect(commands).toHaveProperty('unsetCustomStyleMark')
  })
})
