import { levelFormat } from '@/utils/optionsEnums';
import { JSONContent } from '@tiptap/core';

interface AttrsProps {
    sectionType?: string;
    [key: string]: any;
}

interface DividerItem {
    type: 'sectionDivider';
    attrs: AttrsProps;
}

function isDividerItem(item: any): item is DividerItem {
    return item
        && item.type === 'sectionDivider'
        && item.attrs
        && typeof item.attrs.sectionType === 'string';
}

const extractEditorSections = (textEditorJson: any) => {
    const mainTextData = extractSectionsFromGlobalText(
        textEditorJson,
        "maintext"
    );
    const introductionData = extractSectionsFromGlobalText(
        textEditorJson,
        "introduction"
    );
    const bibliographyData = extractSectionsFromGlobalText(
        textEditorJson,
        "bibliography"
    );
    return { mainTextData, introductionData, bibliographyData };
};

const extractSectionsFromGlobalText = (
    input: any[] | { content?: any[] },
    sectionType: string
): any[] => {
    // 1) Ricaviamo un array da processare
    const items = Array.isArray(input)
        ? input
        : Array.isArray(input.content)
            ? input.content!
            : [];

    if (items.length === 0) return [];

    // 2) trova inizio e fine
    const startIndex = items.findIndex(item =>
        isDividerItem(item) && item.attrs.sectionType === sectionType
    );
    if (startIndex === -1) return [];

    const endIndex = items.findIndex((_, idx) =>
        idx > startIndex && isDividerItem(items[idx])
    );
    const finalEnd = endIndex === -1 ? items.length : endIndex;

    // 3) ritorna i nodi tra i due divider (escluso il divider d’inizio)
    return items.slice(startIndex + 1, finalEnd);
}

const extractText = (contentArray: any[]): string => {
    if (!contentArray || !Array.isArray(contentArray)) return "Nameless";
    return contentArray.map(item => item.text || "").join(" ").trim() || "Nameless";
};

// Utility function to calculate level counter offsets for continuous numbering across all levels
const calculateLevelCounterOffset = (sectionKey: string, allSectionsData: Record<string, any[]>, sectionOrder: string[]): Record<string, number> => {
    let levelCounterOffset: Record<string, number> = {};
    const currentSectionIndex = sectionOrder.indexOf(sectionKey);

    // Process all previous sections to calculate level counters
    for (let i = 0; i < currentSectionIndex; i++) {
        const previousSectionKey = sectionOrder[i];
        const previousSectionData = allSectionsData[previousSectionKey] || [];

        // Get headings in order for this section
        const headings = previousSectionData.filter(item =>
            item.type === 'heading' &&
            item.content &&
            item.content.length > 0 &&
            item.attrs &&
            typeof item.attrs.level === 'number'
        );

        // Simply count headings by level - this matches how createTocTreeStructure works
        headings.forEach((heading) => {
            const level = heading.attrs.level;

            // Use 'root' as parent context for all levels to ensure continuous numbering
            const counterKey = `custom_${level}_root`;

            // Initialize or increment counter
            if (!levelCounterOffset[counterKey]) {
                levelCounterOffset[counterKey] = 0;
            }
            levelCounterOffset[counterKey]++;

            // Reset all deeper level counters when encountering a heading
            // This ensures proper hierarchical reset behavior
            for (let resetLevel = level + 1; resetLevel <= 6; resetLevel++) {
                const resetKey = `custom_${resetLevel}_root`;
                if (levelCounterOffset[resetKey]) {
                    delete levelCounterOffset[resetKey];
                }
            }
        });
    }

    return levelCounterOffset;
};

