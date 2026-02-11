
import { CharacterSpacing } from './character-spacing-extension'

describe('CharacterSpacing Extension', () => {
  it('should be named characterSpacing', () => {
    expect(CharacterSpacing.name).toBe('characterSpacing')
  })

  it('should have default options', () => {
    expect(CharacterSpacing.options).toEqual({
      types: ['textStyle'],
      defaultSpacing: 'normal',
      step: 0.15,
    })
  })

  it('should have addGlobalAttributes', () => {
    expect(CharacterSpacing.config.addGlobalAttributes).toBeDefined()
    const attributes = CharacterSpacing.config.addGlobalAttributes?.apply({ options: CharacterSpacing.options } as any)
    expect(attributes).toHaveLength(1)
    expect(attributes?.[0].types).toEqual(['textStyle'])
    expect(attributes?.[0].attributes).toHaveProperty('letterSpacing')
  })

  it('should parse letterSpacing from HTML', () => {
    const attributes = CharacterSpacing.config.addGlobalAttributes?.apply({ options: CharacterSpacing.options } as any)
    const parseHTML = (attributes?.[0].attributes as any)?.letterSpacing.parseHTML
    
    const element = document.createElement('span')
    element.style.letterSpacing = '0.5em'
    
    expect(parseHTML?.(element)).toBe('0.5em')
  })

  it('should return default spacing if no style present', () => {
    const attributes = CharacterSpacing.config.addGlobalAttributes?.apply({ options: CharacterSpacing.options } as any)
    const parseHTML = (attributes?.[0].attributes as any)?.letterSpacing.parseHTML
    
    const element = document.createElement('span')
    
    expect(parseHTML?.(element)).toBe('normal')
  })

  it('should render letterSpacing to HTML', () => {
    const attributes = CharacterSpacing.config.addGlobalAttributes?.apply({ options: CharacterSpacing.options } as any)
    const renderHTML = (attributes?.[0].attributes as any)?.letterSpacing.renderHTML
    
    expect(renderHTML?.({ letterSpacing: '0.5em' })).toEqual({ style: 'letter-spacing: 0.5em' })
  })

  it('should not render default letterSpacing to HTML', () => {
    const attributes = CharacterSpacing.config.addGlobalAttributes?.apply({ options: CharacterSpacing.options } as any)
    const renderHTML = (attributes?.[0].attributes as any)?.letterSpacing.renderHTML
    
    expect(renderHTML?.({ letterSpacing: 'normal' })).toEqual({})
  })

  it('should add commands', () => {
    expect(CharacterSpacing.config.addCommands).toBeDefined()
    const commands = CharacterSpacing.config.addCommands?.apply({ options: CharacterSpacing.options } as any)
    
    expect(commands).toHaveProperty('setCharacterSpacing')
    expect(commands).toHaveProperty('unsetCharacterSpacing')
    expect(commands).toHaveProperty('increaseCharacterSpacing')
    expect(commands).toHaveProperty('decreaseCharacterSpacing')
  })
})
