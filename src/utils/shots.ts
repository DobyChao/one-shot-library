import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Shot, Taxonomy } from '~/types';
import { cleanSlug, trimSlash } from './permalinks';

const getNormalizedShot = async (shot: CollectionEntry<'shot'>): Promise<Shot> => {
  const { id, data } = shot;
  const { Content } = await render(shot);

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    imageAlt,
    prompt,
    harness,
    model,
    turns,
    html,
    externalUrl,
    tags: rawTags = [],
    featured = false,
    video,
    videoKey,
    series,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(id);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const tags: Taxonomy[] = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  return {
    id,
    slug,
    permalink: ['shots', slug]
      .map((el) => trimSlash(el))
      .filter((el) => !!el)
      .join('/'),

    publishDate,
    updateDate,

    title,
    excerpt,
    image,
    imageAlt,

    prompt,
    harness,
    model,
    turns,

    html,
    externalUrl,

    tags,
    featured,

    video,
    videoKey,
    series,

    draft,

    metadata,

    Content,
  };
};

const load = async function (): Promise<Array<Shot>> {
  const shots = await getCollection('shot');
  const normalizedShots = shots.map(async (shot) => await getNormalizedShot(shot));

  return (await Promise.all(normalizedShots))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((shot) => !shot.draft);
};

let _shots: Array<Shot>;

/** All shots, newest first. */
export const fetchShots = async (): Promise<Array<Shot>> => {
  if (!_shots) {
    _shots = await load();
  }
  return _shots;
};

/** Latest N shots for the home page. */
export const findLatestShots = async ({ count }: { count?: number }): Promise<Array<Shot>> => {
  const _count = count || 6;
  const shots = await fetchShots();
  return shots ? shots.slice(0, _count) : [];
};

/** Static paths for the shot detail pages. */
export const getStaticPathsShots = async () => {
  return (await fetchShots()).map((shot) => ({
    params: { slug: shot.slug },
    props: { shot },
  }));
};