export const createTocStructureSection = (
    content: JSONContent[],
    tocSettings: TocSettings,
    levelCounterOffset?: Record<string, number>
): any[] => {
    const maxLevel = (tocSettings?.levels || 3);

    const headings = content.filter(item =>
        item.type === 'heading' &&
        item.content &&
        item.content.length > 0 && item.attrs?.level && item.attrs?.level <= maxLevel
    );

    const result: HeadingTreeItem[] = [];
    const headingStack: (HeadingTreeItem | null)[] = new Array(maxLevel + 1).fill(null);
    const levelCounters: Record<string, number> = {}; // Inizializziamo vuoto, senza offset

    const getSeparator = (): string => {
        switch (tocSettings?.numberSeparator) {
            case '0': return '\u00A0';
            case '1': return ')';
            case '2': return '.';
            case '3': return '-';
            default: return '.';
        }
    };

    const generateStandardId = (level: number, parentId: string | null = null): string => {
        const parentKey = parentId || 'root';
        const counterKey = `standard_${level}_${parentKey}`;

        if (!levelCounters[counterKey]) levelCounters[counterKey] = 1;
        else levelCounters[counterKey]++;

        const num = levelCounters[counterKey];

        if (level === 1) {
            return String(num);
        } else if (parentId) {
            return `${parentId}.${num}`;
        }
        return String(num);
    };

    const generateHeadingId = (level: number, parentId: string | null = null, parentLevel: number | null = null): string | undefined => {
        if (!tocSettings?.showHeadingNumbers) {
            return undefined;
        }

        // CORREZIONE: Per level > 1 senza parent, usiamo l'ultimo level 1 come base
        let effectiveParentId = parentId;
        let effectiveParentLevel = parentLevel;
        if (level > 1 && !parentId && levelCounterOffset) {
            // Se abbiamo offset per custom_1_root, significa che c'erano level 1 precedenti
            const level1OffsetValue = levelCounterOffset['custom_1_root'];
            if (level1OffsetValue && level1OffsetValue > 0) {
                effectiveParentId = String(level1OffsetValue);
                effectiveParentLevel = 1;
            }
        }

        const effectiveParentKey = effectiveParentId || 'root';
        const effectiveCounterKey = `custom_${level}_${effectiveParentKey}`;

        // Inizializza il counter se non esiste, partendo dall'offset appropriato
        if (!levelCounters[effectiveCounterKey]) {
            let offsetToUse = 0;
            if (level > 1 && !parentId && effectiveParentId) {
                // Caso speciale: level > 1 senza parent originale ma con effective parent
                const originalCounterKey = `custom_${level}_root`;
                offsetToUse = levelCounterOffset?.[originalCounterKey] || 0;
            } else {
                // Usa l'offset solo se definito, altrimenti inizia da 0
                offsetToUse = levelCounterOffset?.[effectiveCounterKey] || 0;
            }

            levelCounters[effectiveCounterKey] = offsetToUse;
        }

        // Incrementa il counter
        levelCounters[effectiveCounterKey]++;

        const num = levelCounters[effectiveCounterKey];

        // Get format for the current level
        let formatType = "1"; // Default numeric format
        if (tocSettings) {
            switch (level) {
                case 1: formatType = tocSettings.level1Format || "1"; break;
                case 2: formatType = tocSettings.level2Format || "2"; break;
                case 3: formatType = tocSettings.level3Format || "3"; break;
                case 4: formatType = tocSettings.level4Format || "4"; break;
                case 5: formatType = tocSettings.level5Format || "5"; break;
                case 6: formatType = tocSettings.level6Format || "6"; break;
                default: formatType = "1";
            }
        }

        // Format the number based on the format type
        const formattedNumber = formatNumber(num, formatType);

        let finalResult;
        if (level === 1) {
            finalResult = formattedNumber;
        } else if (effectiveParentId) {
            // Calcola quanti livelli intermedi mancano tra parent e current level
            const actualParentLevel = effectiveParentLevel || 1;
            const missingLevels = level - actualParentLevel - 1;
            
            if (missingLevels > 0) {
                // Inserisci "0" per ogni livello intermedio mancante
                const zeros = Array(missingLevels).fill('0').join(getSeparator());
                finalResult = `${effectiveParentId}${getSeparator()}${zeros}${getSeparator()}${formattedNumber}`;
            } else {
                finalResult = `${effectiveParentId}${getSeparator()}${formattedNumber}`;
            }
        } else {
            // Caso senza parent: se level > 1, aggiungi zeri per i livelli mancanti dall'inizio
            if (level > 1) {
                const zeros = Array(level - 1).fill('0').join(getSeparator());
                finalResult = `${zeros}${getSeparator()}${formattedNumber}`;
            } else {
                finalResult = formattedNumber;
            }
        }

        return finalResult;
    };

    // Helper function to format numbers according to the specified type from settings
    const formatNumber = (num: number, formatType: string): string => {
        // Cerchiamo il formato corrispondente in levelFormat usando il valore di configurazione
        const format = levelFormat.find(item => item.value === formatType);

        // Se non troviamo il formato, o se è "1" (numerazione standard), usiamo i numeri
        if (!format || format.value === "1") {
            return String(num);
        }

        // Altrimenti applichiamo il formato in base al tipo
        switch (format.value) {
            case '2': // Lowercase letters
                return String.fromCharCode(96 + (num <= 26 ? num : 26));
            case '3': // Uppercase letters
                return String.fromCharCode(64 + (num <= 26 ? num : 26));
            case '4': // Lowercase Roman numerals
                return toRoman(num).toLowerCase();
            case '5': // Uppercase Roman numerals
                return toRoman(num).toUpperCase();
            default: // Fallback a numeric
                return String(num);
        }
    };

    // Helper function to convert number to Roman numeral
    const toRoman = (num: number): string => {
        const romanNumerals = [
            { value: 1000, symbol: 'M' },
            { value: 900, symbol: 'CM' },
            { value: 500, symbol: 'D' },
            { value: 400, symbol: 'CD' },
            { value: 100, symbol: 'C' },
            { value: 90, symbol: 'XC' },
            { value: 50, symbol: 'L' },
            { value: 40, symbol: 'XL' },
            { value: 10, symbol: 'X' },
            { value: 9, symbol: 'IX' },
            { value: 5, symbol: 'V' },
            { value: 4, symbol: 'IV' },
            { value: 1, symbol: 'I' }
        ];

        let result = '';
        for (let i = 0; i < romanNumerals.length; i++) {
            while (num >= romanNumerals[i].value) {
                result += romanNumerals[i].symbol;
                num -= romanNumerals[i].value;
            }
        }
        return result;
    };

    console.log("Headings to process for TOC:", headings);

    type HeadingTreeItem = {
        id: string;
        headingsId?: string; // ID personalizzato per la visualizzazione
        headingIndex: number;
        name: string;
        customName: string; // Nome personalizzato per la visualizzazione
        showHeadingNumbers?: boolean; // Indica se mostrare i numeri di intestazione
        level: number;
        children: HeadingTreeItem[];
        sectionType: string;
    }

    headings.forEach((heading, index) => {
        const level = heading.attrs?.level || 0;
        const name = extractText(heading.content || []);

        // Aggiorna lo stack per il livello corrente
        // Quando incontriamo un livello, resettiamo tutti i livelli successivi
        for (let i = level + 1; i <= maxLevel; i++) {
            headingStack[i] = null;
        }

        // Trova il genitore appropriato (il più vicino con livello inferiore)
        let parent: HeadingTreeItem | null = null;
        for (let i = level - 1; i >= 1; i--) {
            if (headingStack[i]) {
                parent = headingStack[i];
                break;
            }
        }

        // Genera sia l'ID standard che quello personalizzato
        const standardId = generateStandardId(level, parent?.id);
        const headingId = generateHeadingId(level, parent?.headingsId, parent?.level || null);

        const newHeading: HeadingTreeItem = {
            id: standardId,
            headingsId: headingId,
            name,
            customName: headingId ? headingId + ' - ' + name : name,
            showHeadingNumbers: tocSettings?.showHeadingNumbers,
            level,
            children: [],
            headingIndex: index,
            sectionType: heading?.sectionType || 'maintext',
        };

        // Aggiungi la nuova intestazione al genitore o alla radice
        if (parent) {
            parent.children.push(newHeading);
        } else {
            result.push(newHeading);
        }

        // Aggiorna lo stack per questo livello
        headingStack[level] = newHeading;
    });

    // The following code flattens the hierarchy by moving all nested TreeItems .children up one level (i.e., removing parent nesting).
    // The result will be a single-level array of TreeItems (with no nested children).
    function flattenTreeItems(treeItems: HeadingTreeItem[]): HeadingTreeItem[] {
        function collect(node: HeadingTreeItem): HeadingTreeItem[] {
            // Discard the children field and yield the node (but keep all other fields)
            const { children, ...rest } = node
            let flat: HeadingTreeItem[] = [{ ...rest, children: [] }]
            if (children && children.length)
                children.forEach(child => {
                    flat = flat.concat(collect(child));
                });
            return flat;
        }
        let allFlat: HeadingTreeItem[] = []
        treeItems.forEach(item => {
            allFlat = allFlat.concat(collect(item));
        });
        return allFlat;
    }
    console.log("Original TOC structure:", result);

    const flattenedResult = flattenTreeItems(result);

    console.log("Flattened TOC structure:", flattenedResult);

    const newHeading = flattenedResult.map((item) => ({
        id: item.headingsId || item.id,
        separator: getSeparator(),
        text: item.name,
        level: item.level,
        sectionType: item.sectionType,
    }));

    return newHeading;
};

