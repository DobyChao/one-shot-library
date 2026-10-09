import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { SessionTurn, Shot, ShotMode, Taxonomy } from '~/types';
import { cleanSlug, trimSlash } from './permalinks';

export const shotModeLabel = (mode: ShotMode) => (mode === 'vibe' ? '多轮 · vibe' : '一轮 · one-shot');

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
    mode: rawMode,
    vibe,
    outcome,
    session: rawSession,
    harness,
    model,
    turns: rawTurns,
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

  const session: SessionTurn[] =
    rawSession && rawSession.length > 0
      ? rawSession.map((turn) => ({
          role: turn.role,
          text: turn.text,
          note: turn.note,
          html: turn.html,
          image: turn.image,
        }))
      : [{ role: 'user', text: prompt }];

  const userTurns = session.filter((turn) => turn.role === 'user').length;
  const turns = typeof rawTurns === 'number' ? rawTurns : Math.max(userTurns, 1);
  const mode: ShotMode = rawMode ?? (userTurns > 1 || turns > 1 ? 'vibe' : 'one-shot');

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
    mode,
    vibe,
    outcome,
    session,
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
