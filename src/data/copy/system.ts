/*
  Footer, 404, and 500 strings.

  Source: Claude - Site Details/04-site-copy-interior.md, "System pages" and
  "Footer". Transcribed verbatim.
*/

import { LINKS, MAILTO, ROUTES } from '../../lib/routes';

export const FOOTER = {
  /* The year is a hardcoded string, checked at each deploy. No "All rights
     reserved". No "Built with". No last updated date unless it updates itself. */
  line: `Jackson Barker, 2026. ${LINKS.email}`,
  links: [
    { label: 'Resume PDF', href: LINKS.resumePdf },
    { label: 'LinkedIn', href: LINKS.linkedin },
    { label: 'Email', href: MAILTO },
  ],
  note: 'Figures are locked to record. Supplier identities withheld.',
} as const;

/* 404, 16 words. Two exits, no apology. The site's one permitted joke may live
   here and is being left out. */
export const NOT_FOUND = {
  title: 'Not found',
  body: 'Nothing is at this address. The writing is at /writing and the projects are at /projects.',
  links: [
    { label: ROUTES.writing.path, href: ROUTES.writing.path },
    { label: ROUTES.projects.path, href: ROUTES.projects.path },
  ],
  meta: 'Nothing is at this address. The writing and the projects are one link away.',
} as const;

/*
  500, 14 words.

  Nothing renders this on a static build. src/pages/500.astro was removed:
  Astro's 500 page is an SSR only convention, rendered by a server when a request
  throws, and 01-build-spec.md section 1 specifies static output with no adapter.
  On static Vercel hosting a 5xx can only come from Vercel's own edge, which
  serves its own page; there is no static hook for a custom 500 the way there is
  for 404.html. The string is kept here because 04 specifies it and it is needed
  the moment any route becomes server rendered. See the session report.
*/
export const SERVER_ERROR = {
  title: 'Server error',
  body: `This page failed to load. Email ${LINKS.email} and the message reaches me either way.`,
  meta: 'This page failed to load. Email reaches Jackson Barker either way.',
} as const;
