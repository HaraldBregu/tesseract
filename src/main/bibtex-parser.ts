import * as bibtexParse from "bibtex-parse-js";

const typeMapping: Record<string, BIB_REFERENCE_TYPES> = {
    book: "book",
    incollection: "book_section",
    article: "journal"
};

const fieldsToExtract = [
    "title", "editor", "author", "booktitle", "series", "number", "volume",
    "issue", "doi", "address", "publisher", "year", "month", "pages",
    "shorttitle", "url", "urldate", "journal"
];

function sanitizeBibtex(bib: string): string {
    return bib

        // Remove comments completely (they sometimes break parser)
        .replace(/%.*$/gm, "")

        // Remove trailing commas before closing braces
        .replace(/,(?=\s*})/g, "")

        // Fix double commas
        .replace(/,,+/g, ",")

        // Remove empty lines
        .replace(/^\s*[\r\n]/gm, "")

        // Trim weird unicode (BOM, NBSP, etc.)
        .replace(/[\u200B-\u200F\uFEFF]/g, "");
}

async function parseBibtexFile(fileData: string): Promise<BibReference[]> {
    const clean = sanitizeBibtex(fileData);
    const entries = bibtexParse.toJSON(clean);

    const parsedEntries: BibReference[] = entries
        .filter(e => typeMapping[e.entryType.toLowerCase()])
        .map(entry => {
            const sourceType = typeMapping[entry.entryType.toLowerCase()];
            const tags = entry.entryTags;

            const bibRef: BibReference = {
                id: crypto.randomUUID(),
                sourceType,
                title: tags.title ?? "",
                author: [],
                date: "",
                accessed: "",
                bookTitle: "",
                seriesNumber: "",
                issue: "",
                place: "",
                publisher: "",
                volume: tags.volume ?? "",
                numberOfVolumes: "",
                pages: tags.pages ?? "",
                shortTitle: "",
                url: tags.url ?? "",
                doi: tags.doi ?? "",
                editor: tags.editor ?? "",
                series: tags.series ?? ""
            };

            for (const [bibField, value] of Object.entries(tags)) {
                const fieldValue = value as string;
                if (fieldsToExtract.includes(bibField)) {
                    switch (bibField) {
                        case "author":
                            bibRef.author = fieldValue
                                .split(" and ")
                                .map(a => a.trim());
                            break;

                        case "booktitle":
                            if (sourceType === "book_section") {
                                bibRef.bookTitle = fieldValue;
                            }
                            break;

                        case "journal":
                            if (sourceType === "journal") {
                                bibRef.bookTitle = fieldValue;
                            }
                            break;

                        case "number":
                            if (sourceType === 'book' || sourceType === 'book_section') {
                                bibRef.seriesNumber = fieldValue;
                            } else if (sourceType === 'journal') {
                                bibRef.issue = fieldValue;
                            }
                            break;

                        case "address":
                            bibRef.place = fieldValue;
                            break;

                        case "year":
                            bibRef.date = fieldValue;
                            break;

                        case "month":
                            bibRef.date = bibRef.date
                                ? `${fieldValue} ${bibRef.date}`
                                : fieldValue;
                            break;

                        case "shorttitle":
                            bibRef.shortTitle = fieldValue;
                            break;

                        case "urldate":
                            bibRef.accessed = fieldValue;
                            break;
                        
                        default:
                            bibRef[bibField] = fieldValue;
                    }
                }
            }

            return bibRef;
        });

    const uniqueEntries = parsedEntries.filter(({ id: _, ...entry }, index, self) =>
        index === self.findIndex(({ id: _, ...e }) => JSON.stringify(e) === JSON.stringify(entry))
    );

    return uniqueEntries;
}

export default parseBibtexFile;
