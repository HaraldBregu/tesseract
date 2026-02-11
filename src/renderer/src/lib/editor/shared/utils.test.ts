/**
 * Tests for editor shared utility functions
 */

import {
  removeAllStyles,
  removeParagraphAndHeadings,
  removeLinks,
  removeBreaks,
  removeMainTextCustomElements,
  removeApparatusCustomElements,
  removeCustomElements,
  selectParagraphsOnly,
} from './utils';

// Helper to create a DOM container with HTML
const createContainer = (html: string): Element => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('removeAllStyles', () => {
  it('removes strong tags and preserves content', () => {
    const container = createContainer('<strong>bold text</strong>');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('bold text');
  });

  it('removes em tags and preserves content', () => {
    const container = createContainer('<em>italic text</em>');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('italic text');
  });

  it('removes nested formatting tags', () => {
    const container = createContainer('<strong><em>nested</em></strong>');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('nested');
  });

  it('removes span tags', () => {
    const container = createContainer('<span class="custom">styled</span>');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('styled');
  });

  it('removes link tags', () => {
    const container = createContainer('<a href="#">link text</a>');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('link text');
  });

  it('handles empty container', () => {
    const container = createContainer('');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('');
  });

  it('preserves plain text', () => {
    const container = createContainer('plain text');
    removeAllStyles(container);
    expect(container.innerHTML).toBe('plain text');
  });
});

describe('removeParagraphAndHeadings', () => {
  it('removes paragraph tags and preserves content', () => {
    const container = createContainer('<p>paragraph text</p>');
    removeParagraphAndHeadings(container);
    expect(container.innerHTML).toBe('paragraph text');
  });

  it('removes h1 tags', () => {
    const container = createContainer('<h1>heading 1</h1>');
    removeParagraphAndHeadings(container);
    expect(container.innerHTML).toBe('heading 1');
  });

  it('removes all heading levels', () => {
    const container = createContainer('<h1>h1</h1><h2>h2</h2><h3>h3</h3>');
    removeParagraphAndHeadings(container);
    expect(container.innerHTML).toBe('h1h2h3');
  });

  it('removes multiple paragraphs', () => {
    const container = createContainer('<p>first</p><p>second</p>');
    removeParagraphAndHeadings(container);
    expect(container.innerHTML).toBe('firstsecond');
  });
});

describe('removeLinks', () => {
  it('removes anchor tags and preserves content', () => {
    const container = createContainer('<a href="http://example.com">link</a>');
    removeLinks(container);
    expect(container.innerHTML).toBe('link');
  });

  it('removes multiple links', () => {
    const container = createContainer('<a href="#">one</a> and <a href="#">two</a>');
    removeLinks(container);
    expect(container.innerHTML).toBe('one and two');
  });
});

describe('removeBreaks', () => {
  it('removes br tags', () => {
    const container = createContainer('line one<br>line two');
    removeBreaks(container);
    expect(container.innerHTML).toBe('line oneline two');
  });

  it('removes multiple br tags', () => {
    const container = createContainer('a<br><br><br>b');
    removeBreaks(container);
    expect(container.innerHTML).toBe('ab');
  });
});

describe('removeMainTextCustomElements', () => {
  it('removes bookmark elements', () => {
    const container = createContainer('<bookmark>marked text</bookmark>');
    removeMainTextCustomElements(container);
    expect(container.innerHTML).toBe('marked text');
  });

  it('removes note elements', () => {
    const container = createContainer('<note>note content</note>');
    removeMainTextCustomElements(container);
    expect(container.innerHTML).toBe('note content');
  });

  it('removes comment elements', () => {
    const container = createContainer('<comment>comment text</comment>');
    removeMainTextCustomElements(container);
    expect(container.innerHTML).toBe('comment text');
  });
});

describe('removeApparatusCustomElements', () => {
  it('removes lemma elements', () => {
    const container = createContainer('<lemma>lemma content</lemma>');
    removeApparatusCustomElements(container);
    expect(container.innerHTML).toBe('lemma content');
  });

  it('removes comment elements', () => {
    const container = createContainer('<comment>comment</comment>');
    removeApparatusCustomElements(container);
    expect(container.innerHTML).toBe('comment');
  });
});

describe('removeCustomElements', () => {
  it('removes all custom elements', () => {
    const container = createContainer('<lemma>L</lemma><bookmark>B</bookmark><note>N</note>');
    removeCustomElements(container);
    expect(container.innerHTML).toBe('LBN');
  });
});

describe('selectParagraphsOnly', () => {
  it('keeps only paragraph elements', () => {
    const container = createContainer('<div><p>first</p></div><p>second</p>');
    selectParagraphsOnly(container);
    
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
  });

  it('handles container with no paragraphs', () => {
    const container = createContainer('<div>no paragraphs</div>');
    const originalHtml = container.innerHTML;
    selectParagraphsOnly(container);
    expect(container.innerHTML).toBe(originalHtml);
  });

  it('removes non-paragraph content', () => {
    const container = createContainer('<span>span</span><p>paragraph</p>');
    selectParagraphsOnly(container);
    
    expect(container.querySelectorAll('span').length).toBe(0);
    expect(container.querySelectorAll('p').length).toBe(1);
  });
});
