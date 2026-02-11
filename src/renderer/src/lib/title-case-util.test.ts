import { toTitleCasePreserve } from './title-case-util';

describe('toTitleCasePreserve', () => {
  describe('basic functionality', () => {
    it('capitalizes single word', () => {
      expect(toTitleCasePreserve('hello')).toBe('Hello');
    });

    it('capitalizes first letter of each word', () => {
      expect(toTitleCasePreserve('hello world')).toBe('Hello World');
    });

    it('preserves existing capitalization after first letter', () => {
      expect(toTitleCasePreserve('heLLO wORLD')).toBe('HeLLO WORLD');
    });
  });

  describe('first and last word', () => {
    it('always capitalizes first word', () => {
      expect(toTitleCasePreserve('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('always capitalizes last word', () => {
      expect(toTitleCasePreserve('what did you think of')).toBe('What Did You Think Of');
    });

    it('capitalizes both when only one word', () => {
      expect(toTitleCasePreserve('test')).toBe('Test');
    });
  });

  describe('minor words', () => {
    it('keeps "and" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('cats and dogs run')).toBe('Cats and Dogs Run');
    });

    it('keeps "or" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('this or that option')).toBe('This or That Option');
    });

    it('keeps "but" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('not this but that works')).toBe('Not This but That Works');
    });

    it('keeps "a" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('once upon a time story')).toBe('Once Upon a Time Story');
    });

    it('keeps "an" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('this is an example here')).toBe('This Is an Example Here');
    });

    it('keeps "the" lowercase when not first or last', () => {
      expect(toTitleCasePreserve('over the river away')).toBe('Over the River Away');
    });

    it('capitalizes minor word if first word', () => {
      expect(toTitleCasePreserve('the end')).toBe('The End');
    });

    it('capitalizes minor word if last word', () => {
      expect(toTitleCasePreserve('where is the')).toBe('Where Is The');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(toTitleCasePreserve('')).toBe('');
    });

    it('handles single character', () => {
      expect(toTitleCasePreserve('a')).toBe('A');
    });

    it('handles multiple spaces', () => {
      const result = toTitleCasePreserve('hello   world');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('handles already capitalized text', () => {
      expect(toTitleCasePreserve('HELLO WORLD')).toBe('HELLO WORLD');
    });

    it('handles mixed case', () => {
      expect(toTitleCasePreserve('hElLo WoRlD')).toBe('HElLo WoRlD');
    });

    it('handles special characters preserved', () => {
      expect(toTitleCasePreserve("don't stop")).toBe("Don't Stop");
    });
  });

  describe('real-world examples', () => {
    it('handles book title', () => {
      // Implementation doesn't include 'in' as minor word, so it gets capitalized
      expect(toTitleCasePreserve('the catcher in the rye')).toBe('The Catcher In the Rye');
    });

    it('handles article title', () => {
      // Implementation doesn't include 'of' as minor word, so it gets capitalized  
      expect(toTitleCasePreserve('a study of the effects')).toBe('A Study Of the Effects');
    });

    it('handles sentence with multiple minor words', () => {
      expect(toTitleCasePreserve('the cat and the dog or the bird')).toBe(
        'The Cat and the Dog or the Bird'
      );
    });
  });
});
