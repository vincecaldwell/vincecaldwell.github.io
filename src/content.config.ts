import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
// Zod comes from 'astro/zod', not 'astro:content' — that re-export was deprecated
// in Astro 6. This is Zod 4, so prefer the flat helpers (z.url(), not
// z.string().url()).
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        /** One or two lines. Used on cards and as the page meta description. */
        summary: z.string().max(200),
        stack: z.array(z.string()).min(1),
        role: z.string(),
        timeframe: z.object({
          start: z.coerce.date(),
          /** null means ongoing. */
          end: z.coerce.date().nullable().default(null),
        }),
        repoUrl: z.url().optional(),
        liveUrl: z.url().optional(),
        /** Surfaced on the home page. */
        featured: z.boolean().default(false),
        /** Lower sorts first within the featured/non-featured groups. */
        order: z.number().int().default(999),
        cover: image().optional(),
        coverAlt: z.string().default(''),
        status: z
          .enum(['shipped', 'in-progress', 'archived', 'concept'])
          .default('shipped'),
        draft: z.boolean().default(false),
      })
      // Alt text is enforced at build time rather than left to review.
      // Note this must sit on the object: .refine() on image() is unsupported.
      .refine((data) => !data.cover || data.coverAlt.trim().length > 0, {
        message: 'coverAlt is required whenever cover is set',
        path: ['coverAlt'],
      })
      .refine(
        (data) => !data.timeframe.end || data.timeframe.end >= data.timeframe.start,
        {
          message: 'timeframe.end must not be before timeframe.start',
          path: ['timeframe', 'end'],
        },
      ),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().max(200),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        heroImage: image().optional(),
        heroImageAlt: z.string().default(''),
        draft: z.boolean().default(false),
        /** Validated against the projects collection at build time. */
        relatedProjects: z.array(reference('projects')).default([]),
      })
      .refine((data) => !data.heroImage || data.heroImageAlt.trim().length > 0, {
        message: 'heroImageAlt is required whenever heroImage is set',
        path: ['heroImageAlt'],
      }),
});

/**
 * The resume lives in one YAML file and is validated like everything else, so a
 * typo fails the build instead of silently rendering an empty section. Both the
 * web resume and the generated PDF read from it.
 */
const resume = defineCollection({
  loader: file('./src/data/resume.yaml'),
  schema: z.object({
    summary: z.string(),
    experience: z
      .array(
        z.object({
          role: z.string(),
          org: z.string(),
          location: z.string().optional(),
          /** Free text ("2021", "Mar 2021") so partial dates stay honest. */
          start: z.string(),
          /** Omit or set null for current roles. */
          end: z.string().nullable().default(null),
          bullets: z.array(z.string()).min(1),
          tags: z.array(z.string()).default([]),
        }),
      )
      .min(1),
    education: z
      .array(
        z.object({
          credential: z.string(),
          org: z.string(),
          location: z.string().optional(),
          start: z.string().optional(),
          end: z.string().nullable().default(null),
          detail: z.string().optional(),
        }),
      )
      .default([]),
    skills: z
      .array(
        z.object({
          label: z.string(),
          items: z.array(z.string()).min(1),
        }),
      )
      .default([]),
    certifications: z
      .array(
        z.object({
          name: z.string(),
          issuer: z.string(),
          year: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { projects, posts, resume };
