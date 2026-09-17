import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/*
  Content collections and schemas. Source: 01-build-spec.md section 2.

  "Malformed frontmatter fails the build rather than rendering a blank card."
  Every rule below is there to make that true, so a bad value stops the build
  with a message naming the file, the field, and what was wrong with it.
*/

/*
  Dates are not set. 01 section 11 and 00's known open items both record that no
  piece in any collection carries one and that thirty eight are needed before
  launch. Frontmatter carries this placeholder until then.

  The schema accepts it so the build runs, and scripts/check-dates.mjs surfaces
  the list. Nothing may render it: templates read `dated` rather than `date`.
*/
export const UNDATED = '⟦YYYY-MM-DD⟧';

/* The same rule for the Library's year read. See the library schema below. */
export const NO_YEAR = '⟦YYYY⟧';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const dateField = z
  .string()
  .refine((value) => value === UNDATED || isoDate.test(value), {
    message: `must be YYYY-MM-DD, or the placeholder ${UNDATED} until the piece is dated`,
  });

/*
  Reading time is computed from word count at 240 words per minute and is never
  hand typed (01 section 2). Files 05 and 06 do carry the value, so rather than
  ignore what they wrote, the schema recomputes it and rejects any file whose
  written value disagrees. The number in the file is verified, not trusted.
*/
const readingTimeFor = (wordCount: number) => Math.ceil(wordCount / 240);

const READING_TIME_RULE = {
  message: 'readingTime must equal ceil(wordCount / 240). It is computed, never hand typed.',
  path: ['readingTime'],
};

const readingTimeMatches = (data: { readingTime: number; wordCount: number }) =>
  data.readingTime === readingTimeFor(data.wordCount);

/* Fixed tag vocabularies. One per collection; the three do not share an index,
   so they do not share tags. A new tag is added by revising the list here,
   never by typing one into a file. Files 05, 06, and 07. */

export const WRITING_TAGS = [
  'attention',
  'avoidance',
  'tools',
  'measurement',
  'experiments',
  'practice',
  'learning',
] as const;

export const ANALYSIS_TAGS = [
  'Automation',
  'Uncertainty',
  'Master Data',
  'Demand Signal',
  'Metrics',
  'Adoption',
  'Supply Base',
  'Planner Role',
] as const;

export const LIBRARY_TAGS = [
  'Persuasion',
  'Other minds',
  'Attention',
  'Habits',
  'Creative work',
  'Career',
  'Business',
  'Risk',
] as const;

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab case, no leading or trailing dash');

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z
    .object({
      title: z.string().min(1),
      slug,
      date: dateField,
      mode: z.enum(['C', 'D']),
      excerpt: z.string().max(160, 'excerpt ceiling is 160 characters'),
      tags: z.array(z.enum(WRITING_TAGS)).min(1),
      readingTime: z.number().int().positive(),
      wordCount: z.number().int().positive(),
      draft: z.boolean(),
    })
    .refine(readingTimeMatches, READING_TIME_RULE),
});

const analysis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/analysis' }),
  schema: z
    .object({
      title: z.string().min(1),
      slug,
      date: dateField,
      excerpt: z.string().max(160, 'excerpt ceiling is 160 characters'),
      tags: z.array(z.enum(ANALYSIS_TAGS)).min(1),
      readingTime: z.number().int().positive(),
      wordCount: z.number().int().positive(),
      draft: z.boolean(),
      /* The falsifiable claim the piece makes. Author metadata, never displayed;
         it exists so the collection can be audited against what actually
         happened. File 06. */
      position: z.string().min(1),
    })
    .refine(readingTimeMatches, READING_TIME_RULE),
});

const library = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/library' }),
  schema: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    slug,
    /* One line. No rating, no stars, no score: a number above a verdict is read
       first and swallows it. File 07 and the Book Review style doc. */
    verdict: z.string().min(1),
    tags: z.array(z.enum(LIBRARY_TAGS)).min(1),
    length: z.enum(['short', 'long']),
    wordCount: z.number().int().positive(),
    draft: z.boolean(),
    /*
      Required, not optional. 01 section 2: a book entry has no publication date
      of its own, so `date` would invent one; what the Library index needs is the
      sort and filter field that 04 already lists as "Year read", and an optional
      field no entry populates ships a broken control.

      Extracted from the entry body by scripts/import-content.mjs, never inferred.
      Eighteen of twenty three entries do not state one and carry the placeholder
      until they are supplied. scripts/check-content.mjs surfaces the list.
    */
    yearRead: z.union([z.number().int().min(1900).max(2100), z.literal(NO_YEAR)]),
  }),
});

export const collections = { writing, analysis, library };
