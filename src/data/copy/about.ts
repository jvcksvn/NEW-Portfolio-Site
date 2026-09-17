/*
  /about and the resume's About tab. Source: 09-about.md, version 3.

  09 is explicit that site-copy-style_1.md does not govern this page. It opens
  with a greeting and uses the second person, both of which the guide bans
  elsewhere. That is the point: it is the one page written to sound like a
  person rather than a record.

  One rule still applies because it is enforced at build: no dashes of any kind.

  Version 4: two bodies, one carousel. The resume's About tab carries the short
  five paragraph body; /about carries the long one with its three headings. The
  two are separate constants and the component takes one as a prop, because a
  single shared constant is what let the short version reach both places.

  The headshot above the body and the collage below it are both gone, replaced
  by one photo rail. Nothing brackets on this page: the long body states its
  client figure outright.

  Both bodies run the full width of the section, not the 720px reading column.
*/

/*
  The shape of a body. Declared here rather than in the component, because the
  data is what defines it and the component consumes it; the other direction
  would have a client bundled data module importing from an .astro file.
*/
export interface AboutBodyCopy {
  paragraphs?: readonly string[];
  sections?: ReadonlyArray<{ heading: string; paragraphs: readonly string[] }>;
}

export const ABOUT = {
  h1: 'About',
  meta: 'Jackson Barker, a supply chain planner in Denver. A year at Lucid Motors getting new parts to the factory when they were needed, and what he is looking for next.',
} as const;

/*
  The short body. 09 version 3, five paragraphs, no headers. This is the
  resume's About tab, and it is correct there.
*/
export const ABOUT_BODY_SHORT = {
  paragraphs: [
    "Hi, I'm Jackson. I'm a supply chain planner based in Denver, and most of my work comes down to getting new parts to the factory when they're needed.",
    "My path here was a little roundabout. In college I grew a few social media accounts and used them to sell products of my own, where I learned that getting products to people is a lot harder than getting people interested. After some growth consulting, I landed an internship at Lucid Motors that turned into a full time role as a Production Planner II, moving a couple hundred parts from old versions to new ones on their electric cars.",
    'I like to start with the data, then go talk to the people behind it. I also like building simple tools and improving them as they break.',
    "I'm early in my career, and as of September 2026 I'm looking for my next role. If you're getting physical products into production, or hiring for planning or supply chain roles, I'd like to hear from you.",
    'Email works. Specific questions get specific answers, usually within two days.',
  ],
} as const;

/*
  The long body, for /about only. 09 version 4, supplied in full and taken
  verbatim: an opening paragraph, then three bolded headings rendered as the
  section headings they are. Extracted from the specification rather than
  retyped, so "verbatim" is a fact about the file rather than a claim.

  Verified on the extracted strings before they were written here: no em or en
  dash, no hyphen, and no character outside ASCII, so every apostrophe is the
  straight one the rest of the site uses.

  Note the figure. This body says growth consulting for around 18 brands, while
  the resume's stat card says 15 Clients Supported and its Digital Growth
  summary says serving 15 clients. Different pages, so the one figure per page
  rule holds, and eighteen brands across fifteen clients is a coherent reading.
  Both numbers are the author's. Reported, not reconciled.
*/
export const ABOUT_BODY_LONG: AboutBodyCopy = {
  /* The opening paragraph sits above the first heading. */
  paragraphs: [
    "Hi, I'm Jackson. I'm a supply chain planner based in Denver, and most of my work comes down to getting new parts to the factory when they're needed. I spent the last year doing that at Lucid Motors, on the team that handles parts for new launches and design changes on their electric cars.",
  ],

  sections: [
    {
      heading: "What I've done",
      paragraphs: [
        'My path here was a little roundabout. In college I started building social media accounts, and they grew a lot bigger than I expected. I used that audience to sell a few products of my own, which meant working with suppliers, sorting out packaging, and figuring out shipping. Getting products to people turned out to be a lot harder than getting people interested in them, and that part stuck with me.',
        'After that I did growth consulting for around 18 brands, with a small team overseas. Over time I got more curious about the operations side than the marketing side.',
        "That curiosity led to an internship at Lucid. I spent a lot of time in SAP data looking for places where forecasts, supplier plans, and inventory didn't line up, and a few of those turned into cost recovery from suppliers. The internship became a full time job as a Production Planner II. I helped move a couple hundred parts from old versions to new ones with minimal disruption to the line, and built a few tracking tools to spot shortages earlier. I also graduated from Arizona State this year with degrees in Computer Information Systems and Supply Chain Management.",
      ],
    },
    {
      heading: 'How I work',
      paragraphs: [
        'I like to start with the data, then go talk to the people behind it. A report can show that a part is short, but it usually takes a buyer, a supplier, or someone on the floor to explain why. I learned more at Lucid from sitting with planners and engineers than from any system.',
        'I also like building simple tools and improving them as they break. My first Clear to Build tracker was a spreadsheet I updated by hand every morning. It went through a few versions before other people could rely on it.',
      ],
    },
    {
      heading: 'Who I am and who should reach out',
      paragraphs: [
        'Outside of work I read a lot, mostly business and psychology, and I write about supply chain on this site to help me think things through.',
        "I'm early in my career, with one year of formal planning at one company, and as of September 2026 I'm looking for my next role. If you're getting physical products into production, or hiring for planning or supply chain roles, I'd like to hear from you.",
        'Email works. Specific questions get specific answers, usually within two days. If you are working on something worth building, say what it is. If not, the answer will be short and honest.',
      ],
    },
  ],
};

/*
  The OG description on every route sitewide and the LinkedIn About opener.
  Compressed from the opening sentence. Exactly 25 words. 09 version 4 leaves
  this unchanged.
*/
export const ABOUT_25_WORDS =
  "I'm a supply chain planner in Denver. I spent the last year at Lucid Motors getting new parts to the factory when they were needed.";

export const PHOTO_ALT = {
  newGradHeadshot:
    'Jackson in a maroon graduation cap and gown with a gold stole and honour cords, smiling in a packed arena',
  packagingPhoto:
    'Jackson carrying a stack of kraft paper mailers down a hallway, an order ready to ship',
  professionalHeadshot:
    'Jackson in a black crew neck sweater, arms folded, against a plain grey studio backdrop',
  lucidDealership:
    'A deep red Lucid sedan under showroom lighting, the Lucid wordmark on the stone wall behind it',
  funGradPhoto:
    'Jackson in a maroon cap and gown with a gold stole, standing with five family members under a tree at night after the Arizona State ceremony',
  funImage:
    'Jackson holding a black umbrella on a rainy New York street corner, wet pavement and traffic behind him',
  dogImage:
    'Jackson in a grey fur lined trapper hat and a puffer jacket outdoors under a clear sky, holding a small white chihuahua against his chest',
} as const;

/*
  09's fixed order, as keys into ABOUT_IMAGES and PHOTO_ALT. Keys rather than
  resolved images because this module is imported by the resume island, which
  is client bundled: importing the image metadata here would ship seven
  processed images into that bundle for the sake of five paragraphs of text.
  PhotoRail.astro resolves them on the server.
*/
export const PHOTO_ORDER = [
  'newGradHeadshot',
  'packagingPhoto',
  'professionalHeadshot',
  'lucidDealership',
  'funGradPhoto',
  'funImage',
  'dogImage',
] as const;

export const PHOTO_CAROUSEL_OPENS_ON = 3;
