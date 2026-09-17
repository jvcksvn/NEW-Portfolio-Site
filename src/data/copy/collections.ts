/*
  Index copy for /writing, /analysis and /library. Source:
  04-site-copy-interior.md, Writing, Analysis and Library. Verbatim.

  Index orderings are build constraints, not preferences, and are encoded here
  rather than recomputed: 05 for writing, 06 for analysis, 07 for library.
*/

export const WRITING_INDEX = {
  h1: 'Writing',
  /* 04: the draft of this line said eight. There are seven, and the count
     check fails the build if a stated count disagrees with what renders. */
  standfirst:
    'Seven pieces, each built the same way. A mechanism I noticed, stole, or got wrong, named so it can be repeated, tested on myself, and reported with whatever came back. Most of what comes back is partial. None of it is productivity advice.',
  meta: 'Seven pieces on the gap between how work is supposed to run and how it runs, written by a production planner. None of it is productivity advice.',
} as const;

export const ANALYSIS_INDEX = {
  h1: 'Analysis',
  standfirst:
    'Thoughts on supply chain, hardware, and the technology that keeps promising to fix both. Each one commits to a claim that could later turn out to be wrong, carries the counterargument in its own section, and names the conditions under which it holds.',
  meta: 'Eight pieces on where supply chain planning is going, from agentic supervision to the bullwhip in real time. Each one takes a position that can be checked.',
} as const;

export const LIBRARY_INDEX = {
  h1: 'Library',
  standfirst:
    'Twenty three books, what I kept from each, and what happened when I used it. Not reviews written to help anyone decide what to buy.',
  meta: 'Twenty three books with what was kept from each and what happened when it was used. Not reviews written to help anyone decide what to buy.',
} as const;

/*
  05 index ordering. At least one Mode C piece in the top three, never three
  Mode D in a row at the top. Top three reads C, D, C.
*/
export const WRITING_ORDER = [
  'the-bad-version-goes-first',
  'sharpen-less',
  'i-quit-every-system-i-ever-loved',
  'look-where-you-want-to-go',
  'why-you-remember-nothing-you-learned-from-a-tutorial',
  'a-guide-to-changing-one-thing',
  'nobody-is-boring-your-questions-are',
];

/* 06 index ordering. Strongest first for a supply chain hiring manager. */
export const ANALYSIS_ORDER = [
  'agentic-planning-supervision',
  'landed-cost-hedging',
  'forecasting-high-volume-world',
  'bullwhip-real-time',
  'digital-twin-master-data',
  'physical-ai-planning-signal',
  'planning-becomes-the-decision',
  'deterministic-hangover',
];

/*
  07 default ordering. Eight are ranked explicitly; the remaining fifteen follow
  in the order the template produces, which here is the order the collection
  loads them in.
*/
export const LIBRARY_ORDER = [
  'influence',
  'the-4-hour-workweek',
  'the-psychology-of-money',
  'poke-the-box',
  'zero-to-one',
  'getting-things-done',
  'atomic-habits',
  'deep-work',
];

/** Sorts entries by an explicit slug order, with anything unlisted after it. */
export const byOrder = <T extends { data: { slug: string } }>(entries: T[], order: string[]) =>
  [...entries].sort((a, b) => {
    const ai = order.indexOf(a.data.slug);
    const bi = order.indexOf(b.data.slug);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
