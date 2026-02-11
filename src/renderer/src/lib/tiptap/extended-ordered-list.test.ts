
import { ExtendedOrderedList } from './extended-ordered-list'

// Mock list-type-mappers
jest.mock('@/lib/utils/list-type-mappers', () => ({
    orderedListTypeToStyle: { '1': 'decimal', 'a': 'lower-alpha' },
    orderedListStyleToType: { 'decimal': '1', 'lower-alpha': 'a' }
}), { virtual: true })

describe('ExtendedOrderedList Extension', () => {
    it('should be named orderedList', () => {
        expect(ExtendedOrderedList.name).toBe('orderedList')
    })

    it('should have addAttributes', () => {
        expect(ExtendedOrderedList.config.addAttributes).toBeDefined()
        const attributes = ExtendedOrderedList.config.addAttributes?.apply({
            parent: () => ({ parentAttr: {} })
        } as any)

        expect(attributes).toHaveProperty('listType')
        expect(attributes).toHaveProperty('markerColor')
    })

    describe('listType attribute', () => {
        let parseHTML: any
        let renderHTML: any

        beforeEach(() => {
            const attributes = ExtendedOrderedList.config.addAttributes?.apply({ parent: () => ({}) } as any)
            parseHTML = (attributes as any)?.listType.parseHTML
            renderHTML = (attributes as any)?.listType.renderHTML
        })

        it('should parse type attribute', () => {
            const element = document.createElement('ol')
            element.setAttribute('type', 'a')
            expect(parseHTML(element)).toBe('a')
        })

        it('should parse list-style-type style', () => {
            const element = document.createElement('ol')
            element.style.listStyleType = 'lower-alpha'
            expect(parseHTML(element)).toBe('a')
        })

        it('should render HTML with mapped styles', () => {
            const attrs = {
                listType: 'a',
                markerColor: 'green'
            }
            const result = renderHTML(attrs)
            expect(result.style).toContain('list-style-type: lower-alpha !important')
            expect(result.style).toContain('--marker-color: green')
            expect(result.type).toBe('a')
        })
    })

    it('should have updateOrderedListMarkerStyles command', () => {
        expect(ExtendedOrderedList.config.addCommands).toBeDefined()
        const commands = ExtendedOrderedList.config.addCommands?.apply({
            parent: () => ({})
        } as any)
        expect(commands).toHaveProperty('updateOrderedListMarkerStyles')
    })
})
