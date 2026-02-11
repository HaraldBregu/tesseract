
import Link from './link-mark'

describe('LinkMark Extension', () => {
  it('should be named link', () => {
    expect(Link.name).toBe('link')
  })

  it('should have default options', () => {
    // We can't easily check default options instance values without instantiating,
    // but we can check the config addOptions return
    const options = Link.config.addOptions?.apply({ parent: () => ({}) } as any)
    expect(options).toHaveProperty('ctrlClick', true)
    expect(options).toHaveProperty('openOnClick', false)
  })

  describe('Attributes', () => {
      let attributes: any
      beforeEach(() => {
          attributes = Link.config.addAttributes?.apply({ parent: () => ({}) } as any)
      })

      it('should handle class attribute', () => {
          const element = document.createElement('a')
          element.className = 'my-link'
          expect(attributes.class.parseHTML(element)).toBe('my-link')
          expect(attributes.class.renderHTML({ class: 'my-link' })).toEqual({ class: 'my-link' })
      })

      it('should handle title attribute', () => {
          const element = document.createElement('a')
          element.title = 'Go to Google'
          expect(attributes.title.parseHTML(element)).toBe('Go to Google')
          expect(attributes.title.renderHTML({ title: 'Go to Google' })).toEqual({ title: 'Go to Google' })
      })
  })

  it('should add proseMirror plugins', () => {
      const plugins = Link.config.addProseMirrorPlugins?.apply({ 
          parent: () => [],
          options: { ctrlClick: true }
      } as any)
      
      expect(plugins?.length).toBeGreaterThan(0)
  })
})
