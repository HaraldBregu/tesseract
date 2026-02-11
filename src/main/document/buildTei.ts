/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TEMP_ANY = any;

/**
 * Minimal JSON node types used by Tiptap/ProseMirror-style content (adapt to your JSONContent if needed)
 */
type JsonNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, TEMP_ANY>;
  marks?: { type: string; attrs?: Record<string, TEMP_ANY> }[];
  content?: JsonNode[];
};

type NotePlacement = 'foot' | 'inner' | 'outer' | 'section';

type ApparatusEntryDataIdBasedType = Record<string, {
  place: NotePlacement;
  attrs?: Record<string, TEMP_ANY>;
  text: string;
  targetId: string;
  n: number;
}>;

type TocHeaders = {
  content: string;
  level: number;
  targetId: string;
};

const notePlacement: Record<string, NotePlacement> = {
  PAGE_NOTES: 'foot',
  INNER_MARGIN: 'inner',
  OUTER_MARGIN: 'outer',
  SECTION_NOTES: 'section',
}

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

let apparatusEntryDataIdBased: ApparatusEntryDataIdBasedType = {};

/* ----------------- JSON -> TEI conversion ----------------- */


/**
 * Replaces XML special characters (&, <, >, ", ') with their respective HTML entities.
 * @param {string} text The input string to escape.
 * @returns {string} The escaped string.
 */
function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, ch => ESCAPE_MAP[ch]);
}


/**
 * Sanitizes a given TEI XML string by escaping all text outside of CDATA sections.
 * This ensures that the resulting XML is well-formed and can be safely parsed.
 * @param {string} input The input TEI XML string to sanitize.
 * @returns {string} The sanitized TEI XML string.
 */
export function sanitizeXml(input: string): string {
  const CDATA_REGEX = /<!\[CDATA\[[\s\S]*?\]\]>/g;

  let result = '';
  let lastIndex = 0;

  for (const match of input.matchAll(CDATA_REGEX)) {
    const start = match.index!;
    const end = start + match[0].length;

    // Escape text before CDATA
    result += escapeXml(input.slice(lastIndex, start));

    // Preserve CDATA verbatim
    result += match[0];

    lastIndex = end;
  }

  // Escape remaining tail
  result += escapeXml(input.slice(lastIndex));

  return result;
}

/**
 * Convert a Tiptap-like JSON node (or array of nodes) into TEI XML fragment.
 */
function jsonToTeiSection(sectionType: MainEditorSections, id: string, node: JsonNode | JsonNode[] = [], headers: TocHeaders[] = [], addTag: boolean = true, mergedNotes: Record<string, string> = {}): string {
  if (!node) return "";
  if (Array.isArray(node)) {
    let divCount = 0;
    const nodeData: string[] = [];
    node.map((n, index) => {
      if (n.type === "heading") {
        const targetId = `${id}-${crypto.randomUUID()}`;
        const headerContent = jsonToTeiSection(sectionType, id, n, [], false, mergedNotes);
        const header: TocHeaders = {
          content: headerContent,
          level: n.attrs?.level ?? 1,
          targetId
        };
        headers.push(header);
        nodeData.push(`
        <div type="${sectionType}" xml:id="${targetId}" n="${n?.attrs?.level}">
          ${jsonToTeiSection(sectionType, id, n, [], addTag, mergedNotes)}
          ${node.length > index + 1 ? "" : "</div>"}
        `);
        divCount++;
      } else {
        nodeData.push(jsonToTeiSection(sectionType, id, n, headers, addTag, mergedNotes));
      }
    });
    return nodeData.join("") + (new Array(divCount)).fill("</div>").join("");
  }

  const { type, content } = node;

  switch (type) {
    case "heading": {
      const newContent = jsonToTeiSection(sectionType, id, content, headers, addTag, mergedNotes);
      return addTag && newContent.trim().length > 0 ? `
        <head>
          ${newContent}
        </head>` : newContent;
    }

    case "paragraph":{
      const newContent = jsonToTeiSection(sectionType, id, content, headers, false, mergedNotes);
      return addTag && newContent.trim().length > 0 ? `<p>
        ${newContent}
      </p>` : newContent;
    }

    case "text": {
      const text = node.text ?? '';
      if (node.marks && node.marks.length > 0) {
        return text.trim().length > 0 ? processMarks(sanitizeXml(text), node.marks, mergedNotes) : '';
      }
      return text.trim().length > 0 ? sanitizeXml(text) : '';
    }

    default:
      if (content) return jsonToTeiSection(sectionType, id, content, headers, addTag, mergedNotes);
      return "";
  }
}

