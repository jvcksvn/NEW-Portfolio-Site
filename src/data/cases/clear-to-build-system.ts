/*
  Case 02. Source: Projects/The Clear-To-Build System/Site Copy - Clear-To-Build
  System.md, with layout from its design spec.

  Dash fixes, mechanical only: 28 em dash characters, most joining a heading or a
  bullet term to its body and now separate fields; Clear-To-Build and
  CLEAR-TO-BUILD written open per 04's naming note; Tier-2 written open;
  Z-transactions written open. The "SQL / joins" and "T1 FG/WIP" slashes are the
  document's own and appear inside the figure descriptions it wrote.
*/

export const CASE_02 = {
  slug: 'clear-to-build-system',
  number: '02',
  tint: 'blue' as const,
  tag: 'Case 02, Launch planning',
  title: 'The Clear to Build system, 200 cutovers',

  deck: 'One operating view that collapses fragmented supply signals into what will actually run out, when, and what to do about it. SAP to SQL to Excel and VBA to Tableau. I built it end to end at Lucid, and it still runs in production after my departure.',

  stats: [
    { value: '~200', label: 'cutovers executed, counted in parts' },
    { value: '250+', label: 'concurrent parts, ~50 changes at peak' },
    { value: '35+', label: 'suppliers fused into one view' },
    { value: 'Live', label: 'in production use after departure' },
  ],

  context: {
    number: '01',
    label: 'Context',
    title: 'MRP gave the system view, not the truth',
    body: [
      'Launch planning meant moving hundreds of parts from an old revision to a new one without stopping the line, while the underlying system data was never fully clean. MRP could not separate supply that existed on paper from supply that was physically there and usable.',
      'The Clear to Build system was my answer: a single view that fuses MRP, supplier commits, carrier ETAs, crossdock status, Tier 2 raw material, physical counts, and production demand into one part level readiness picture.',
    ],
  },

  constraints: {
    number: '02',
    label: 'Constraints',
    title: 'Every feed drifts, and none is the truth alone',
    items: [
      { term: 'The data lies', body: 'System inventory, advanced shipping notices (ASNs), and master data all drift. A tool that trusts them produces false confidence and aims people at the wrong limiter.' },
      { term: 'Signal arrives in fragments', body: 'Supplier, carrier, warehouse, and production data live in different systems and formats. Any one feed on its own misleads; the readiness picture exists only once they are joined.' },
      { term: 'Confidence is not binary', body: 'Received supply, in transit, supplier commits, technically pending substitutes, and scenario material each deserve different weight. A tool that flattens them is wrong even when every cell is populated.' },
      { term: 'A tool is only useful if it changes a decision', body: 'A dashboard that reports status without forcing the next action is overhead.' },
    ],
  },

  authority: {
    number: '03',
    label: 'Role and authority',
    title: 'The stack was mine; release stayed with engineering',
    body: [
      'The data model, the automation, and the dashboard were mine. Cutover dates and the call to hold a launch were mine; the mitigation paths the tool surfaced went to review as recommendations. The system made technical approval timing visible as a gate. It never approved anything.',
    ],
    owned: [
      'The full stack: data model, VBA automation, Tableau view',
      'Cutover dates, and the authority to hold a launch',
      'The recommendation on every mitigation path it surfaced',
    ],
    notOwned: [
      'Technical acceptance and engineering release',
      'Approval of substitute material; the tool showed the gate, it did not open it',
    ],
  },

  build: {
    number: '04',
    label: 'How it is built',
    title: 'SAP to Tableau, and the logic under it',
    layers: [
      { tag: 'SAP', name: 'S/4HANA, the transactional core', body: 'Working set: MD04, MB52, MB51, VL06I, ME2M, the Inbound Delivery Dashboard, Warehouse Monitor, and COGI. No custom Z transactions.' },
      { tag: 'SQL', name: 'Redshift, mirrored for speed', body: "SAP data queried directly for the joins the SAP screens can't do cheaply." },
      { tag: 'XL', name: 'Excel and VBA, the assembly layer', body: 'XLOOKUP architecture under the core files, plus a crossdock cleanup macro that reconciles inbound against ASN.' },
      { tag: 'TAB', name: 'Tableau, the shared view', body: 'The presentation layer and single operating picture for cross functional teams.' },
    ],
    logicLabel: 'Design logic, the part that matters',
    logic: [
      { term: 'One operating view, built for a decision', body: 'Fuse system, supplier, carrier, warehouse, and demand signals into a single part level readiness picture.' },
      { term: 'Separate confirmed from assumed supply', body: 'Received, usable supply is visibly distinct from committed, in transit, technically pending, and scenario supply. This is the core idea. It keeps the tracker from mixing reality with optimism.' },
      { term: 'Time phase against demand', body: 'Tie usable supply to the exact runout point against the build window, rather than to a days of supply average.' },
      { term: 'Attach a decision to every number', body: 'Each at risk part carries a status, runout date, risk level, mitigation owner, and next action. The number arrives with the decision it forces.' },
    ],
  },

  confidence: {
    label: 'How supply enters the model',
    title: 'Confidence tiers, weighted differently',
    body: 'Every supply position enters the model at a confidence level. Received and usable supply anchors the picture; scenario material stays visible and is never counted as coverage.',
    tiers: [
      { term: 'Received and usable', body: 'Physically on site and buildable' },
      { term: 'In transit', body: 'Shipped and tracked to a real ETA' },
      { term: 'Committed', body: 'Supplier promise, not yet moving' },
      { term: 'Technically pending', body: 'Awaiting engineering and quality release' },
      { term: 'Scenario', body: 'Modeled coverage, visible and never counted' },
    ],
  },

  result: {
    number: '05',
    label: 'Result',
    title: 'Earlier risk detection, fewer panic escalations',
    body: [
      'MRP gave the system view, not the truth, and closing that gap is what the system did every day. Cleaner signal, earlier risk detection, more precise mitigation, fewer panic driven escalations. It ran as the operating engine through the Tier 3 aluminum disruption; Case 01 carries the stress test outcomes it produced.',
    ],
    items: [
      '~200 cutovers executed across the role',
      '1,000+ inventory records corrected by physical count',
      '~$350K phantom inventory cleared, disruption scope',
      'Live in production after departure',
    ],
  },

  note: 'Runs alongside two related artifacts I built and left behind: the Total Inventory File (Excel, with the crossdock cleanup macro) and the engineering change dashboard (Smartsheet).',

  meta: 'One operating view fusing seven supply signals into part level readiness. Built end to end at an electric vehicle plant, still in production after departure.',
};
