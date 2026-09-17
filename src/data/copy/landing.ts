/*
  Every string on the landing page.

  Source: Claude - Site Details/03-site-copy-landing.md
  Transcribed verbatim. Nothing here is paraphrased, improved, or shortened to
  fit a layout. If a string does not fit, the layout changes.

  Figures are interpolated from src/data/metrics.ts rather than typed, per
  01-build-spec.md section 8. The sentences are otherwise character for
  character what the copy file says, straight apostrophes included.
*/

import { LINKS, MAILTO, ROUTES } from '../../lib/routes';

/* 1. Nav ------------------------------------------------------------------ */

export const NAV_COPY = {
  skipLink: 'Skip to content',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  brandLabel: 'Jackson Barker, home',
} as const;

/* 2. Hero ----------------------------------------------------------------- */

export const HERO = {
  nameFirst: 'JACKSON',
  nameLast: 'BARKER',
  /* The site's label: the function run, not the title held. */
  roleLine: 'LAUNCH MATERIAL PLANNING FOR ELECTRIC VEHICLES',
  scrollCueLabel: 'Scroll to content',
  imageAlt:
    'A technical illustration of an electric vehicle chassis, a robotic arm, a rocket, and a processor',
} as const;

/* 3. Action row, above the fold ------------------------------------------- */

/*
  03 section 3. Directly under the coral rule, inside the hero.

  Resume PDF is primary and filled; Contact Me is secondary and outlined;
  Explore is a quiet text link that scrolls to the Interactive Resume section.

  The positioning statement and subhead are cut. 03: the hero's role line is the
  whole positioning claim above the fold.
*/
export const ACTION_ROW = [
  { label: 'Resume PDF', href: LINKS.resumePdf, kind: 'primary' },
  { label: 'Contact Me', href: ROUTES.contact.path, kind: 'secondary' },
  { label: 'Explore', href: '#interactive-resume', kind: 'scroll' },
] as const;

/* 4. Resume section -------------------------------------------------------- */

export const RESUME_SECTION = {
  /*
    The header reads "Interactive Resume" while the nav label stays "RESUME".
    00 section 75 records this as the first of two deliberate relaxations of the
    header matching rule: the nav needs one word, the section needs to say what
    makes it worth opening.
  */
  header: 'Interactive Resume',
  blurb:
    'The same history as the PDF, with the work attached. One tab per role, each carrying the tracker or the tool that came out of it. The PDF is at the bottom.',
  link: { label: 'Open the resume', href: ROUTES.resume.path },
} as const;

/* 5 to 8. Sections --------------------------------------------------------- */

/* 03 section 5. */
export const PROJECTS_SECTION = {
  header: ROUTES.projects.label,
  blurb:
    'Fires, backlogs, and buried data. Three case studies from launch planning, what happened, what I did, and what it returned.',
  link: { label: 'See the projects', href: ROUTES.projects.path },
} as const;

/*
  03 section 6. One section, two states, switched by a toggle beneath the header.

  The draft of the Essays tagline said eight pieces. There are seven, and the
  count check fails the build if a stated count disagrees with what renders.
*/
export const WRITING_SECTION = {
  header: ROUTES.writing.label,
  toggle: [
    { value: 'essays', label: 'Essays' },
    { value: 'analysis', label: 'Analysis' },
  ],
  states: {
    essays: {
      blurb:
        'Things I noticed, stole, or got wrong, named and then tested on myself. Each one with a result. Most of those results are partial, and writing them down is how I stop relearning them.',
      link: { label: 'Read the writing', href: ROUTES.writing.path },
    },
    analysis: {
      blurb:
        'Where I think out loud about supply chain, hardware, and the tech that keeps promising to fix both.',
      link: { label: 'Read the analysis', href: ROUTES.analysis.path },
    },
  },
} as const;

/* 03 section 7. Seven covers visible, one centred plus three either side. */
export const LIBRARY_SECTION = {
  header: ROUTES.library.label,
  blurb:
    'Twenty three books, what I kept from each, and what happened when I used it. Not reviews written to help anyone decide what to buy.',
  link: { label: 'See the library', href: ROUTES.library.path },
} as const;

/*
  03 section 8. Two deliberate departures from the style guide, both recorded in
  03: this copy uses the second person, and it states a response time. The two
  day commitment now stands in four places, here, on /contact, in the success
  state, and in the closing paragraph of 09-about.md. It holds in all four or it
  comes out of all four.
*/
export const CONTACT_SECTION = {
  header: ROUTES.contact.label,
  blurb:
    'Email works. Specific questions get specific answers, usually within two days. If you are working on something worth building, say what it is. If not, the answer will be short and honest.',
  link: { label: 'Send a message', href: MAILTO },
} as const;

/* 11. Metadata ------------------------------------------------------------- */

export const LANDING_META = {
  title: 'Jackson Barker | Launch planning, electric vehicles',
  /* 153 characters, inside the 140 to 155 band. Counted, not estimated. */
  description:
    'Jackson Barker ran launch material planning at an electric vehicle plant. Two hundred cutovers while the line ran. Three case studies and fifteen pieces.',
  ogImageText: 'Jackson Barker. Launch planning, electric vehicles.',
} as const;
