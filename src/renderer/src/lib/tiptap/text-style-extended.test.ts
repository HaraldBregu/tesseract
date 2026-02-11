
import TextStyleExtended from './text-style-extended'

describe('TextStyleExtended', () => {
    it('should be named textStyle', () => {
        expect(TextStyleExtended.name).toBe('textStyle')
    })

    describe('Attributes', () => {
        let attributes: any

        beforeEach(() => {
            const attrs = TextStyleExtended.config.addAttributes?.apply({ 
                parent: () => ({ parentAttr: {} }) 
            } as any)
            attributes = attrs
        })

        it('should have fontSize attribute', () => {
             const fontSize = attributes.fontSize
             expect(fontSize).toBeDefined()
             
             const element = document.createElement('span')
             element.style.fontSize = '20px'
             expect(fontSize.parseHTML(element)).toBe('20px')

             expect(fontSize.renderHTML({ fontSize: '20px' })).toEqual({ style: 'font-size: 20px' })
             expect(fontSize.renderHTML({})).toEqual({})
        })

        it('should have fontFamily attribute', () => {
             const fontFamily = attributes.fontFamily
             expect(fontFamily).toBeDefined()
             
             const element = document.createElement('span')
             element.style.fontFamily = 'Arial'
             expect(fontFamily.parseHTML(element)).toBe('Arial')

             expect(fontFamily.renderHTML({ fontFamily: 'Arial' })).toEqual({ style: 'font-family: Arial' })
             expect(fontFamily.renderHTML({})).toEqual({})

        })

        it('should have color attribute', () => {
             const color = attributes.color
             expect(color).toBeDefined()
             
             const element = document.createElement('span')
             element.style.color = 'red'
             expect(color.parseHTML(element)).toBe('red')

             expect(color.renderHTML({ color: 'red' })).toEqual({ style: 'color: red' })
        })
    })
})
