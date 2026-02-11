export const sectionDelimiter = (type, label) => [{
    type: "sectionDivider",
    attrs: {
        sectionType: type,
        label: label,
    }
}]

export const paragraphTemplate = (style: Style | undefined) => ({
    type: "paragraph",
    attrs: {
        indent: 0,
        textAlign: style?.align || "left",
        lineHeight: style?.lineHeight || "1.2",
        marginTop: style?.marginTop || "12px",
        marginBottom: style?.marginBottom || "6px",
        fontSize: style?.fontSize || "12pt",
        fontFamily: style?.fontFamily || "Times New Roman",
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: "0px",
        marginRight: "0px",
        color: style?.color || "#000000"
    },
    content: [
        { type: "text", text: "\u200B" }
    ]
})

export const paragraphTemplateWithParams = (text: string, attrs: {}) => ({
    type: "paragraph",
    attrs: {
        ...attrs,
    },
    content: [
        { type: "text", text }
    ]
})

const createParagraphAttrs = (style: Style | undefined, baseAttrs: any): any => {
    const attrs = { ...baseAttrs };

    if (style) {
        if (style.align) attrs.textAlign = style.align;
        if (style.lineHeight) attrs.lineHeight = Number.parseFloat(style.lineHeight);
        if (style.marginTop) attrs.marginTop = style.marginTop// parseInt(style.marginTop.replace('pt', ''));
        if (style.marginBottom) attrs.marginBottom = style.marginBottom // parseInt(style.marginBottom.replace('pt', ''));

    }

    return attrs;
};

