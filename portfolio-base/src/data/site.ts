/**
 * Site-wide facts. Every value in brackets is a placeholder to replace.
 */
export const site = {
  name: 'Yahir Eduardo Bravo',
  role: 'software architect',
  domain: 'YEBT.DEV',
  location: '[CITY]',
  email: 'mailto:yahir.eduardo.bravo@gmail.com',
  emailLabel: 'yahir.eduardo.bravo@gmail.com',
  cv: '/cv.pdf',
  github: 'https://github.com/yebt',
  githubLabel: '@yebt',
  linkedin: 'https://www.linkedin.com/in/yahir-eduardo-bravo-tafur/',
} as const;

export const practice = [
  {
    term: 'DOMAIN FIRST',
    text: 'Model the business before the code. Names, boundaries and folders follow the language of the domain, so the structure says what the system does.',
  },
  {
    term: 'BOUNDARIES',
    text: 'Hexagonal and clean architecture: the core does not know about frameworks, databases or the UI, which keeps it testable and replaceable.',
  },
  {
    term: 'INTERFACES',
    text: 'Design systems built with atomic design and container–presentational components, documented on video for every project.',
  },
  {
    term: 'QUALITY',
    text: 'Tests and reviews are part of the design, not a step after it. Small, reviewable changes over large rewrites.',
  },
] as const;
