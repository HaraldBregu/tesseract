
import { ExtendedListItem } from './extended-list-item'

// Mock getNextBulletType
jest.mock('@/lib/utils/list-type-mappers', () => ({
    getNextBulletType: jest.fn((type) => type === 'disc' ? 'circle' : 'square'),
}), { virtual: true })

describe('ExtendedListItem Extension', () => {
    it('should be named listItem', () => {
        expect(ExtendedListItem.name).toBe('listItem')
    })

    it('should have keyboard shortcuts', () => {
        expect(ExtendedListItem.config.addKeyboardShortcuts).toBeDefined()
        const shortcuts = ExtendedListItem.config.addKeyboardShortcuts?.apply({
            // Mock implicit this context if used, though strict simple mock might be enough
            editor: {}
        } as any)
        
        expect(shortcuts).toHaveProperty('Enter')
        expect(shortcuts).toHaveProperty('Tab')
        expect(shortcuts).toHaveProperty('Shift-Tab')
        expect(shortcuts).toHaveProperty('Backspace')
    })

    it('Tab shortcut logic existence', () => {
        // Just verify the function is returned
        const shortcuts = ExtendedListItem.config.addKeyboardShortcuts?.apply({
            editor: { commands: {}, isActive: jest.fn(), state: { selection: {} } }
        } as any)
        
        expect(typeof shortcuts?.['Tab']).toBe('function')
    })
})
