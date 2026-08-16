/**
 * Site-wide constants. Everything a reader would call "who is this and where do I
 * find them" lives here, so updating identity never means grepping components.
 */

export const SITE_TITLE = 'Vince Caldwell';
export const SITE_TAGLINE = 'Senior Software Engineer';
export const SITE_DESCRIPTION =
  // TODO: replace with your own one-sentence positioning statement.
  'Senior software engineer building reliable, well-crafted systems — and the tools that make them easier to run.';

export const AUTHOR = {
  name: 'Vince Caldwell',
  // TODO: replace with your actual job title / current role.
  jobTitle: 'Senior Software Engineer',
  email: 'vcaldwel8@yahoo.com',
  // TODO: replace with your city, or delete if you would rather not list it.
  location: 'TODO: City, State',
} as const;

/** Absolute path (from site root) of the generated resume PDF. */
export const RESUME_PDF_PATH = '/vince-caldwell-resume.pdf';

export type SocialLink = {
  label: string;
  href: string;
  /** Key into the Icon component's sprite map. */
  icon: 'github' | 'linkedin' | 'mail' | 'rss';
  /** Shown in the footer; false = footer-only utility link. */
  primary?: boolean;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/vincecaldwell',
    icon: 'github',
    primary: true,
  },
  {
    label: 'LinkedIn',
    // TODO: replace with your real LinkedIn profile URL.
    href: 'https://www.linkedin.com/in/TODO',
    icon: 'linkedin',
    primary: true,
  },
  {
    label: 'Email',
    href: `mailto:${AUTHOR.email}`,
    icon: 'mail',
    primary: true,
  },
];

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation. /blog/ is deliberately absent — the section is built and
 * reachable by URL and RSS, but stays out of the nav until there is a real post
 * worth sending people to. Add it here when that happens.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Projects', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Resume', href: '/resume/' },
  { label: 'Contact', href: '/contact/' },
];
