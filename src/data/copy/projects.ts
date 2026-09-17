/*
  /projects index copy and the three case tiles.

  Index strings: 04-site-copy-interior.md, Projects. Verbatim.
  Tiles: 03-site-copy-landing.md section 5, rewritten. Each tile is two parts,
  a top card carrying the number and the domain and a main card carrying the
  title, the description and the stats.

  The three descriptions are reinstated from Projects - Index + Landing.md.
  They were dropped in version 2 and the tiles read as bare stat blocks.

  One tile component renders these on both /projects and the landing, per 03
  section 5. There is no second implementation.
*/

import { ROUTES } from '../../lib/routes';

export type CaseTint = 'coral' | 'blue' | 'graphite';

export interface CaseStat {
  /* A figure or a mark, never both. 03 section 5: all nine stats are one
     figure or one mark plus one label, so the three rows line up without
     special casing. */
  figure?: string;
  /** A supplied monochrome mark in the figure's position. Never an emoji. */
  mark?: 'car' | 'recycle';
  /* A second smaller line under the figure, where the figure has a unit.
     03 section 5: "12 Week Material Gap" sets as 12 large, Week smaller
     beneath it, Material Gap as the label. */
  unit?: string;
  /* One step down from --t-stat, to --t-h2, where the value is too wide for
     the slot. 03 section 5 names <$20K: a value with a currency symbol and a
     comparator overflows into its neighbour at full size. One step, not two:
     at --t-h3 it read as secondary rather than as a figure. */
  small?: boolean;
  label: string;
}

export interface CaseTile {
  number: string;
  kicker: string;
  title: string;
  description: string;
  stats: CaseStat[];
  href: string;
  tint: CaseTint;
}

/*
  03 section 5. Identical on the landing and on /projects: the tiles are one
  component rendered in both places.

  Tints are coral, blue and graphite in order, per 02 section 2.
*/
export const CASE_TILES: CaseTile[] = [
  {
    number: '01',
    kicker: 'CASE 01: ALUMINUM SUPPLY',
    title: 'Tier 3 Supply Recovery (Clear to Build System)',
    description:
      'A hot mill fire upstream put 240 of 309 aluminum components at risk. I translated a raw material constraint into part level exposure and ran the recovery.',
    stats: [
      { figure: '78%', label: 'Components Exposed' },
      { figure: '10', label: 'Suppliers' },
      { figure: '12', unit: 'Week', label: 'Material Gap' },
    ],
    href: '/projects/tier-3-aluminum-disruption',
    tint: 'coral',
  },
  {
    number: '02',
    kicker: 'CASE 02: LAUNCH PLANNING',
    title: '200+ New Part Introductions',
    description:
      'One operating view that fuses fragmented supply signals into what will actually run out, when, and what to do about it. Still in production after my departure.',
    stats: [
      { figure: '200+', label: 'Cutovers' },
      { mark: 'car', label: 'Minimal Disruption' },
      { figure: '<$20K', small: true, label: 'Material Obsolescence' },
    ],
    href: '/projects/clear-to-build-system',
    tint: 'blue',
  },
  {
    number: '03',
    kicker: 'CASE 03: CUSTOMER FULFILLMENT',
    title: 'Two Year Backlog Closed in Four Months',
    description:
      'Roughly 100 flagship customers were missing wheel trim kits. Some had waited two years. I took over a stalled backlog, closed it, and designed the failure mode out.',
    stats: [
      { figure: '100', label: 'Vehicles Resolved' },
      { mark: 'recycle', label: 'Rebuilt Fulfillment Process' },
      { figure: '0', label: 'Recurrence by Design' },
    ],
    href: '/projects/kit-backlog',
    tint: 'graphite',
  },
];

export const PROJECTS_INDEX = {
  h1: ROUTES.projects.label,

  standfirst:
    'Fires, backlogs, and buried data. Three case studies from launch planning, what happened, what I did, and what it returned.',

  /* The scope line is deleted. 04 removed it. */

  meta: 'Three cases from fourteen months of launch material planning at an electric vehicle plant. No supplier is named. What is left is the constraint and the number.',
} as const;
