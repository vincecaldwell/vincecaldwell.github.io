import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/**
 * Featured first, then by explicit `order`, then most recent first.
 * Ties break on title so the build output is stable.
 */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.data.featured !== b.data.featured) {
      return a.data.featured ? -1 : 1;
    }

    if (a.data.order !== b.data.order) {
      return a.data.order - b.data.order;
    }

    const aStart = a.data.timeframe.start.getTime();
    const bStart = b.data.timeframe.start.getTime();
    if (aStart !== bStart) {
      return bStart - aStart;
    }

    return a.data.title.localeCompare(b.data.title);
  });
}

/**
 * All publishable projects, sorted. Drafts are excluded from production builds
 * but kept visible during `astro dev` so work in progress is previewable.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getCollection(
    'projects',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return sortProjects(projects);
}

const STATUS_LABELS: Record<Project['data']['status'], string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
  concept: 'Concept',
};

/** Status always carries a text label — never colour alone. */
export function statusLabel(status: Project['data']['status']): string {
  return STATUS_LABELS[status];
}

/** e.g. "2024 — Present", "2022 — 2023", "2023" */
export function formatTimeframe(timeframe: Project['data']['timeframe']): string {
  const year = (date: Date) => String(date.getUTCFullYear());
  const start = year(timeframe.start);

  if (!timeframe.end) return `${start} — Present`;

  const end = year(timeframe.end);
  return start === end ? start : `${start} — ${end}`;
}
