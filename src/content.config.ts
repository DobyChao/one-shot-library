import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    /** Alternative text for the cover image. Leave empty for decorative stock photos. */
    imageAlt: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const shotCollection = defineCollection({
  loader: glob({ pattern: ['*.md'], base: 'src/data/shot' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),

    /** Opening user message. One-shot entries can omit `session`; it is copied from here. */
    prompt: z.string(),
    /** one-shot = a single user opening. vibe = an iterative session. */
    mode: z.enum(['one-shot', 'vibe']).optional(),
    /** One-line feel. Cards prefer this over a prompt excerpt when it is set. */
    vibe: z.string().optional(),
    /** What the session arrived at, in one sentence. */
    outcome: z.string().optional(),
    /**
     * Ordered session. Each beat is a user or agent turn.
     * `html` is a path under public/artifacts/. `image` is a screenshot ref.
     */
    session: z
      .array(
        z.object({
          role: z.enum(['user', 'agent']),
          text: z.string(),
          note: z.string().optional(),
          html: z.string().optional(),
          image: z.string().optional(),
        })
      )
      .optional(),
    /** Agent harness that drove the generation, e.g. "ZCode", "Claude Code", "v0". */
    harness: z.string().optional(),
    /** Model/agent that produced the artifact, e.g. "GLM-5.3-Flash". */
    model: z.string().optional(),
    /** User openings actually used (1 = true one-shot). Defaults to the user beats in `session`. */
    turns: z.number().int().optional(),

    /** Artifact HTML file served from /artifacts/<file> (public/artifacts). */
    html: z.string().optional(),
    /** External live URL, used when there is no local HTML file. */
    externalUrl: z.string().url().optional(),

    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),

    /** Render a looping video cover (recorded by `npm run screenshots`). */
    video: z.boolean().optional(),
    /** Keyboard key the recorder presses to start interactive artifacts (e.g. "Enter", "Space"). */
    videoKey: z.string().optional(),
    /** Groups works generated from the same prompt for side-by-side comparison. */
    series: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

export const collections = {
  post: postCollection,
  shot: shotCollection,
};
