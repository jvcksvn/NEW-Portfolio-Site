/*
  SEO helpers. Source: 01-build-spec.md section 7.

  Title pattern is `{Nav label} | Jackson Barker`, separator is the pipe.
  The landing overrides it with its own title. Under 60 characters everywhere.
*/

export const SITE_NAME = 'Jackson Barker';
export const SITE_URL = 'https://jacksonbarker.com';

export const titleFor = (navLabel: string) => `${navLabel} | ${SITE_NAME}`;

/*
  The 25 word About version, now written. 09-about.md.

  It is the OG description on every route sitewide. While it was unwritten the
  SEO component omitted the tag rather than emitting a bracketed placeholder;
  with it real, og:description is restored everywhere and /about gets a real
  meta description.
*/
export { ABOUT_25_WORDS as OG_DESCRIPTION } from '../data/copy/about';

export const isUnresolved = (value: string) => value.includes('\u27e6') || value.includes('\u27e7');
