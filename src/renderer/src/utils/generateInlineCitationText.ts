const generateInlineCitationText = (reference: BibReference, style: CITATION_STYLES, isBibliographySection: boolean = true): string => {
    const author = reference.author?.join(', ') || ''
    const year = reference.date || ''
    const title = reference.title || ''

    switch (style) {
        case 'chicago-17-note-bibliography':
            return `${author ? `${author},` : ''} ${title ? `${title}` : ''} ${year}` ;
        case 'chicago-17-author-date':
        default:
            return isBibliographySection ? `${author ? `${author}, ` : ''}${year ? `${year}, ` : ''}${title ? `${title}` : ''}` : `(${author ? `${author},` : ''} ${year})`
    }
}

export default generateInlineCitationText