const createTocTreeStructure = (
    jsonText: any,
    tocSettings?: {
        show?: boolean;
        levels: number;
        indentLevels?: boolean;
        title?: string;
        tabLeaderFormat?: string;
        showHeadingNumbers?: boolean;
        numberSeparator?: string;
        level1Format?: string;
        level2Format?: string;
        level3Format?: string;
        level4Format?: string;
        level5Format?: string;
        level6Format?: string;
    },
    levelCounterOffset?: Record<string, number>
): TreeItem[] => {
    const maxLevel = (tocSettings?.levels || 3);
    const jsonData = jsonText;

    if (!jsonData.content || !Array.isArray(jsonData.content)) {
        console.error("Formato JSON non valido: manca il campo 'content' o non è un array");
        return [];
    }

    const headings = jsonData.content.filter(item =>
        item.type === 'heading' &&
        item.content &&
        item.content.length > 0 &&
        item.attrs.level <= maxLevel
    );

    // 🔥 FIXED: Don't reorder headings - use them in the order they appear in the combined content
    // This respects the section sort order that was applied when combining the content
    const orderedHeadings = headings; // Use headings as-is, already in correct order

    const result: TreeItem[] = [];
    const headingStack: (TreeItem | null)[] = Array(maxLevel + 1).fill(null);
    const levelCounters: Record<string, number> = {}; // Inizializziamo vuoto, senza offset

    const getSeparator = (): string => {
        switch (tocSettings?.numberSeparator) {
            case '0': return '\u00A0';
            case '1': return ')';
            case '2': return '.';
            case '3': return '-';
            default: return '.';
        }
    };

    const separator = getSeparator();

    const generateStandardId = (level: number, parentId: string | null = null): string => {
        const parentKey = parentId || 'root';
        const counterKey = `standard_${level}_${parentKey}`;

        if (!levelCounters[counterKey]) levelCounters[counterKey] = 1;
        else levelCounters[counterKey]++;

        const num = levelCounters[counterKey];

        if (level === 1) {
            return String(num);
        } else if (parentId) {
            return `${parentId}.${num}`;
        }
        return String(num);
    };

    const generateHeadingId = (level: number, parentId: string | null = null, parentLevel: number | null = null): string | undefined => {
        if (!tocSettings?.showHeadingNumbers) {
            return undefined;
        }

        // CORREZIONE: Per level > 1 senza parent, usiamo l'ultimo level 1 come base
        let effectiveParentId = parentId;
        let effectiveParentLevel = parentLevel;
        if (level > 1 && !parentId && levelCounterOffset) {
            // Se abbiamo offset per custom_1_root, significa che c'erano level 1 precedenti
            const level1OffsetValue = levelCounterOffset['custom_1_root'];
            if (level1OffsetValue && level1OffsetValue > 0) {
                effectiveParentId = String(level1OffsetValue);
                effectiveParentLevel = 1;
            }
        }

        const effectiveParentKey = effectiveParentId || 'root';
        const effectiveCounterKey = `custom_${level}_${effectiveParentKey}`;

        // Inizializza il counter se non esiste, partendo dall'offset appropriato
        if (!levelCounters[effectiveCounterKey]) {
            let offsetToUse = 0;
            if (level > 1 && !parentId && effectiveParentId) {
                // Caso speciale: level > 1 senza parent originale ma con effective parent
                const originalCounterKey = `custom_${level}_root`;
                offsetToUse = levelCounterOffset?.[originalCounterKey] || 0;
            } else {
                // Usa l'offset solo se definito, altrimenti inizia da 0
                offsetToUse = levelCounterOffset?.[effectiveCounterKey] || 0;
            }

            levelCounters[effectiveCounterKey] = offsetToUse;
        }

        // Incrementa il counter
        levelCounters[effectiveCounterKey]++;

        const num = levelCounters[effectiveCounterKey];

        // Get format for the current level
        let formatType = "1"; // Default numeric format
        if (tocSettings) {
            switch (level) {
                case 1: formatType = tocSettings.level1Format || "1"; break;
                case 2: formatType = tocSettings.level2Format || "2"; break;
                case 3: formatType = tocSettings.level3Format || "3"; break;
                case 4: formatType = tocSettings.level4Format || "4"; break;
                case 5: formatType = tocSettings.level5Format || "5"; break;
                case 6: formatType = tocSettings.level6Format || "6"; break;
                default: formatType = "1";
            }
        }

        // Format the number based on the format type
        const formattedNumber = formatNumber(num, formatType);

        let finalResult;
        if (level === 1) {
            finalResult = formattedNumber;
        } else if (effectiveParentId) {
            // Calcola quanti livelli intermedi mancano tra parent e current level
            const actualParentLevel = effectiveParentLevel || 1;
            const missingLevels = level - actualParentLevel - 1;
            
            if (missingLevels > 0) {
                // Inserisci "0" per ogni livello intermedio mancante
                const zeros = Array(missingLevels).fill('0').join(separator);
                finalResult = `${effectiveParentId}${separator}${zeros}${separator}${formattedNumber}`;
            } else {
                finalResult = `${effectiveParentId}${separator}${formattedNumber}`;
            }
        } else {
            // Caso senza parent: se level > 1, aggiungi zeri per i livelli mancanti dall'inizio
            if (level > 1) {
                const zeros = Array(level - 1).fill('0').join(separator);
                finalResult = `${zeros}${separator}${formattedNumber}`;
            } else {
                finalResult = formattedNumber;
            }
        }

        return finalResult;
    };

    // Helper function to format numbers according to the specified type from settings
    const formatNumber = (num: number, formatType: string): string => {
        // Cerchiamo il formato corrispondente in levelFormat usando il valore di configurazione
        const format = levelFormat.find(item => item.value === formatType);

        // Se non troviamo il formato, o se è "1" (numerazione standard), usiamo i numeri
        if (!format || format.value === "1") {
            return String(num);
        }

        // Altrimenti applichiamo il formato in base al tipo
        switch (format.value) {
            case '2': // Lowercase letters
                return String.fromCharCode(96 + (num <= 26 ? num : 26));
            case '3': // Uppercase letters
                return String.fromCharCode(64 + (num <= 26 ? num : 26));
            case '4': // Lowercase Roman numerals
                return toRoman(num).toLowerCase();
            case '5': // Uppercase Roman numerals
                return toRoman(num).toUpperCase();
            default: // Fallback a numeric
                return String(num);
        }
    };

    // Helper function to convert number to Roman numeral
    const toRoman = (num: number): string => {
        const romanNumerals = [
            { value: 1000, symbol: 'M' },
            { value: 900, symbol: 'CM' },
            { value: 500, symbol: 'D' },
            { value: 400, symbol: 'CD' },
            { value: 100, symbol: 'C' },
            { value: 90, symbol: 'XC' },
            { value: 50, symbol: 'L' },
            { value: 40, symbol: 'XL' },
            { value: 10, symbol: 'X' },
            { value: 9, symbol: 'IX' },
            { value: 5, symbol: 'V' },
            { value: 4, symbol: 'IV' },
            { value: 1, symbol: 'I' }
        ];

        let result = '';
        for (let i = 0; i < romanNumerals.length; i++) {
            while (num >= romanNumerals[i].value) {
                result += romanNumerals[i].symbol;
                num -= romanNumerals[i].value;
            }
        }
        return result;
    };

    orderedHeadings.forEach((heading, index) => {
        const level = heading.attrs.level;
        const name = extractText(heading.content);

        // Aggiorna lo stack per il livello corrente
        // Quando incontriamo un livello, resettiamo tutti i livelli successivi
        for (let i = level + 1; i <= maxLevel; i++) {
            headingStack[i] = null;
        }

        // Trova il genitore appropriato (il più vicino con livello inferiore)
        let parent: TreeItem | null = null;
        for (let i = level - 1; i >= 1; i--) {
            if (headingStack[i]) {
                parent = headingStack[i];
                break;
            }
        }

        // Genera sia l'ID standard che quello personalizzato
        const standardId = generateStandardId(level, parent?.id);
        const headingId = generateHeadingId(level, parent?.headingsId, parent?.level || null);

        const newHeading: TreeItem = {
            id: standardId,
            headingsId: headingId,
            name,
            customName: headingId ? headingId + ' - ' + name : name,
            showHeadingNumbers: tocSettings?.showHeadingNumbers,
            level,
            children: [],
            headingIndex: index,
        };

        // Aggiungi la nuova intestazione al genitore o alla radice
        if (parent) {
            parent.children.push(newHeading);
        } else {
            result.push(newHeading);
        }

        // Aggiorna lo stack per questo livello
        headingStack[level] = newHeading;
    });

    return result;
};

export { createTocTreeStructure, extractSectionsFromGlobalText, calculateLevelCounterOffset, extractEditorSections };