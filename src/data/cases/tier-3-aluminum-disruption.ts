/*
  Case 01. Source: Projects/Tier-3 Aluminum Disruption/Site Copy - Tier 3
  Aluminum Disruption.md, with layout from its design spec.

  Dash fixes applied, mechanical only, the same authority as the resume tabs:

  - 24 em dash characters. Most joined a heading's number to its title
    ("01 Context — An upstream constraint") or a bullet's term to its body
    ("**Depth of the constraint** — The limiter was..."). Those are separate
    fields here, so the dash is gone structurally rather than replaced. The rest
    became a comma or a period.
  - Tier-3, Tier-2, Tier-1 written open as Tier 3, Tier 2, Tier 1. 04 already
    writes the case title that way.
  - Clear-To-Build written open as Clear to Build, per 04's naming note.

  Nothing else changed. Every figure is the document's own.
*/

export const CASE_01 = {
  slug: 'tier-3-aluminum-disruption',
  number: '01',
  tint: 'coral' as const,
  tag: 'Case 01, Aluminum supply',
  title: 'Recovering supply through a Tier 3 mill fire',

  deck: 'A hot mill fire at the Tier 3 aluminum mill put 78% of the aluminum component base at risk. I turned an upstream raw material constraint into part level exposure, which parts, which suppliers, which build dates, and ran the recovery so the affected builds kept running through the gap.',

  stats: [
    { value: '240 of 309', label: 'aluminum components, 78% of the base' },
    { value: '10', label: 'supply nodes across 4 countries' },
    { value: '12 wk', label: 'material gap at its widest' },
    { value: '20 wk', label: 'recovery, against a 16 wk first estimate' },
  ],

  context: {
    number: '01',
    label: 'Context',
    title: 'An upstream constraint, several tiers from the line',
    body: [
      "A fire damaged the hot mill process that fed Lucid's entire aluminum supply base. The constraint sat several tiers upstream of vehicle production, above the parts it would eventually starve.",
      'My job was to convert that upstream disruption into exact production exposure, which parts, which suppliers, which build dates, which runout windows, fast enough to act before it became a line down event. The risk was never one supplier or one part. It was a multi tier visibility problem.',
    ],
    callout:
      'The limiter was raw coil, several tiers above the parts it fed. Availability at the mill did not mean parts at the plant.',
  },

  constraints: {
    number: '02',
    label: 'Constraints',
    title: 'The limiter sat above the parts at risk',
    items: [
      { term: 'Depth of the constraint', body: 'The limiter was raw coil, several tiers above the parts that would run out. Coil at the mill still had to become gauge, width, and a stamped part before it protected a build.' },
      { term: 'A moving recovery window', body: 'The recovery estimate kept sliding, 16 weeks to 20, so no single mitigation could be trusted to hold.' },
      { term: 'Fragmented signal', body: 'Updates arrived across calls, emails, and supplier specific files. Each of the 10 nodes reported finished goods, work in process, raw material, and shipment timing differently.' },
      { term: 'Technical gates outside my control', body: 'Specialty grades tied to crash critical structural parts could not be substituted on planning authority alone. Engineering and Quality owned technical release.' },
      { term: 'Cost discipline under pressure', body: 'Premium air freight could protect timing but could not become the default answer. Recovery cost had to be held down while production was protected.' },
    ],
  },

  authority: {
    number: '03',
    label: 'Role and authority',
    title: 'The tracker and the dates were mine; release was not',
    body: [
      'I owned the Clear to Build tracker for the affected scope and the recurring point of contact across the supplier tiers. Mitigations here were recommendation only. I presented them in a recurring global supply management (GSM) review, where they were approved and occasionally escalated to a vice president. A standing premium freight limit in the low five figures governed the day to day calls; anything larger I escalated with the figures behind it.',
    ],
    owned: [
      'The Clear to Build tracker and part level exposure for the affected scope',
      'Cutover dates, and the decision to hold a launch',
      'The single point of contact for Tier 1 and Tier 2 updates',
    ],
    notOwned: [
      'Technical acceptance and substitute material release',
      'Engineering gates on specialty grades',
      'Mitigation approval; my authority here was recommendation only',
    ],
  },

  approach: {
    number: '04',
    label: 'Approach',
    title: 'From raw tonnage to a part level runout date',
    items: [
      { term: 'Standardized supplier reporting', body: "Forced every node's update into one operating format, the least sophisticated thing I did and close to the most useful. Reporting that cannot be compared cannot be prioritized." },
      { term: 'Corrected the system signal', body: 'Cleaned inventory, advanced shipping notice (ASN), and master data errors out of the tracker inputs. Bad data creates false confidence and aims the team at the wrong limiter.' },
      { term: 'Mapped raw material to parts', body: 'Tied grades, gauges, widths, yield assumptions, and supplier conversion timing back to part level demand, so upstream coil read as buildable coverage instead of a raw tonnage number.' },
      { term: 'Expanded runout visibility', body: 'Moved the conversation from "aluminum is constrained" to "this specific part runs out on this date, against this build window, unless this action lands".' },
      { term: 'Ran parallel recovery tracks', body: 'Allocation, alternate mills, coil reallocation, substitute material, expediting, and routing, each evaluated against a physical milestone rather than a supplier promise.' },
      { term: 'Escalated the true limiter', body: 'Routed each gap to the function that could remove it: supplier capacity, logistics, data, or engineering.' },
    ],
  },

  decisions: [
    {
      kind: 'Trade off' as const,
      title: 'Premium freight against the freight budget',
      body: 'Reserved air freight for production critical runout risk only, justified when the tracker showed standard routing would miss the need date, held back when coverage already existed. That narrowed broad air exposure down to targeted premium freight.',
    },
    {
      kind: 'Boundary' as const,
      title: 'Substitute grades held out of coverage',
      body: 'Kept alternate grades (a 6111 series substitute evaluated for a constrained specialty grade, about 40 affected parts, a 3 to 4 week validation window) visible as scenario coverage, but held apart from confirmed usable supply until Engineering and Quality cleared the technical gates. That kept false coverage out of the tracker.',
    },
    {
      kind: 'Method' as const,
      title: 'Recovery counted at the milestone',
      body: 'Tracked recovery by physical milestone: ingot, hot roll, cold roll, finish, Tier 2 receipt, Tier 1 conversion, ship, crossdock, receipt. A supplier commit counted as recovery only once a milestone cleared.',
    },
  ],

  result: {
    number: '05',
    label: 'Result',
    title: 'The signal kept tightening',
    body: [
      'The affected builds kept running through the gap. Availability at the mill did not mean parts at the plant, so the recovery was won by tightening the signal and routing each gap to whoever could remove it. Premium freight stayed the dominant recovery cost throughout.',
    ],
    signalQuality: {
      label: 'Signal quality, measured over the recovery',
      items: [
        '+14% inventory accuracy, by physical count',
        '+20% master data alignment across systems',
        '+30% runout accuracy against actual',
        '+3 to 8 wk forward visibility, Tier 1 and Tier 2',
      ],
      provenance:
        'Movement measured against the pre disruption baseline over the recovery. Exact baselines held to record.',
    },
    systemAccuracy: {
      label: 'System accuracy corrected',
      items: [
        '1,000+ inventory records corrected by physical count',
        '~$350K phantom inventory cleared, in scope',
        'Six figure open shipment and ASN discrepancies reconciled',
        'Twice weekly physical counts on critical parts',
      ],
    },
  },

  lesson:
    'The Tier 2 and Tier 3 sight lines that ran this recovery did not exist when the fire started. Building them mid crisis is the tax for not having had them already. The next disruption is cheaper only if that visibility is standing before it begins. This work ran on the Clear to Build system, the day to day tool behind the recovery.',

  meta: 'A hot mill fire upstream put 240 of 309 aluminum components at risk. How a raw material constraint became part level exposure, and how the recovery ran.',
};
