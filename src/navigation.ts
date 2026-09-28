import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '画廊',
      href: getPermalink('/shots'),
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
        { text: '关于 / 提交作品', href: getPermalink('/about') },
      ],
    },
    {
      title: '灵感来源',
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
    One-Shot Library · 每条 prompt 都值得一个展厅
  `,
};
