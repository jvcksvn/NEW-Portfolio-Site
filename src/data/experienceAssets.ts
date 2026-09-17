/*
  Interactive resume content, extracted out of markup into a typed data file.
  08-resume-port-brief.md, "Architecture change, done during the port".

  Copy sourcing, which is mixed and deliberately so:

  - planner, intern, growth: 04-site-copy-interior.md section Resume. 00's
    precedence rule says 03 and 04 win on any string, and the old App.tsx copy
    carried nine dash violations plus figures retired in Numbers of Record
    (100+ cutovers, $2.8M, $50K recovery, and a date reading "Present" for a role
    that ended in June 2026).
  - tools, education, about: ported from App.tsx, because 04 does not cover them.
    Their remaining dash violations are listed in the session report rather than
    corrected here.

  Scorecard figures come from 04's own bullets and live in src/data/metrics.ts,
  per 01-build-spec.md section 8: every provisional figure in one file, so the
  reconciliation pass is one file rather than a search.
*/

import { RESUME_STATS, type ResumeStat } from './metrics';

export type ExperienceAssetId = 'planner' | 'intern' | 'growth' | 'tools' | 'about' | 'education';

export type MetricTone = 'neutral' | 'good' | 'warn' | 'crit';

/* 04, "Visual disclosures". Each id is one closed <details> hanging off the
   bullet group it belongs to, with a label that names what is behind it. */
export type VisualDisclosureId = 'ctb' | 'ecr' | 'intern' | 'growth';

export const VISUAL_DISCLOSURES: Record<VisualDisclosureId, string> = {
  ctb: 'See the tracker',
  ecr: 'See the dashboard',
  intern: 'See the analysis',
  growth: 'See the funnel',
};

export type AssetMetric = ResumeStat;

export interface ExperienceAsset {
  id: ExperienceAssetId;
  tab: string;
  title: string;
  company?: string;
  date?: string;
  tagline: string;
  bullets: string[];
  metrics: AssetMetric[];
  /*
    Grouped bullets: a bold claim with its sub points nested beneath. 04.

    `rail` is which grey rail the group sits on. Consecutive groups sharing a
    rail number render inside one continuous rail rather than two with a gap
    between them; nothing about the words or their order changes.

    `visual` opens a disclosure inside the rail. `closeWith` opens one below
    the rail, closing the block rather than sitting in it.
  */
  groups?: Array<{
    claim: string;
    points: string[];
    rail: number;
    visual?: VisualDisclosureId;
    closeWith?: VisualDisclosureId;
  }>;
  stack?: string;
  outcome?: string;
}

/* Fixed. 08 "Keep exactly as is": tab order is planner, intern, growth, tools,
   education, about. */
export const experienceOrder: ExperienceAssetId[] = [
  'planner',
  'intern',
  'growth',
  'tools',
  'education',
  'about',
];

/*
  Per tab accents. 08 collapses the old component's six distinct hues onto the
  site set, because six accents breaks the color budget in 02 section 2. The
  variable stays so a later change is still one edit per tab; only its values
  changed.
*/
export const assetAccentTokens: Record<ExperienceAssetId, string> = {
  planner: 'var(--blue)',
  intern: 'var(--blue)',
  growth: 'var(--coral)',
  tools: 'var(--graphite)',
  education: 'var(--graphite)',
  about: 'var(--graphite)',
};

