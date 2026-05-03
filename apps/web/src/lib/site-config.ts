import type { NavItem, SocialLink } from '@wjwang/ui/types';

export const SITE = {
  name: 'WJWang',                  // brand/person identifier (header logo, footer, author)
  title: "WJWang's Blog",          // site title (browser tab, OG, RSS)
  domain: 'wjwang.dev',
  url: 'https://wjwang.dev',
  description: 'WJWang 的技術部落格',
  tagline: 'Software Engineer · 技術探索與實踐',
  copyright: '© 2026 WJWang. All rights reserved.',
  author: {
    name: 'WJWang',
    email: 'anderson.thereisnospoon@gmail.com',
    avatar: '/avatar.jpg',
  },
} as const;

export const NAV: NavItem[] = [
  { label: '文章', href: '/articles' },
  { label: '標籤', href: '/tags' },
  { label: '關於', href: '/about' },
];

export const SOCIALS: SocialLink[] = [
  { kind: 'github',   href: 'https://github.com/WJWang' },
  { kind: 'linkedin', href: 'https://www.linkedin.com/in/wj-wang-696a0b86/' },
  { kind: 'medium',   href: 'https://wjwang.medium.com/' },
  { kind: 'mail',     href: `mailto:${'anderson.thereisnospoon@gmail.com'}` },
];
