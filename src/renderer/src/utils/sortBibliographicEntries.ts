/**
 * Sorts bibliographic entries following these rules:
 * 1. By author (alphabetically A-Z)
 * 2. If same author, by date (chronologically, oldest first)
 * 3. If same author and date, by title (alphabetically A-Z)
 */
export function sortBibliographicEntries<T extends InsertBibliography>(
    entries: T[]
): T[] {
    return [...entries].sort((a, b) => {
        const bibA = a.bib;
        const bibB = b.bib;

        const authorA = bibA.author.join(', ').toLowerCase().trim();
        const authorB = bibB.author.join(', ').toLowerCase().trim();

        // Primary sort: by author (A-Z)
        if (authorA !== authorB) {
            return authorA.localeCompare(authorB);
        }

        const dateA = (bibA.date || '').trim();
        const dateB = (bibB.date || '').trim();

        if (dateA !== dateB) {
            if (!dateA) return 1;
            if (!dateB) return -1;

            const numA = Number.parseInt(dateA, 10);
            const numB = Number.parseInt(dateB, 10);

            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                return numA - numB;
            }

            return dateA.localeCompare(dateB);
        }

        const titleA = bibA.title.toLowerCase().trim();
        const titleB = bibB.title.toLowerCase().trim();

        return titleA.localeCompare(titleB);
    });
}
