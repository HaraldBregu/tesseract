
import { adjustCapitalization, adjustLetterSpacing } from './editor-transformation'
import { toTitleCasePreserve } from '../title-case-util'

jest.mock('../title-case-util', () => ({
  toTitleCasePreserve: jest.fn((text) => `Title Case: ${text}`),
}))

describe('Editor Transformations', () => {
  let mockEditor: any

  beforeEach(() => {
    mockEditor = {
      state: {
        selection: { from: 0, to: 10 },
        doc: {
          textBetween: jest.fn().mockReturnValue('some text'),
          nodesBetween: jest.fn(),
        },
        schema: {
            marks: {
                capitalization: 'capitalization-mark-type'
            },
            text: jest.fn()
        },
        tr: {
            replaceWith: jest.fn(),
            removeMark: jest.fn(),
            mapping: {
                maps: []
            },
            steps: []
        }
      },
      view: {
          dispatch: jest.fn()
      },
      chain: jest.fn().mockReturnThis(),
      focus: jest.fn().mockReturnThis(),
      setMark: jest.fn().mockReturnThis(),
      insertContentAt: jest.fn().mockReturnThis(),
      run: jest.fn(),
      getAttributes: jest.fn().mockReturnValue({}),
    }
  })

  describe('adjustCapitalization', () => {
    it('should do nothing if editor is null', () => {
      adjustCapitalization(null, 'allCaps')
      expect(mockEditor.chain).not.toHaveBeenCalled()
    })

    it('should handle simple capitalization types', () => {
      adjustCapitalization(mockEditor, 'allCaps')
      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockEditor.setMark).toHaveBeenCalledWith('capitalization', { style: 'uppercase' })
      expect(mockEditor.run).toHaveBeenCalled()

      adjustCapitalization(mockEditor, 'smallCaps')
      expect(mockEditor.setMark).toHaveBeenCalledWith('capitalization', { style: 'small-caps' })

      adjustCapitalization(mockEditor, 'startCase')
      expect(mockEditor.setMark).toHaveBeenCalledWith('capitalization', { style: 'capitalize' })
    })

    it('should handle titleCase', () => {
      mockEditor.state.doc.nodesBetween.mockImplementation((_start, _end, callback) => {
          callback({ isText: true, marks: [] })
      })

      adjustCapitalization(mockEditor, 'titleCase')

      expect(toTitleCasePreserve).toHaveBeenCalledWith('some text')
      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockEditor.insertContentAt).toHaveBeenCalled()
      const insertArg = mockEditor.insertContentAt.mock.calls[0][1]
      expect(insertArg).toMatchObject({
        type: 'text',
        text: 'Title Case: some text',
        marks: expect.arrayContaining([{
          type: 'capitalization',
          attrs: { style: 'title-case', originalText: 'some text' }
        }])
      })
    })

    it('should handle none type (remove capitalization)', () => {
        const mockNode = {
            isText: true,
            nodeSize: 5,
            marks: [{
                type: { name: 'capitalization' },
                attrs: { originalText: 'original' }
            }]
        }
        mockEditor.state.doc.nodesBetween.mockImplementation((_from, _to, cb) => cb(mockNode, 0))
        
        adjustCapitalization(mockEditor, 'none')

        expect(mockEditor.state.tr.replaceWith).toHaveBeenCalled()
        expect(mockEditor.state.tr.removeMark).toHaveBeenCalled()
        expect(mockEditor.view.dispatch).toHaveBeenCalled()
    })
  })

  describe('adjustLetterSpacing', () => {
    it('should do nothing if editor is null', () => {
      adjustLetterSpacing(null, 'normal')
      expect(mockEditor.chain).not.toHaveBeenCalled()
    })

    it('should set tighten spacing', () => {
      adjustLetterSpacing(mockEditor, 'tighten')
      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockEditor.setMark).toHaveBeenCalledWith('letterSpacing', { spacing: '-0.05em' })
      expect(mockEditor.run).toHaveBeenCalled()
    })

    it('should set loosen spacing', () => {
      adjustLetterSpacing(mockEditor, 'loosen')
      expect(mockEditor.setMark).toHaveBeenCalledWith('letterSpacing', { spacing: '0.2em' })
    })

    it('should set normal spacing', () => {
      adjustLetterSpacing(mockEditor, 'normal')
      expect(mockEditor.setMark).toHaveBeenCalledWith('letterSpacing', { spacing: 'normal' })
    })
  })
})
