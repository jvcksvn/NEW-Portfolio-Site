/*
  Case 03. Source: Projects/Kit Backlog/Site Copy - Kit Backlog.md, with layout
  from its design spec.

  Dash fixes, mechanical only: 18 em dash characters, most joining a heading or a
  bullet term to its body and now separate fields. No hyphenated compounds in
  this document. Its two figure descriptions carry arrows and slashes, which the
  figures render as structure rather than as characters.
*/

export const CASE_03 = {
  slug: 'kit-backlog',
  number: '03',
  tint: 'graphite' as const,
  tag: 'Case 03, Customer fulfillment',
  title: 'A two year backlog closed in four months',

  deck: "Roughly 100 customers who had paid quarter million dollar prices for Lucid's flagship were missing their wheel trim kits. Some had waited up to two years. I took over a stalled backlog, closed it in about four months, and redesigned the process so it could not recur.",

  stats: [
    { value: '~100', label: 'delivered vehicles missing kits' },
    { value: '2 yr', label: 'longest wait, closed in ~4 months' },
    { value: '8 and 4', label: 'components per kit across 4 suppliers' },
    { value: '0', label: 'recurrence, failure mode designed out' },
  ],

  context: {
    number: '01',
    label: 'Context',
    title: 'A two year old promise is still a promise',
    body: [
      "The kits are accessory parts, not required for the car to run, but customers who paid flagship prices had been waiting as long as two years for them. When I took the project over, effectively no one was working it. It wasn't the visible, high status assignment.",
      'I took it because the promise was two years old and still open.',
    ],
  },

  constraints: {
    number: '02',
    label: 'Constraints',
    title: 'The suppliers had stopped making the part',
    items: [
      { term: 'Low runner supply', body: 'The flagship is a very low volume luxury vehicle, so suppliers had long stopped producing these parts. Restarting production for small quantities is a hard ask.' },
      { term: 'A fragmented kit', body: 'Eight components across four suppliers, plus a separate assembly step, and no single owner controlled the whole flow.' },
      { term: 'An active leak', body: 'Vehicles were still shipping without kits, so the backlog was compounding while I worked it.' },
      { term: 'Off line assembly', body: "The kits aren't fitted on the production line; closing them required standing up a separate assembly path and direct to customer shipping." },
    ],
  },

  authority: {
    number: '03',
    label: 'Role and authority',
    title: 'Owned end to end, run across five functions',
    body: [
      'I owned the project end to end once I took it over, from stopping the leak to closing the backlog to redesigning the process. It ran through Manufacturing and Compliance for gate control, the commercial team for POs, Engineering for assembly work instructions, Logistics for direct to customer shipping, and the suppliers directly on restart and terms.',
      'Negotiated the supplier restarts, including net zero payment terms accepted at the most difficult supplier, using the lower priced next generation volume ramp as positioning.',
    ],
    /*
      This case's source document states responsibilities in prose and does not
      carry an "I owned" and "I did not own" split. 02 section 6 lists the
      authority split as a component, not as a required section, so it is omitted
      here rather than invented. Reported.
    */
    owned: null,
    notOwned: null,
  },

  approach: {
    number: '04',
    label: 'Approach',
    title: 'Stop the leak, then close the backlog',
    items: [
      { term: 'Stopped the leak first', body: 'Worked with Manufacturing and Compliance to add a control point so no future vehicle could be factory gated without its kit. Order the car now and the kit ships with it, so the backlog could no longer grow.' },
      { term: 'Restarted supply', body: 'Got four suppliers to restart production of a low runner part, working the commercial team to issue the POs and accepting net zero terms where needed to unstick the hardest supplier.' },
      { term: 'Closed the open backlog', body: 'Once material landed, worked Engineering on assembly work instructions and Logistics on shipping completed kits directly to the ~100 affected customers.' },
      { term: 'Designed the failure mode out', body: "The US based maker of the kit's foam packaging became the consolidation point. Rather than routing all eight components through a standalone task force to be kitted internally, I moved kitting to that supplier. They now supply completed kits." },
    ],
  },

  result: {
    number: '05',
    label: 'Result',
    title: 'Backlog closed, and the leak designed out',
    body: [
      'A two year old promise is still a promise, and the backlog is closed: about 100 customers made whole in roughly four months, with the failure mode removed behind them. The earliest of those customers had still waited close to two years before anything moved.',
    ],
    items: [
      '~4 mo to close a two year backlog',
      '~100 customers made whole',
      'Gate control prevents the leak recurring',
      'Kitted supplier side, internal assembly removed',
    ],
  },

  lesson:
    'The consolidation supplier already touched every kit; moving the kitting there turned a standing task force into a line on a purchase order. The question that got there was the plain one, asked early: what would this look like if it were easy?',

  meta: 'Roughly 100 flagship customers were missing wheel trim kits, some for two years. How the backlog closed in four months and the failure mode was designed out.',
};