export const tocParagraphsMapped = (content: any, styles: Style[]) => {
    const tocHeadingOneStyle = styles?.find(style => style.type === "TOC_H1" && style.enabled);
    const tocHeadingTwoStyle = styles?.find(style => style.type === "TOC_H2" && style.enabled);
    const tocHeadingThreeStyle = styles?.find(style => style.type === "TOC_H3" && style.enabled);
    const tocHeadingFourStyle = styles?.find(style => style.type === "TOC_H4" && style.enabled);
    const tocHeadingFiveStyle = styles?.find(style => style.type === "TOC_H5" && style.enabled);
    const tocHeadingSixStyle = styles?.find(style => style.type === "TOC_H6" && style.enabled);

    const currentContentMapped = content
        .map((content) => {
            const level = content.attrs.level;

            let texts = ''
            content.content.forEach((content) => {
                if (content.type === "text") {
                    texts += content.text;
                }
            });

            const text = texts //content.content[0].text;

            const getTocStyle = (level: number): Style | undefined => {
                if (level === 1) {
                    let fontWeight = "normal";
                    if (tocHeadingOneStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingOneStyle?.bold) {
                        fontWeight = "bold";
                    }

                    return tocHeadingOneStyle ? {
                        ...tocHeadingOneStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                else if (level === 2) {
                    let fontWeight = "normal";
                    if (tocHeadingTwoStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingTwoStyle?.bold) {
                        fontWeight = "bold";
                    }
                    return tocHeadingTwoStyle ? {
                        ...tocHeadingTwoStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                else if (level === 3) {
                    let fontWeight = "normal";
                    if (tocHeadingThreeStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingThreeStyle?.bold) {
                        fontWeight = "bold";
                    }
                    return tocHeadingThreeStyle ? {
                        ...tocHeadingThreeStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                else if (level === 4) {
                    let fontWeight = "normal";
                    if (tocHeadingFourStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingFourStyle?.bold) {
                        fontWeight = "bold";
                    }
                    return tocHeadingFourStyle ? {
                        ...tocHeadingFourStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                else if (level === 5) {
                    let fontWeight = "normal";
                    if (tocHeadingFiveStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingFiveStyle?.bold) {
                        fontWeight = "bold";
                    }
                    return tocHeadingFiveStyle ? {
                        ...tocHeadingFiveStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                else if (level === 6) {
                    let fontWeight = "normal";
                    if (tocHeadingSixStyle?.italic) {
                        fontWeight = "italic";
                    }
                    if (tocHeadingSixStyle?.bold) {
                        fontWeight = "bold";
                    }
                    return tocHeadingSixStyle ? {
                        ...tocHeadingSixStyle,
                        level,
                        fontWeight
                    } : undefined;
                }
                return undefined;
            }

            return {
                text: text,
                attrs: getTocStyle(level)
            } satisfies { text: string, attrs: Style | undefined };
        })
        .map(({ text, attrs }: { text: string, attrs: Style | undefined }) => {

            return {
                type: "paragraph",
                attrs: {
                    indent: 0,
                    level: attrs?.level,
                    textAlign: attrs?.align,
                    lineHeight: attrs?.lineHeight,
                    marginTop: attrs?.marginTop,
                    marginBottom: attrs?.marginBottom,
                    fontSize: attrs?.fontSize,
                    fontWeight: attrs?.fontWeight,
                    fontStyle: attrs?.fontWeight,
                    color: attrs?.color,
                    fontFamily: attrs?.fontFamily,
                },
                content: [
                    { type: "text", text }
                ]
            };
        });

    return currentContentMapped;
}


export const mapHeadingsToSimpleFormat = (headings: any[]): Array<{ test: string; level: number }> => {
    if (!headings || !Array.isArray(headings)) {
        return [];
    }

    return headings.map((heading, index) => {
        const textContent = heading.content
            ? heading.content
                .filter((item: any) => item.type === "text")
                .map((item: any) => item.text || "")
                .join(" ")
                .trim() || "This is the text"
            : "This is the text";

        let level: number;

        if (index === 0) {
            level = heading.attrs?.level ?? 1;
        } else {
            const previousLevel = headings[index - 1].attrs?.level;
            level = heading.attrs?.level ?? previousLevel ?? 1;
        }

        return {
            test: textContent,
            level: level,
        };
    });
};

const getTocStyleByType = (styles: Style[] | undefined, styleType: string): Style | undefined => {
    return styles?.find(style => style.type === styleType && style.enabled);
};

export const tocTemplate = (title?: string, content?: {} | any, styles?: Style[]) => {
    // Get the main TOC style or use defaults
    const tocStyle = getTocStyleByType(styles, 'TOC');

    const defaultAttrs = {
        level: 2,
        sectionType: "toc",
        indent: 0,
        textAlign: 'left',
        lineHeight: 1,
        marginTop: 10,
        marginBottom: 10,
    };

    const tocContent = [
        ...sectionDelimiter("toc", title),
        {
            type: "paragraph",
            attrs: createParagraphAttrs(tocStyle, defaultAttrs),
        },
    ];

    if (content && Array.isArray(content) && content.length > 0) {
        return [
            ...sectionDelimiter("toc", title),
            ...content,
        ];
    }

    return tocContent;
};

export const tocTemplatetwo = (title?: string, content?: {} | any, style?: Style) => {
    // Get the main TOC style or use defaults

    const defaultAttrs = {
        level: 2,
        sectionType: "toc",
        indent: 0,
        textAlign: 'left',
        lineHeight: 1,
        marginTop: 10,
        marginBottom: 10,
    };

    const tocContent = [
        ...sectionDelimiter("toc", title),
        {
            type: "paragraph",
            attrs: createParagraphAttrs(style, defaultAttrs),
        },
    ];

    if (content && Array.isArray(content) && content.length > 0) {
        return [
            ...sectionDelimiter("toc", title),
            ...content,
        ];
    }

    return tocContent;
};

export const textTemplate = (title?: string, content?: {} | any) => {
    const textContent = [
        ...sectionDelimiter("maintext", title),
        {
            type: "paragraph",
            attrs: {
                level: 1,
                indent: 0,
                styleId: "13"
            },
        }
    ]

    if (content && Array.isArray(content) && content.length > 0) {
        return [
            ...sectionDelimiter("maintext", title),
            ...content,
        ];
    }

    return textContent;
}