export const experienceAssets: Record<ExperienceAssetId, ExperienceAsset> = {
  planner: {
    id: 'planner',
    tab: 'Production Planner II',
    title: 'Production Planner II',
    company: 'Lucid Motors',
    date: 'August 2025 to June 2026',
    tagline:
      'Launch material planning at Lucid. Engineering changes across 35+ Tier 1 and 2 suppliers and 250+ concurrent parts in body structures, HV electronics, fasteners, and mechanical assemblies.',
    metrics: RESUME_STATS.planner,
    bullets: [],
    /*
      Four groups. 04 notes the source numbered these 1, 2, 4, 5: there is no
      third group, the numbering was a typo, and they renumber one through four.
    */
    /*
      04, "Reordered": groups two and three swap, and the executive dashboards
      line moves from the contingency group up into supplier communication,
      where engineering changes and dashboards already are. Content only; the
      design is unchanged.

      Groups one and two share one continuous rail. The ECR readiness
      disclosure closes that block from below it rather than sitting inside it;
      the Clear to Build tracker stays on the contingency rail. Three rails on
      this panel, not four.
    */
    groups: [
      {
        claim: 'Owned supplier communication on engineering changes, timing, and material readiness.',
        points: [
          'Roughly 200 new part introductions with minimal production disruption and under $20K material obsolescence, aligning lead times, runout timing, and inbound logistics to program dates.',
          'Executive dashboards tracking 700+ engineering changes, flagging material readiness risk.',
        ],
        rail: 1,
      },
      {
        claim:
          'Partnered with Design, Engineering, Quality, Procurement, S&OP, and Service against quality, timing, and cost targets.',
        points: [
          'Prototyping through engineering approval, PPAP, forecast alignment, scheduling agreements, BOM effectivity, and NPI trials into production and service continuity.',
        ],
        rail: 1,
        closeWith: 'ecr' as const,
      },
      {
        claim: 'Built contingency systems to surface supply risk and drive escalation.',
        points: [
          'The Clear to Build system, 240 parts, during a raw material shortage: real time visibility, and resolution with Procurement through material reallocations, resequences, expedites, and alternate sourcing.',
        ],
        rail: 2,
        visual: 'ctb' as const,
      },
      {
        claim: 'Maintained pre and post implementation MRP and Material Master accuracy.',
        points: [
          'Cleanup of roughly $2.5M in phantom inventory and open POs and ASNs, for SAP data accuracy and working capital visibility.',
        ],
        rail: 3,
      },
    ],
    stack: 'SAP, SAP Analytics Cloud, Excel with VBA and Macros, SQL, Redshift, Tableau.',
  },

  intern: {
    id: 'intern',
    tab: 'Material Planning Administrator Intern',
    title: 'Material Planning Administrator Intern',
    company: 'Lucid Motors',
    date: 'May 2025 to July 2025',
    tagline: '',
    metrics: RESUME_STATS.intern,
    bullets: [],
    groups: [
      {
        claim: 'Identified supplier overproduction from EDI misalignment, using 52 week forecast and consumption trends.',
        points: [
          'Delivered finance facing analysis on $1.2M in scrap, driving disposition and roughly $80K in supplier cost recovery.',
        ],
        rail: 1,
        visual: 'intern' as const,
      },
    ],
  },

  growth: {
    id: 'growth',
    tab: 'Digital Growth Consultant',
    title: 'Digital Growth Consultant',
    company: 'Self employed',
    date: 'August 2023 to June 2025',
    tagline:
      'I ran my own practice for roughly two years, serving 15 clients: sourcing and launching white label products, then building the audiences and systems behind them.',
    metrics: RESUME_STATS.growth,
    bullets: [],
    groups: [
      {
        claim: 'Sourced and launched white label products from zero, owning supplier selection through order fulfillment.',
        points: [
          'Wired a ship on demand model into the commerce platform, so supplier data drove order processing, tracking, and reorder cycles automatically, triggered by sell through.',
        ],
        rail: 1,
      },
      {
        claim: 'Grew client social accounts past a million followers for lead generation and market validation, running a four person team on roughly 35 pieces a week.',
        points: ['Steered the team with performance and CRM data toward retention, conversion, and growth.'],
        rail: 2,
      },
    ],
  },

  tools: {
    id: 'tools',
    tab: 'Systems and Tools',
    title: 'Systems and Tools',
    tagline: 'Tools are only useful when they turn complexity into decisions.',
    metrics: [],
    bullets: [],
  },

  education: {
    id: 'education',
    tab: 'Education',
    title: 'Education',
    tagline: 'Arizona State University, 2023 to 2026.',
    metrics: [],
    bullets: [],
  },

  /* Ported from App.tsx. 04: the About tab keeps its ported copy. */
  about: {
    id: 'about',
    tab: 'About Me',
    title: 'About Me',
    tagline:
      'I have failed early, often, and in ways that taught me a lot. I have built things that were too manual, too fragile, too dependent on me holding them together. Then I had to fix them. That process taught me that good systems are not built in theory. They are built under pressure, through feedback, iteration, and the humility to make the next version better. That is the work I am drawn to: turning complexity into clarity, and building systems that help people move forward with more confidence.',
    metrics: [],
    bullets: [],
  },
};

