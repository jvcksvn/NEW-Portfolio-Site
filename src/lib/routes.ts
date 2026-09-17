/*
  One route, one name, everywhere on the site.

  00-START-HERE.md: "Section headers match nav labels character for character."
  The label is stored once, in sentence case, and the nav uppercases it in CSS.
  That makes the rule true of the source string rather than only of the render,
  so a section header and its nav item cannot drift apart.
*/

export interface Route {
  /** The label. Nav item, section header, and SEO title all read this one string. */
  label: string;
  path: string;
}

export const ROUTES = {
  projects: { label: 'Projects', path: '/projects' },
  writing: { label: 'Writing', path: '/writing' },
  analysis: { label: 'Analysis', path: '/analysis' },
  library: { label: 'Library', path: '/library' },
  resume: { label: 'Resume', path: '/resume' },
  about: { label: 'About', path: '/about' },
  contact: { label: 'Contact', path: '/contact' },
} as const satisfies Record<string, Route>;

export type RouteKey = keyof typeof ROUTES;

/** Nav order. 01-build-spec.md section 4. Seven items plus the name. */
export const NAV_ORDER: RouteKey[] = [
  'projects',
  'writing',
  'analysis',
  'library',
  'resume',
  'about',
  'contact',
];

export const NAV_ITEMS = NAV_ORDER.map((key) => ROUTES[key]);

/** External and asset destinations. Every one resolves. */
export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/jackson-barker-b18314266/',
  email: 'jacksonmbarker1@gmail.com',
  resumePdf: '/jackson-barker-resume.pdf',
} as const;

export const MAILTO = `mailto:${LINKS.email}`;
