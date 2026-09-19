/*
  /contact. Source: 04-site-copy-interior.md, Contact. Verbatim.

  No response time is stated anywhere. 04: a commitment that holds is worth more
  than every adjective on the page, and one that is missed is the only broken
  promise a stranger can verify.
*/

import { LINKS, MAILTO } from '../../lib/routes';

export const CONTACT = {
  h1: 'Contact',

  /* Page copy, 33 words. */
  body: "Have a specific question or an interesting opportunity? Tell me what you’re working on. I usually reply within two days, and I’ll give you a clear, honest answer.",

  fields: [
    { name: 'name', label: 'Name', type: 'text', placeholder: '' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com' },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Who you are, what you are building, and what you need',
    },
  ],

  submit: 'Send the message',

  /* Success state, 6 words. No exclamation mark, no Thanks. */
  success: 'Message sent. Expect response within 48 hours',

  errors: {
    email: 'That email address is missing an @. Fix it and send again.',
    message: 'The message field is empty. Add a line and send again.',
    send: `The message didn't send. Email ${LINKS.email} directly and it reaches me either way.`,
  },

  /* Below the form, so a failed endpoint still leaves a path. */
  fallbacks: [
    { label: LINKS.email, href: MAILTO },
    { label: 'LinkedIn', href: LINKS.linkedin },
  ],

  meta: 'How to reach Jackson Barker and what gets an answer. Planning work, the tooling behind it, and anything written on this site. Email is the route.',
} as const;

/*
  Formspree endpoint.

  Not created yet. Paste the form ID from the Formspree dashboard here, the part
  after /f/ in the endpoint they give you, and nothing else changes. Until it is
  set the form does not post: it shows the send failure state, which already
  carries the email address, so the page still works.
*/
export const FORMSPREE_FORM_ID = 'mzezbyrl';

export const formspreeEndpoint = () =>
  FORMSPREE_FORM_ID ? `https://formspree.io/f/${FORMSPREE_FORM_ID}` : null;
