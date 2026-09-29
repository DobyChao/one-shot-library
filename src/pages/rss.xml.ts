import rss from '@astrojs/rss';
import { METADATA, SITE } from 'astrowind:config';

import { fetchShots } from '~/utils/shots';
import { getPermalink } from '~/utils/permalinks';

export const GET = async () => {
  const shots = await fetchShots();

  return rss({
    title: `${SITE?.name} — 新收录`,
    description: METADATA?.description ?? 'AI one-shot 前端产物画廊',
    site: SITE?.site ?? '',
    items: shots.map((shot) => ({
      title: shot.title,
      description: shot.excerpt,
      pubDate: shot.publishDate,
      link: new URL(getPermalink(shot.permalink), SITE?.site).toString(),
    })),
    customData: '<language>zh-CN</language>',
  });
};