/**
 * Groups and merges text content that share the same attrs.id (note id).
 * Returns a map of id → concatenated text.
 */
function mergeDuplicateNoteTexts(nodes: JsonNode[]): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const node of nodes) {
    if (node.marks && Array.isArray(node.marks)) {
      for (const mark of node.marks) {
        if (mark.type === "textNote" && mark.attrs?.id) {
          const id = String(mark.attrs.id);
          merged[id] = (merged[id] ?? "") + (node.text ?? "");
        }
      }
    }

    // recursively merge from children
    if (node.content && Array.isArray(node.content)) {
      const childMerged = mergeDuplicateNoteTexts(node.content);
      for (const [id, text] of Object.entries(childMerged)) {
        merged[id] = (merged[id] ?? "") + text;
      }
    }
  }

  return merged;
}

/**
 * Convert text + marks into TEI - handles apparatus marks and latex
 */
function processMarks(text: string, marks: { type: string; attrs?: Record<string, TEMP_ANY> }[], mergedNotes?: Record<string, string>): string {
  let xml = text;

  for (const mark of marks) {
    const { type, attrs } = mark;

    switch (type) {
      case "textNote": {
        const entryId = attrs?.id ?? "";
        const apparatusEntry = apparatusEntryDataIdBased[entryId];

        if (apparatusEntry?.place === undefined) {
          xml = `
            ${text}
            <ref target="${entryId}">
              ${text}
            </ref>`;
        } else if (mergedNotes && mergedNotes[entryId]) {
          xml = `
            ${text}
            <note n="${apparatusEntry.n}" place="${apparatusEntry.place}" xml:id="id-${attrs?.id ?? ""}">
              ${mergedNotes[entryId]}
            </note>`;
          delete mergedNotes[entryId];
        }
        break;
      }

      default:
        // unknown mark: ignore or wrap as span-like
        break;
    }
  }

  return xml;
}

/**
 * Converts given bibliography data into a TEI XML string.
 * @param {Object} bibReference - Object containing bibliography data.
 * @param {Array<string>} [bibReference.author=['DataNotAvailable']] - Array of authors.
 * @param {string} [bibReference.title='DataNotAvailable'] - Title of the bibliography.
 * @param {string} [bibReference.date='DataNotAvailable'] - Date of the bibliography.
 * @returns {string} - TEI XML string representing the bibliography.
 */
function getBibReferenceXml({
  author = ['DataNotAvailable'],
  title = 'DataNotAvailable',
  date = 'DataNotAvailable'
}): string {
  return `
    <bibl>
      <author>
        ${sanitizeXml(author.join(", "))}
      </author>
      <title>
        ${sanitizeXml(title)}
      </title>
      <date>
        ${sanitizeXml(date)}
      </date>
    </bibl>
  `
}

/**
 * Converts given bibliography data into a TEI XML string.
 * @param {BibReference[]} [bibReferences] - Array of objects containing bibliography data.
 * @returns {string} - TEI XML string representing the bibliography.
 */
function getBibliographiesXml(bibReferences?: BibReference[]): string {
  return bibReferences && bibReferences.length > 0 ?
    bibReferences.map(getBibReferenceXml).join('')
    : ''
}

/* ----------------- Header / Bibliography builders ----------------- */

/**
 * Builds the TEI header from given metadata and bibliography.
 * @param {Metadata} meta - Object containing metadata.
 * @param {BibReference[]} bibliographies - Array of objects containing bibliography data.
 * @returns {string} - TEI XML string representing the header.
 * @example
 * const meta = {
 *   title: 'Document Title',
 *   author: 'Document Author',
 *   publisher: 'Document Publisher',
 *   license: 'Document License',
 *   version: '1.0'
 * };
 * const bibliographies = [
 *   {
 *     author: ['Bibliography Author'],
 *     title: 'Bibliography Title',
 *     date: 'Bibliography Date'
 *   }
 * ];
 * const header = buildTeiHeaderFromMetadata(meta, bibliographies);
 */
