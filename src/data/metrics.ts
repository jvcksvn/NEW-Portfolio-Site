/*
  Every provisional figure on the site, in one file.

  01-build-spec.md section 8: "Every provisional figure lives in one file,
  src/data/metrics.ts, imported everywhere it appears. Nothing hardcodes a
  number into a component." The reconciliation pass against the handbook's
  Numbers of Record is then one file rather than a search across the whole site.

  Metrics authority for this draft: NEW Jackson Barker Resume.pdf.

  Each figure carries the word form the copy actually renders, the numeral for
  counting and checking, and the scope it is true at. Landing copy is written in
  words, so `words` is what the strings interpolate; `value` exists so the teaser
  counts can be verified against the real content directories.
*/

export interface Metric {
  /** Numeral. Used for counting, checking, and structured data. */
  value: number;
  /** Word form. What the rendered sentence actually says. */
  words: string;
  /** What the figure counts. */
  unit: string;
  /** The bound the figure is true at. A number without its scope does not ship. */
  scope: string;
}

export const METRICS = {
  tenure: {
    value: 14,
    words: 'Fourteen',
    unit: 'months',
    scope: 'at an electric vehicle plant in Casa Grande',
  },

  cutovers: {
    value: 200,
    words: 'two hundred',
    unit: 'cutovers',
    scope: 'run while the line kept building',
  },

  cases: {
    value: 3,
    words: 'Three',
    unit: 'cases',
    scope: 'from launch planning, all from one program',
  },

  writtenPieces: {
    value: 15,
    words: 'fifteen',
    unit: 'written pieces',
    scope: 'essays and analysis together, from one program',
  },

  essays: {
    value: 7,
    words: 'Seven',
    unit: 'essays',
    scope: 'published at /writing',
  },

  analysisPieces: {
    value: 8,
    words: 'Eight',
    unit: 'pieces',
    scope: 'published at /analysis',
  },

  books: {
    value: 23,
    words: 'Twenty three',
    unit: 'books',
    scope: 'published at /library',
  },

  resumeSections: {
    value: 6,
    words: 'Six',
    unit: 'sections',
    scope: 'on the interactive resume',
  },
} as const satisfies Record<string, Metric>;

/*
  Interactive resume scorecard figures.

  Every one is taken from a bullet in 04-site-copy-interior.md section Resume,
  not from the old component, whose scorecard carried 100+ cutovers, $2.8M and a
  $50K recovery, all of which Numbers of Record retires or corrects. They live
  here rather than in the resume data so the reconciliation pass stays one file,
  per 01-build-spec.md section 8.

  Scope is carried on every figure because a number without its scope does not
  ship. The scorecard renders value and label; the scope is what the bullet
  underneath it states in the same panel.
*/
export interface ResumeMetric {
  value: string;
  label: string;
  scope: string;
}

export interface ResumeStat {
  figure: string;
  unit?: string;
  label: string;
  hue?: 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'graphite';
}

/*
  Stat cards, three or four per role, at the top of the panel beside the role
  title. Values from 04 under Interactive Resume.

  The supplier recovery card takes --green: it is the positive outcome of the
  role and the only stat card on the site carrying a status hue.

  Two omissions, both reported rather than invented:
  - Digital Growth carries two cards, not three. A monthly impressions figure was
    drafted at fifteen million and appears in no authoritative source.
  - The client count is fifteen, matching the resume and the role summary. A card
    reading twenty was drafted and is not used until one number wins.
*/
export const RESUME_STATS: Record<string, ResumeStat[]> = {
  planner: [
    { figure: '200+', label: 'Cutovers' },
    { figure: '35+', label: 'Suppliers' },
    { figure: '<$20K', label: 'Material Obsolescence' },
    { figure: '~$2.5M', label: 'System Cleanup' },
  ],
  intern: [
    { figure: '$1.2M', label: 'Scrap Analyzed' },
    { figure: '$80K', label: 'Supplier Recovery', hue: 'green' },
  ],
  growth: [
    { figure: '1M+', label: 'Social Audience' },
    { figure: '15', label: 'Clients Supported' },
  ],
};

/*
  Teaser counts must equal the number of items on the page they point at.
  03-site-copy-landing.md, "Checks the build must pass", item 1.
  scripts/check-counts.mjs verifies these against the content source directories.
*/
export const TEASER_COUNTS = {
  projects: METRICS.cases.value,
  writing: METRICS.essays.value,
  analysis: METRICS.analysisPieces.value,
  library: METRICS.books.value,
} as const;

/*
  The written pieces figure is the sum of two collections, so it cannot drift
  independently of them. If this throws, one of the three numbers is wrong.
*/
if (METRICS.essays.value + METRICS.analysisPieces.value !== METRICS.writtenPieces.value) {
  throw new Error(
    `metrics.ts: writtenPieces (${METRICS.writtenPieces.value}) must equal essays (${METRICS.essays.value}) plus analysisPieces (${METRICS.analysisPieces.value}).`,
  );
}
