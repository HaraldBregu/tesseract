
import { LineNumbers } from './line-number-extension'

describe('LineNumbers Extension', () => {
  it('should be named lineNumbers', () => {
    expect(LineNumbers.name).toBe('lineNumbers')
  })

  it('should have default options', () => {
    expect(LineNumbers.options).toEqual({
      show: false,
      frequency: 5,
      type: 'arabic',
    })
  })

  it('should add storage', () => {
    const storage = LineNumbers.config.addStorage?.apply({ options: LineNumbers.options } as any)
    expect(storage).toEqual({
      options: LineNumbers.options
    })
  })

  it('should add commands', () => {
    const commands = LineNumbers.config.addCommands?.apply({
      storage: { options: { ...LineNumbers.options } }
    } as any)
    
    expect(commands).toHaveProperty('toggleLineNumbers')
    expect(commands).toHaveProperty('setLineNumberFrequency')
    expect(commands).toHaveProperty('setLineNumberType')
  })
})
