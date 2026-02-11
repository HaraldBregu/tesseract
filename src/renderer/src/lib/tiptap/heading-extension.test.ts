
import { ExtendedHeading } from './heading-extension'

describe('ExtendedHeading Extension', () => {
    it('should be named heading', () => {
        expect(ExtendedHeading.name).toBe('heading')
    })

    it('should configure levels', () => {
        expect(ExtendedHeading.options.levels).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should define extended attributes', () => {
        expect(ExtendedHeading.config.addAttributes).toBeDefined()
        const attributes = ExtendedHeading.config.addAttributes?.apply({} as any)
        
        expect(attributes).toHaveProperty('level')
        expect(attributes).toHaveProperty('fontSize')
        expect(attributes).toHaveProperty('fontWeight')
        expect(attributes).toHaveProperty('fontStyle')
        expect(attributes).toHaveProperty('color')
        expect(attributes).toHaveProperty('fontFamily')
        expect(attributes).toHaveProperty('textAlign')
        expect(attributes).toHaveProperty('marginTop')
        expect(attributes).toHaveProperty('marginBottom')
        expect(attributes).toHaveProperty('marginLeft')
        expect(attributes).toHaveProperty('marginRight')
    })

    describe('fontSize attribute', () => {
        let parseHTML: any
        let renderHTML: any

        beforeEach(() => {
            const attributes = ExtendedHeading.config.addAttributes?.apply({} as any)
            parseHTML = (attributes as any)?.fontSize.parseHTML
            renderHTML = (attributes as any)?.fontSize.renderHTML
        })

        it('should parse font-size from style', () => {
            const element = document.createElement('h1')
            element.style.fontSize = '24pt'
            expect(parseHTML(element)).toBe('24pt')
        })

        it('should render font-size style', () => {
            const result = renderHTML({ fontSize: '20pt', level: 1 })
            expect(result.style).toBe('font-size: 20pt')
        })
    })

    it('should add commands', () => {
        expect(ExtendedHeading.config.addCommands).toBeDefined()
        const commands = ExtendedHeading.config.addCommands?.apply({} as any)
        
        expect(commands).toHaveProperty('setHeading')
        expect(commands).toHaveProperty('setHeadingStyle')
    })

    it('should render HTML with styles', () => {
        expect(ExtendedHeading.config.renderHTML).toBeDefined()
        const node = {
            attrs: {
                level: 1,
                fontSize: '30pt',
                color: 'blue',
                indent: 0
            }
        }
        const result = ExtendedHeading.config.renderHTML?.apply({} as any, [{ node, HTMLAttributes: {} } as any])
        
        if (result) {
            expect(result[0]).toBe('h1')
            expect(result[1].style).toContain('font-size: 30pt')
            expect(result[1].style).toContain('color: blue')
            expect(result[1]['data-font-size']).toBe('30pt')
        }
    })
})
