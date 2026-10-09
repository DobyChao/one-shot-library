import { getAsset, getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '画廊',
      href: getPermalink('/shots'),
    },
    {
      text: '同题对照',
      href: getPermalink('/shots/series'),
    },
    {
      text: '关于',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: '提交作品', href: getPermalink('/about#submit') }],
};

export const footerData = {
  links: [
    {
      title: '站点',
      links: [
        { text: '首页', href: getPermalink('/') },
        { text: '画廊', href: getPermalink('/shots') },
        { text: '同题对照', href: getPermalink('/shots/series') },
        { text: '关于 / 提交作品', href: getPermalink('/about') },
        { text: 'RSS 订阅', href: getAsset('/rss.xml') },
      ],
    },
    {
      title: '参照馆',
      links: [
        { text: 'v0 Community', href: 'https://v0.app', target: '_blank' },
        { text: 'WebDev Arena', href: 'https://web.lmarena.ai', target: '_blank' },
        { text: 'Made with Bolt', href: 'https://bolt.new', target: '_blank' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/DobyChao/one-shot-library' },
  ],
  footNote: `
    One-Shot Library · 静态站点
  `,
};
