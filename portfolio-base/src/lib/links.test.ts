import { describe, expect, it } from 'vitest';
import { NEW_TAB_HINT, SITE_HOST, cvAction, externalAttrs, externalLinksPlugin, isExternal } from './links';

describe('isExternal', () => {
  it('treats http(s) URLs on another host as external', () => {
    expect(isExternal('https://github.com/yebt')).toBe(true);
    expect(isExternal('http://example.com/a')).toBe(true);
    expect(isExternal('//cdn.example.com/x')).toBe(true);
  });

  it('keeps the site itself, relative paths, anchors, mailto and tel internal', () => {
    expect(isExternal(`https://${SITE_HOST}`)).toBe(false);
    expect(isExternal(`https://www.${SITE_HOST}/projects/`)).toBe(false);
    expect(isExternal('/projects/')).toBe(false);
    expect(isExternal('#work')).toBe(false);
    expect(isExternal('mailto:someone@example.com')).toBe(false);
    expect(isExternal('tel:+570000000')).toBe(false);
  });

  it('is not fooled by a host that merely ends with the site name', () => {
    expect(isExternal(`https://not${SITE_HOST}`)).toBe(true);
  });

  it('ignores letter case in scheme and host', () => {
    expect(isExternal(`HTTPS://${SITE_HOST.toUpperCase()}/x`)).toBe(false);
    expect(isExternal('HTTPS://GitHub.com')).toBe(true);
  });
});

describe('externalAttrs', () => {
  it('opens external links in a new tab without leaking the opener or referrer', () => {
    expect(externalAttrs('https://github.com/yebt')).toEqual({ target: '_blank', rel: 'noopener noreferrer' });
  });

  it('keeps an existing rel value first', () => {
    expect(externalAttrs('https://github.com/yebt', 'me')).toEqual({ target: '_blank', rel: 'me noopener noreferrer' });
  });

  it('does not repeat rel tokens that are already present', () => {
    expect(externalAttrs('https://github.com/yebt', 'noopener noreferrer')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('returns only the given rel for internal links', () => {
    expect(externalAttrs('/projects/')).toEqual({});
    expect(externalAttrs('mailto:a@b.c', 'me')).toEqual({ rel: 'me' });
  });
});

describe('cvAction', () => {
  const linkedin = 'https://www.linkedin.com/in/someone/';

  it('downloads the PDF when it exists', () => {
    expect(cvAction(true, linkedin)).toEqual({ label: 'Download CV', href: '/cv.pdf', download: true });
  });

  it('falls back to the LinkedIn profile in a new tab when the PDF is missing', () => {
    expect(cvAction(false, linkedin)).toEqual({
      label: 'CV on LinkedIn',
      href: linkedin,
      target: '_blank',
      rel: 'noopener noreferrer',
      hint: NEW_TAB_HINT,
    });
  });
});

describe('externalLinksPlugin (Markdown, hast)', () => {
  /** Records the mutations the plugin asks the processor for. */
  const run = (href: string) => {
    const node = { type: 'element', tagName: 'a', properties: { href }, children: [] };
    const calls: Array<[string, unknown, unknown?]> = [];
    const ctx = {
      setProperty: (_n: unknown, key: string, value: unknown) => calls.push(['set', key, value]),
      appendChild: (_n: unknown, child: unknown) => calls.push(['append', child]),
    };
    externalLinksPlugin.element.visit(node as never, ctx as never);
    return calls;
  };

  it('only visits anchors', () => {
    expect(externalLinksPlugin.element.filter).toEqual(['a']);
  });

  it('adds target, rel and a visually hidden new-tab hint to external links', () => {
    const calls = run('https://example.com');
    expect(calls).toContainEqual(['set', 'target', '_blank']);
    expect(calls).toContainEqual(['set', 'rel', ['noopener', 'noreferrer']]);
    const [, hint] = calls.find(([op]) => op === 'append') as [string, any];
    expect(hint.properties.className).toEqual(['sr-only']);
    expect(hint.children[0].value).toBe(` ${NEW_TAB_HINT}`);
  });

  it('leaves internal links, anchors and mailto untouched', () => {
    expect(run('/garden/')).toEqual([]);
    expect(run('#top')).toEqual([]);
    expect(run('mailto:a@b.c')).toEqual([]);
  });
});
