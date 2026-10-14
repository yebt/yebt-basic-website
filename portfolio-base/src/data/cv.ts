/**
 * The CV action, resolved at build time: the PDF in `public/` when it exists,
 * otherwise the LinkedIn profile, so "Download CV" never leads to a 404.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cvAction } from '../lib/links';
import { site } from './site';

export const cv = cvAction(existsSync(join(process.cwd(), 'public', site.cv)), site.linkedin, site.cv);
