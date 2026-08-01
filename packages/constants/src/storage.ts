export const ContentType = {
  LATEX: 'text/x-tex',
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  SVG: 'image/svg+xml',
  BIBTEX: 'application/x-bibtex',
  PLAIN_TEXT: 'text/plain',
  JSON: 'application/json'
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