function buildTeiHeaderFromMetadata(meta: Metadata, bibliographies: BibReference[]): string {
  const {
    title,
    author,
    publisher,
    license,
    version = '1.0',
  } = meta;

  return `
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>
          ${title.trim().length > 0 ? title : 'DataNotAvailable'}
        </title>
        <author>
          ${author.trim().length > 0 ? author : 'DataNotAvailable'}
        </author>
      </titleStmt>
      <editionStmt>
        <edition n="${version}">
          ${version.trim().length > 0 ? version : 'DataNotAvailable'}
        </edition>
      </editionStmt>
      <publicationStmt>
        <publisher>
          ${(publisher ?? '').trim().length > 0 ? publisher : 'DataNotAvailable'}
        </publisher>
				<availability status="unknown">
					<p>(unknown) the status of the text is unknown.</p>
					<licence target="LicenseInformation">
						<p>
              ${license.trim().length > 0 ? license : 'DataNotAvailable'}
            </p>
					</licence>
				</availability>
      </publicationStmt>
      <sourceDesc>
        <listBibl>
          ${bibliographies && bibliographies.length > 0 ? getBibliographiesXml(bibliographies) : `<bibl>
						<author>DataNotAvailable</author>
						<title>DataNotAvailable</title>
						<date>DataNotAvailable</date>
					</bibl>`}
        </listBibl>
      </sourceDesc>
    </fileDesc>
  </teiHeader>`;
}

// Function to split into sections
function splitBySections(layout: Layout, nodes: JsonNode[]): Record<string, JsonNode[]> {
  const sections: Record<string, JsonNode[]> = Object.keys(layout).reduce((acc, section) => { {
    acc[section] = [];
    return acc;
  } }, {} as Record<string, JsonNode[]>);
  let currentSection: JsonNode[] = [];

  for (const node of nodes) {
    if (node.type === 'sectionDivider') {
      const sectionDivider = node.attrs?.sectionType === 'maintext' ? 'critical' : node.attrs?.sectionType === 'introduction' ? 'intro' : node.attrs?.sectionType;
      currentSection = sections[sectionDivider] ?? [];
    }
    currentSection.push(node);
  }

  return sections;
}

/**
 * Creates a TEI XML element with given tag name, type, tag id and content.
 * @param {string} tagName - The name of the TEI XML tag.
 * @param {MainEditorSections} type - The type of the TEI XML tag.
 * @param {string} tagId - The id of the TEI XML tag.
 * @param {string} content - The content of the TEI XML tag.
 * @returns {string} - The created TEI XML element as a string.
 */
function createElement(tagName: string, type: MainEditorSections, tagId: string, content: string): string {
  return `<${tagName} type="${type}" xml:id="${tagId}">
    ${content}
  </${tagName}>`;
}

/**
 * Builds a nested hierarchy tree structure.
 */
