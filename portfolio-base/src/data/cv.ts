/**
 * The CV: single source of truth for the /cv page, its PDF (`npm run cv:pdf`),
 * the home experience module and the Person JSON-LD.
 *
 * Every fact comes from the owner's CV document; the wording is rewritten for
 * clarity and ATS parsing, never extended with new employers, titles, dates,
 * metrics or technologies. Durations and years are computed at build time
 * from the month ranges below (see `src/lib/cv.ts` for the rules).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cvAction } from '../lib/links';
import {
  experienceMonths,
  formatDuration,
  formatRange,
  roleMonths,
  yearsLabel,
  type Period,
  type YearMonth,
} from '../lib/cv';
import { site } from './site';

/** The CV action, resolved at build time: the PDF when `public/cv.pdf` exists, otherwise LinkedIn. */
export const cv = cvAction(existsSync(join(process.cwd(), 'public', site.cv)), site.linkedin, site.cv);

/** The web version of the CV. */
export const cvPage = '/cv/';

export interface Role extends Period {
  title: string;
  organization: string;
  location: string;
  /** Software roles count towards years of experience; teaching does not. */
  software: boolean;
  /** One line on the scope of the role. */
  scope: string;
  highlights: string[];
  /** Indexes into `highlights` for the short home timeline (2–3). */
  featured: number[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Education {
  program: string;
  institution: string;
  location: string;
  start: YearMonth;
  end: YearMonth;
}

export interface Course {
  name: string;
  provider: string;
  date: string;
}

export interface Language {
  name: string;
  level: string;
}

const LOCATION = 'Tuluá, Valle del Cauca, Colombia';

export const basics = {
  name: 'Yahir Eduardo Bravo Tafur',
  /** The current job and the focus of the work; not a claimed job title. */
  headline: 'Lead Developer · Software Architecture & Technical Leadership',
  target: 'Open to software architecture roles',
  location: LOCATION,
  email: site.emailLabel,
  linkedin: site.linkedin,
  github: site.github,
  website: 'https://yebt.dev',
} as const;

export const experience: Role[] = [
  {
    title: 'Lead Developer',
    organization: 'Webcloster SAS',
    location: LOCATION,
    start: '2024-10',
    software: true,
    scope:
      'Technical lead of a team of 3 developers (1 on-site, 2 remote) and technical reference for solution design across the company’s web products.',
    highlights: [
      'Design and implement front-end and back-end solutions across several products (e-commerce, CRM, linking system), balancing scalability, maintainability and delivery speed.',
      'Cut page load time from ~4 s to ~1.1 s through front-end optimization, template refactoring and a caching strategy.',
      'Own the deployment and code review processes (merge requests); custom deployment scripts cut deploy time from 30 to 5 minutes, enabling faster release cycles.',
      'Set up production error alerting by integrating Sentry with Telegram, improving error visibility and the team’s incident response.',
      'Containerized the application setup with Docker, significantly reducing onboarding time for new developers.',
      'Built internal tools for cross-database record validation and automation, reducing manual effort and data errors.',
      'Shape and negotiate requirements with stakeholders and the product area; run requirement walkthroughs and system overviews that improved task clarity and delivery speed.',
      'Promote code reviews and shared documentation, and work with QA to raise test coverage, catch defects earlier and improve delivery quality.',
      'Drive workflow improvements: task automation with in-house services and SQL query optimization.',
      'Improved SEO and Lighthouse scores on key landing pages through component rewrites and performance audits.',
    ],
    featured: [1, 2, 3],
  },
  {
    title: 'Junior Developer',
    organization: 'Webcloster SAS',
    location: LOCATION,
    start: '2022-11',
    end: '2024-11',
    software: true,
    scope:
      'Development, support and maintenance of web applications, from requirements gathering with stakeholders to deployment.',
    highlights: [
      'Contributed to an e-commerce platform, an order management system, a biographical data system, authentication services and event control modules.',
      'Integrated Sentry for error monitoring, enabling faster detection and resolution of runtime errors.',
      'Introduced unit and integration tests across critical components and ran QA checks before each release.',
      'Improved data integrity by debugging and resolving key issues in the authentication and order management systems.',
      'Dockerized application environments, reducing setup and onboarding time.',
      'Gathered and clarified requirements with stakeholders; fixed defects across front end and back end and deployed updates with minimal downtime.',
      'Contributed to performance and usability improvements in the e-commerce and event platforms.',
    ],
    featured: [0, 1, 2],
  },
  {
    title: 'Private Tutor, Mathematics and Programming',
    organization: 'Universidad del Valle',
    location: LOCATION,
    start: '2020-11',
    end: '2022-11',
    software: false,
    scope: 'Private tutoring in basic mathematics and programming.',
    highlights: ['Taught basic mathematics and programming in C++ and Scheme.'],
    featured: [0],
  },
];

export const skills: SkillGroup[] = [
  { name: 'Back end', items: ['PHP (Laravel, Slim)'] },
  { name: 'Front end', items: ['JavaScript (Vanilla, Vue.js, Astro)', 'HTML', 'CSS (Tailwind CSS, Bootstrap)'] },
  { name: 'Databases', items: ['MySQL', 'PostgreSQL', 'SQLite', 'SQL query optimization'] },
  { name: 'Runtimes', items: ['Node.js', 'Bun'] },
  { name: 'Scripting and automation', items: ['Bash', 'Python', 'Lua', 'Make'] },
  { name: 'Infrastructure and tooling', items: ['Docker', 'Linux', 'Git (GitHub, GitLab)', 'Sentry'] },
  {
    name: 'Architecture and design',
    items: [
      'Solution design',
      'Clean and hexagonal architecture',
      'Domain modeling',
      'Design systems (atomic design, container–presentational components)',
      'Performance and caching strategy',
      'Observability and error alerting',
    ],
  },
  {
    name: 'Engineering practice',
    items: [
      'Technical leadership',
      'Code review (merge requests)',
      'Unit and integration testing',
      'Deployment automation',
      'Requirements analysis with stakeholders',
    ],
  },
];

export const education: Education[] = [
  {
    program: 'Systems Engineering',
    institution: 'Universidad del Valle',
    location: LOCATION,
    start: '2017-01',
    end: '2022-12',
  },
];

export const courses: Course[] = [
  { name: 'JavaScript (intermediate), Vue.js and Astro', provider: 'Platzi', date: '2023' },
  { name: 'Laravel', provider: 'Udemy', date: '2022' },
  { name: 'PHP', provider: 'Udemy and Platzi', date: '2021–2022' },
];

export const languages: Language[] = [
  { name: 'Spanish', level: 'Native' },
  { name: 'English', level: 'Intermediate (B1)' },
];

/** The build date: "Present" and every computed duration run up to this month. */
export const asOf = new Date();

/** Professional software experience, overlapping months counted once. */
export const experienceTotal = experienceMonths(
  experience.filter((role) => role.software),
  asOf,
);
export const experienceYears = yearsLabel(experienceTotal);

export const summary = `Software engineer with ${experienceYears} of professional experience designing and building web systems. As Lead Developer at Webcloster SAS I lead a team of three developers and act as the technical reference for solution design across e-commerce, CRM and linking systems, weighing scalability, maintainability and delivery speed. I own the deployment process, production error alerting and the code review process, and I shape requirements with stakeholders before they become code. I value clear boundaries, tested code and open communication, and I am looking for software architecture roles.`;

/** A role with its display strings computed. */
export function describeRole(role: Role) {
  return {
    ...role,
    range: formatRange(role),
    duration: formatDuration(roleMonths(role, asOf)),
  };
}

export const roles = experience.map(describeRole);
export const currentRole = roles.find((role) => !role.end);