/*
  Capability chip groups. 04 and 02 section 6: three groups, each with a colored
  container and its label in that hue.
*/
export const CAPABILITY_GROUPS = [
  { label: 'Systems', hue: 'blue' as const, items: ['SAP', 'SAP Analytics Cloud', 'HubSpot'] },
  { label: 'Data and Reporting', hue: 'green' as const, items: ['Excel (Advanced)', 'VBA and Macros', 'Redshift', 'Tableau', 'Power BI'] },
  { label: 'Programming', hue: 'amber' as const, items: ['SQL', 'Python'] },
];

/* Ported from the extraction map, line 145. Four entries. */
export const educationClubs = [
  'AI in Business Club',
  'Department of Information Systems Club',
  'Venture Devils',
  'Supply Chain Management Club',
];

/*
  Education groups, same chip pattern. Four groups, laid out two by two.

  Clubs is read from `educationClubs` above, which was ported from the
  extraction map. An earlier pass omitted this group on the belief that no
  source carried the list. The source is right here.
*/
export const EDUCATION_GROUPS = [
  { label: 'Degrees', hue: 'blue' as const, items: ['BS Supply Chain Management', 'BS Computer Information Systems'] },
  { label: 'Grades and Honors', hue: 'green' as const, items: ['4.04 GPA', 'Summa Cum Laude'] },
  { label: 'Scholarships', hue: 'amber' as const, items: ['Boeing SCM Scholar', 'New American University Scholar', 'Malone CIS Scholar'] },
  { label: 'Clubs', hue: 'purple' as const, items: educationClubs },
];

/* Ported from App.tsx unchanged. Feeds the tools tab's systems map visual. */
export const capabilityGroups = [
  {
    label: 'Systems',
    items: [
      { name: 'SAP', detail: 'planning signals, inventory, purchasing visibility' },
      { name: 'SAP Analytics Cloud', detail: 'planning analytics and executive reporting' },
      { name: 'Salesforce', detail: 'CRM and demand signal tracking' },
      { name: 'HubSpot', detail: 'CRM and demand signal tracking' },
    ],
  },
  {
    label: 'Data and Reporting',
    items: [
      { name: 'Excel (Advanced)', detail: 'dashboards, cleanup, automation' },
      { name: 'VBA and Macros', detail: 'dashboards, cleanup, automation' },
      { name: 'Redshift', detail: 'querying and data analysis' },
      { name: 'Tableau', detail: 'visual reporting' },
      { name: 'Power BI', detail: 'visual reporting' },
    ],
  },
  {
    label: 'Programming',
    items: [
      { name: 'SQL', detail: 'query logic and dataset shaping' },
      { name: 'Python (Basic)', detail: 'automation, cleanup, analysis support' },
      { name: 'JavaScript', detail: 'interactive tools and web workflows' },
    ],
  },
];

/* Education detail. Values from 04's Education line. */
export const educationDegrees = [
  'BS Supply Chain Management',
  'BS Computer Information Systems',
];

export const educationHonors = ['4.04 GPA', 'Summa Cum Laude'];

export const educationScholarships = [
  'Boeing SCM Scholar',
  'New American University Scholar',
  'Malone CIS Scholar',
];


/*
  The old ported About copy is gone. 09 version 3 replaces it, and 09 requires
  this tab to carry the short body, which it reads from ABOUT_BODY_SHORT in
  src/data/copy/about.ts. /about carries the long one. The retired copy carried
  a 30 million monthly impressions figure and a seventeen client figure,
  neither of which survives.
*/

export const isLucidRole = (asset: ExperienceAsset) =>
  asset.id === 'planner' || asset.id === 'intern';

/* Tab labels break onto two lines for the two longest. Ported unchanged. */
export const getAssetTabTitleLines = (asset: ExperienceAsset): string[] => {
  if (asset.id === 'intern') return ['Material Planning', 'Administrator Intern'];
  if (asset.id === 'growth') return ['Digital Growth', 'Consultant'];
  return [asset.tab];
};
