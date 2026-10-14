/**
 * Link rules: external resources open in a new tab (without leaking the
 * opener or the referrer) and say so to assistive tech; the site itself,
 * relative paths, anchors, mailto and tel stay in place.
 * Pure: no DOM or file system, so every rule is unit-testable.
 */

/** The site's own host; any subdomain of it counts as internal too. */
export const SITE_HOST = 'yebt.dev';

/** Visually hidden suffix for links that open a new tab. */
export const NEW_TAB_HINT = '(opens in a new tab)';

const NEW_TAB_REL = 'noopener noreferrer';

/** True for an http(s) or protocol-relative URL on a host other than the site's. */
export function isExternal(href: string, siteHost: string = SITE_HOST): boolean {
  const match = /^(?:https?:)?\/\/([^/?#:]+)/i.exec(href.trim());
  if (!match) return false;
  const host = match[1].toLowerCase();
  const own = siteHost.toLowerCase();
  return host !== own && !host.endsWith(`.${own}`);
}

/** `target`/`rel` for an anchor; an existing `rel` (e.g. `me`) is kept first. */
export function externalAttrs(href: string, rel?: string): { target?: string; rel?: string } {
  if (!isExternal(href)) return rel ? { rel } : {};
  const tokens = new Set([...(rel ?? '').split(/\s+/).filter(Boolean), ...NEW_TAB_REL.split(' ')]);
  return { target: '_blank', rel: [...tokens].join(' ') };
}

export interface CvAction {
  label: string;
  href: string;
  download?: boolean;
  target?: string;
  rel?: string;
  hint?: string;
}

/**
 * The CV action: the PDF when `public/cv.pdf` exists, otherwise the LinkedIn
 * profile in a new tab, so the action never leads to a 404.
 */
export function cvAction(pdfExists: boolean, linkedin: string, pdfHref = '/cv.pdf'): CvAction {
  if (pdfExists) return { label: 'Download CV', href: pdfHref, download: true };
  return { label: 'CV on LinkedIn', href: linkedin, ...externalAttrs(linkedin), hint: NEW_TAB_HINT };
}

/** Just the parts of a Sätteri hast node and visitor context the plugin uses. */
interface HastAnchor {
  properties?: Record<string, unknown>;
}
interface HastContext {
  setProperty(node: HastAnchor, key: string, value: unknown): void;
  appendChild(node: HastAnchor, child: unknown): void;
}

/**
 * Sätteri hast plugin for Markdown content (astro.config.mjs): external links
 * get target/rel and a visually hidden "(opens in a new tab)" hint.
 */
export const externalLinksPlugin = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node: HastAnchor, ctx: HastContext) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !isExternal(href)) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', NEW_TAB_REL.split(' '));
      ctx.appendChild(node, {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sr-only'] },
        children: [{ type: 'text', value: ` ${NEW_TAB_HINT}` }],
      });
    },
  },
};
