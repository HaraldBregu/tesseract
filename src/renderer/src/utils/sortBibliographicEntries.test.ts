import { sortBibliographicEntries } from './sortBibliographicEntries';

// Type definition for test entries
interface MockBibEntry {
  bib: {
    author: string[];
    date: string;
    title: string;
  };
}

// Helper to create test entries
const createEntry = (author: string[], date: string, title: string): MockBibEntry => ({
  bib: {
    author,
    date,
    title,
  },
});

describe('sortBibliographicEntries', () => {
  describe('sorting by author', () => {
    it('sorts alphabetically by author', () => {
      const entries = [
        createEntry(['Zeta, Author'], '2020', 'Title A'),
        createEntry(['Alpha, Author'], '2020', 'Title B'),
        createEntry(['Beta, Author'], '2020', 'Title C'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.author).toEqual(['Alpha, Author']);
      expect(sorted[1].bib.author).toEqual(['Beta, Author']);
      expect(sorted[2].bib.author).toEqual(['Zeta, Author']);
    });

    it('handles multiple authors by joining them', () => {
      const entries = [
        createEntry(['Zeta', 'Alpha'], '2020', 'Title A'),
        createEntry(['Alpha', 'Beta'], '2020', 'Title B'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.author).toEqual(['Alpha', 'Beta']);
      expect(sorted[1].bib.author).toEqual(['Zeta', 'Alpha']);
    });

    it('is case insensitive for author comparison', () => {
      const entries = [
        createEntry(['ZETA'], '2020', 'Title'),
        createEntry(['alpha'], '2020', 'Title'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.author).toEqual(['alpha']);
      expect(sorted[1].bib.author).toEqual(['ZETA']);
    });
  });

  describe('sorting by date (same author)', () => {
    it('sorts chronologically, oldest first', () => {
      const entries = [
        createEntry(['Smith'], '2022', 'Title'),
        createEntry(['Smith'], '2018', 'Title'),
        createEntry(['Smith'], '2020', 'Title'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.date).toBe('2018');
      expect(sorted[1].bib.date).toBe('2020');
      expect(sorted[2].bib.date).toBe('2022');
    });

    it('puts entries without date at the end', () => {
      const entries = [
        createEntry(['Smith'], '2020', 'Title A'),
        createEntry(['Smith'], '', 'Title B'),
        createEntry(['Smith'], '2018', 'Title C'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.date).toBe('2018');
      expect(sorted[1].bib.date).toBe('2020');
      expect(sorted[2].bib.date).toBe('');
    });

    it('handles non-numeric dates with string comparison', () => {
      const entries = [
        createEntry(['Smith'], 'circa 2020', 'Title A'),
        createEntry(['Smith'], 'circa 2018', 'Title B'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.date).toBe('circa 2018');
      expect(sorted[1].bib.date).toBe('circa 2020');
    });
  });

  describe('sorting by title (same author and date)', () => {
    it('sorts alphabetically by title', () => {
      const entries = [
        createEntry(['Smith'], '2020', 'Zebra Book'),
        createEntry(['Smith'], '2020', 'Alpha Book'),
        createEntry(['Smith'], '2020', 'Beta Book'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.title).toBe('Alpha Book');
      expect(sorted[1].bib.title).toBe('Beta Book');
      expect(sorted[2].bib.title).toBe('Zebra Book');
    });

    it('is case insensitive for title comparison', () => {
      const entries = [
        createEntry(['Smith'], '2020', 'ZEBRA'),
        createEntry(['Smith'], '2020', 'alpha'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.title).toBe('alpha');
      expect(sorted[1].bib.title).toBe('ZEBRA');
    });
  });

  describe('combined sorting', () => {
    it('applies all three sorting criteria correctly', () => {
      const entries = [
        createEntry(['Zeta'], '2020', 'Title Z'),
        createEntry(['Alpha'], '2022', 'Title A'),
        createEntry(['Alpha'], '2020', 'Title B'),
        createEntry(['Alpha'], '2020', 'Title A'),
        createEntry(['Beta'], '2021', 'Title X'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      // First: Alpha, 2020, Title A
      expect(sorted[0].bib.author).toEqual(['Alpha']);
      expect(sorted[0].bib.date).toBe('2020');
      expect(sorted[0].bib.title).toBe('Title A');

      // Second: Alpha, 2020, Title B
      expect(sorted[1].bib.author).toEqual(['Alpha']);
      expect(sorted[1].bib.date).toBe('2020');
      expect(sorted[1].bib.title).toBe('Title B');

      // Third: Alpha, 2022, Title A
      expect(sorted[2].bib.author).toEqual(['Alpha']);
      expect(sorted[2].bib.date).toBe('2022');

      // Fourth: Beta
      expect(sorted[3].bib.author).toEqual(['Beta']);

      // Fifth: Zeta
      expect(sorted[4].bib.author).toEqual(['Zeta']);
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      const result = sortBibliographicEntries([]);
      expect(result).toEqual([]);
    });

    it('returns single element unchanged', () => {
      const entries = [createEntry(['Author'], '2020', 'Title')];
      const result = sortBibliographicEntries(entries as any);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(entries[0]);
    });

    it('does not mutate original array', () => {
      const entries = [
        createEntry(['Zeta'], '2020', 'Title'),
        createEntry(['Alpha'], '2020', 'Title'),
      ];
      const original = [...entries];

      sortBibliographicEntries(entries as any);

      expect(entries).toEqual(original);
    });

    it('handles whitespace in author and title', () => {
      const entries = [
        createEntry(['  Smith  '], '2020', '  Title B  '),
        createEntry(['Smith'], '2020', 'Title A'),
      ];

      const sorted = sortBibliographicEntries(entries as any);

      expect(sorted[0].bib.title.trim()).toBe('Title A');
    });
  });
});
