// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/*
  Every content file opens with an h1 that repeats its own title, and the entry
  template already renders that title as the page h1. Two h1 elements on one
  document is a heading structure defect, so the body's leading h1 is removed
  here rather than hidden with CSS, which left it in the accessibility tree.
*/
function stripLeadingH1() {
  /** @param {any} tree */
  return (tree) => {
    const index = tree.children.findIndex(
      /** @param {any} node */
      (node) => node.type === 'element' && /^h[1-6]$/.test(node.tagName),
    );
    if (index !== -1 && tree.children[index].tagName === 'h1') {
      tree.children.splice(index, 1);
    }
  };
}

/*
  Preact with compat, not React.

  The interactive resume is the only island on the site. React shipped 208 KB to
  run a tab shell; preact/compat serves the same hook based components from a
  fraction of that. `compat: true` aliases react and react-dom to preact/compat,
  so the components keep importing React names and nothing in src changes.
*/
export default defineConfig({
  site: 'https://jacksonbarker.com',
  trailingSlash: 'never',
  integrations: [preact({ compat: true }), mdx(), sitemap()],

  build: {
    /*
      Directory format: dist/index.html, dist/projects/index.html, and so on.

      'file' emitted dist/projects.html, which needs Vercel's cleanUrls to serve
      at /projects, and with cleanUrls on, the root index.html stopped resolving
      at / and served the 404 page. Directory format is what a static host
      expects by default, so no rewrite or cleanUrls rule is needed at all.
    */
    format: 'directory',
  },

  markdown: {
    rehypePlugins: [stripLeadingH1],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