function buildHierarchy(items: TocHeaders[]): TEMP_ANY {
  const stack: TEMP_ANY = [];
  const root: TEMP_ANY = [];

  for (const item of items) {
    const node = { ...item, children: [] };

    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return root;
}

/**
 * Converts a hierarchy into XML.
 */
function toXML(nodes: TEMP_ANY, depth = 0): string {
  if (!nodes.length) return '';
  const indent = '\t'.repeat(depth);
  let xml = `${indent}<list>\n`;

  for (const node of nodes) {
    xml += `${indent}\t<item>\n`;
    xml += `${indent}\t\t<ref target="#${node.targetId}">${node.content}</ref>\n`;
    if (node.children.length) {
      xml += toXML(node.children, depth + 2);
    }
    xml += `${indent}\t</item>\n`;
  }

  xml += `${indent}</list>\n`;
  return xml;
}

function generateTocXml(headerTitle: string, headers: Record<string, TocHeaders[]>): string {
  // Combine everything
  let finalXML = '';

  for (const [_, entries] of Object.entries(headers)) {
    const tree = buildHierarchy(entries);
    for (const rootNode of tree) {
      finalXML += `\t<item>\n\t\t<ref target="#${rootNode.targetId}">${rootNode.content}</ref>\n`;
      if (rootNode.children.length) {
        finalXML += toXML(rootNode.children, 2);
      }
      finalXML += `\t</item>\n`;
    }
  }

  return finalXML.trim().length > 0 ? `\t\t<head>${headerTitle}</head>${finalXML.trim().length > 0 ? `\n\t\t<list>\n${finalXML}\t\t</list>` : ''}\n` : '';
}

/**
 * Convert node JSON into TEI body parts as toc, intro, critical, bibliography xml fragments.
 */
async function bodyToTei(tocHeaderTitle: string, layout: Layout, nodeJson: JsonNode[]): Promise<{ tocXml: string; introXml: string; criticalXml: string; bibliographyXml: string; }> {
  const { toc: _toc, intro: introSection = [], critical: criticalSection = [], bibliography: bibliographySection = [] } = splitBySections(layout, nodeJson);

  const headers: Record<string, TocHeaders[]> = {
    intro: [],
    critical: [],
    bibliography: [],
  };

  const mergedNotes = mergeDuplicateNoteTexts(nodeJson);

  const introXml = (introSection.length > 0 && layout.intro.visible) ? await jsonToTeiSection("intro", "intro-1", introSection, headers["intro"], true, mergedNotes) : "";
  const criticalXml = criticalSection.length > 0 && layout.critical.visible ? await jsonToTeiSection("critical", "critical-1", criticalSection, headers["critical"], true, mergedNotes) : "";
  const bibliographyXml = bibliographySection.length > 0 && layout.bibliography.visible ? await jsonToTeiSection("bibliography", "bibl-1", bibliographySection, headers["bibliography"], true, mergedNotes) : "";
  const tocXml = layout.toc.visible ? generateTocXml(tocHeaderTitle, headers) : "";

  return {
    tocXml: tocXml.trim().length > 0 ? createElement("div", "toc", "toc-1", tocXml) : "",
    introXml: introXml.trim().length > 0 ? createElement("div", "intro", "intro-1", introXml) : "",
    criticalXml: criticalXml.trim().length > 0 ? createElement("div", "critical", "critical-1", criticalXml) : "",
    bibliographyXml: bibliographyXml.trim().length > 0 ? createElement("div", "bibliography", "bibl-1", bibliographyXml) : "",
  };
}


/**
 * Convert text + marks into TEI - handles apparatus marks and latex
 */
function processMarksApparatusEntryForBody(text: string, marks: { type: string; attrs?: Record<string, TEMP_ANY> }[]): string {
  let xml = text;

  for (const mark of marks) {
    const { type, attrs } = mark;

    switch (type) {
      case "citation": {
        xml = getBibReferenceXml(attrs?.bibliography);
        break;
      }

      default:
        // unknown mark: ignore or wrap as span-like
        break;
    }
  }

  return xml;
}

/**
 * Recursively convert a JSON node (or array of nodes) into a TEI apparatus body entry fragment.
 * Handles text nodes with marks (apparatus, citations, latex) and recursively converts child nodes.
 * If the node is an array, it will be converted into a single string.
 * If the node is undefined, an empty string will be returned.
 * If the node is not a text node, its child nodes will be recursively converted into a TEI apparatus body entry fragment.
 */
function jsonToTeiApparatusEntryForBody(node?: JsonNode | JsonNode[]): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map((n) => jsonToTeiApparatusEntryForBody(n)).join("");

  const { type, content } = node;
  switch (type) {
    case "text": {
      return processMarksApparatusEntryForBody(sanitizeXml(node.text ?? ''), node.marks ?? []);
    }
    default:
      if (content) return jsonToTeiApparatusEntryForBody(content);
      return "";
  }
}

/* ----------------- Apparatus section builder ----------------- */

/**
 * Convert separate apparatuses (DocumentApparatus[]) to a TEI <div type="apparatus"> fragment.
 * Each apparatus content will be converted via jsonToTeiApparatusEntryForBody and wrapped with identifying attributes.
 */
