
import { ExtendedBulletList } from './extended-bullet-list'

describe('ExtendedBulletList Extension', () => {
    it('should be named bulletList', () => {
        expect(ExtendedBulletList.name).toBe('bulletList')
    })

    it('should have addAttributes', () => {
        expect(ExtendedBulletList.config.addAttributes).toBeDefined()
        const attributes = ExtendedBulletList.config.addAttributes?.apply({
            parent: () => ({ parentAttr: {} })
        } as any)

        expect(attributes).toHaveProperty('bulletType')
        expect(attributes).toHaveProperty('markerColor')
        expect(attributes).toHaveProperty('markerBold')
        expect(attributes).toHaveProperty('markerItalic')
        expect(attributes).toHaveProperty('markerFontSize')
        expect(attributes).toHaveProperty('markerFontFamily')
    })

    describe('bulletType attribute', () => {
        let parseHTML: any
        let renderHTML: any

        beforeEach(() => {
            const attributes = ExtendedBulletList.config.addAttributes?.apply({ parent: () => ({}) } as any)
            parseHTML = (attributes as any)?.bulletType.parseHTML
            renderHTML = (attributes as any)?.bulletType.renderHTML
        })

        it('should parse list-style-type from HTML', () => {
            const element = document.createElement('ul')
            element.style.listStyleType = 'circle'
            expect(parseHTML(element)).toBe('circle')
        })

        it('should default to disc if no style present', () => {
            const element = document.createElement('ul')
            expect(parseHTML(element)).toBe('disc')
        })

        it('should render HTML with styles', () => {
            const attrs = {
                bulletType: 'square',
                markerColor: 'red',
                markerBold: true,
                markerItalic: false,
                markerFontSize: '12pt',
                markerFontFamily: 'Arial'
            }
            const result = renderHTML(attrs)
            expect(result.style).toContain('list-style-type: square !important')
            expect(result.style).toContain('--marker-color: red')
            expect(result.style).toContain('--marker-bold: bold')
            expect(result.style).toContain('--marker-italic: normal')
            expect(result.style).toContain('--marker-font-size: 12pt')
            expect(result.style).toContain('--marker-font-family: Arial')
            
            expect(result['data-marker-color']).toBe('red')
            expect(result['data-marker-bold']).toBe('true')
            expect(result['data-marker-italic']).toBe('false')
            expect(result['data-marker-font-size']).toBe('12pt')
            expect(result['data-marker-font-family']).toBe('Arial')
        })
    })

    describe('marker attributes parsing', () => {
        let attributes: any

        beforeEach(() => {
            attributes = ExtendedBulletList.config.addAttributes?.apply({ parent: () => ({}) } as any)
        })

        it('should parse markerColor', () => {
            const element = document.createElement('ul')
            element.setAttribute('data-marker-color', 'blue')
            expect(attributes.markerColor.parseHTML(element)).toBe('blue')
        })

        it('should parse markerBold', () => {
            const element = document.createElement('ul')
            element.setAttribute('data-marker-bold', 'true')
            expect(attributes.markerBold.parseHTML(element)).toBe(true)
            element.setAttribute('data-marker-bold', 'false')
            expect(attributes.markerBold.parseHTML(element)).toBe(false)
        })
    })

    it('should have updateBulletListMarkerStyles command', () => {
        expect(ExtendedBulletList.config.addCommands).toBeDefined()
        const commands = ExtendedBulletList.config.addCommands?.apply({
            parent: () => ({})
        } as any)
        expect(commands).toHaveProperty('updateBulletListMarkerStyles')
    })
})