function generateApparatusesXml(apparatuses?: DocumentApparatus[]): string {
  if (!apparatuses || apparatuses.length === 0) return "";
  const listAppContent = apparatuses.filter((app) => app.type === 'CRITICAL').map((app) => `
        ${(app?.content?.content ?? []).map(entry => {
    let noteText = '';
    let readingData = '';
    const readingTextData = entry.content[0].content.map((nodeData) => {
      switch (nodeData.type) {
        case 'lemma':
          return `<lem>${nodeData.attrs.lemma.content}</lem>`;
        case 'siglum': {
          const siglumData = (nodeData?.attrs?.siglumNodes ?? []).map((sigNode) => sigNode.content).join("");
          noteText += siglumData;
          readingData += siglumData;
          return '';
        }
        case 'readingSeparator': {
          noteText += nodeData.attrs.readingSeparator.content;
          const returnReading = `<rdg>${readingData}</rdg>`;
          readingData = '';
          return returnReading;
        }
        case 'readingType': {
          noteText += (nodeData?.attrs?.readingType?.content ?? '');
          readingData += (nodeData?.attrs?.readingType?.content ?? '');
          return '';
        }
        case 'text': {
          const text = processMarksApparatusEntryForBody(nodeData.text, nodeData.marks ?? []);
          noteText += text;
          readingData += text;
          return '';
        }
        default:
          noteText += nodeData.text;
          readingData += nodeData.text;
          return '';
      }
    }).filter(Boolean).join('') + (readingData.length > 0 ? `<rdg>${readingData}</rdg>` : '');
    return `
            <app xml:id="id-${entry.attrs.id}">
                ${readingTextData}
                <note>${noteText}</note>
            </app>
            `;
  }).join("")}
      `).join("")
  return listAppContent.trim().length === 0 ? "" : `
    <listApp>
      ${listAppContent}
    </listApp>
  `;
}

/**
 * Generate a <listWit> element with all sigla as children.
 * @param sigla list of sigla
 * @returns xml string
 */
function generateWitnessesXml(sigla: DocumentSiglum[]): string {
  return sigla.length === 0 ? `<listWit>
    <witness>
      <abbr>DataNotAvailable</abbr>
      DataNotAvailable
    </witness>
  </listWit>` : `<listWit>
    ${sigla.map((s) => `
      <witness>
        <abbr>${s.value.title}</abbr>
        ${s.manuscripts.title}
      </witness>
    `).join("")}
  </listWit>`;
}

/**
 * Build a full TEI document from the provided DocumentData object.
 */
export const buildTei = async (tocHeaderTitle: string, doc: DocumentData): Promise<string> => {
  const meta = doc.metadata ?? doc?.metadata ?? ({} as Metadata);
  const bibliographyRefs = doc.bibliographies.flatMap(bib => bib.references).sort();
  apparatusEntryDataIdBased = doc.apparatuses.reduce((acc, app) => {
    const appData = (app?.content?.content ?? []).reduce((appAcc, entry, index) => {
      const { attrs, content } = entry;
      const { id: entryId, type } = attrs;
      appAcc[entryId] = {
        place: type === 'CRITICAL' ? undefined : notePlacement[type],
        attrs: attrs,
        text: type === 'CRITICAL' ? undefined : jsonToTeiApparatusEntryForBody(content),
        entryId,
        n: index + 1
      };
      return appAcc;
    }, {} as ApparatusEntryDataIdBasedType);
    return {
      ...acc,
      ...appData
    };
  }, {} as ApparatusEntryDataIdBasedType);
  const headerXml = buildTeiHeaderFromMetadata(meta, bibliographyRefs);
  const { tocXml, introXml, criticalXml, bibliographyXml } = await bodyToTei(tocHeaderTitle, doc.template.layout, doc.mainText?.content ?? []);
  const listApparatus = generateApparatusesXml(doc.apparatuses);
  const listWitness = generateWitnessesXml(doc.sigla);
  const bodyXml = introXml.length > 0 || criticalXml.length > 0 || bibliographyXml.length > 0 ? `
    ${introXml}
    ${criticalXml}
    ${bibliographyXml}
    ` : '';

  return Promise.resolve(`<TEI xmlns="http://www.tei-c.org/ns/1.0">
      ${headerXml}
      <text>
      ${tocXml.trim().length > 0 ? `
        <front>
          ${tocXml}
        </front>` : '<front />'}
        <body>
          ${bodyXml.length > 0 ? bodyXml : '<p>DataNotAvailable</p>'}
        </body>
        ${listWitness.length > 0 || listApparatus.length > 0 ? `
          <back>
            ${listWitness}
            ${listApparatus}
          </back>
          ` : ''
    }
      </text>
    </TEI>`);
}