import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  const nav = [{ label: '文章', href: '/articles' }];
  const socials = [{ kind: 'github' as const, href: 'https://github.com/x' }];

  it('renders nav items as links', () => {
    render(<SiteHeader nav={nav} socials={socials} />);
    const link = screen.getByRole('link', { name: '文章' });
    expect(link).toHaveAttribute('href', '/articles');
  });

  it('renders search slot when provided', () => {
    render(<SiteHeader nav={nav} socials={socials} searchSlot={<button>搜尋</button>} />);
    expect(screen.getByRole('button', { name: '搜尋' })).toBeInTheDocument();
  });

  it('renders social links with kind-specific aria-label', () => {
    render(<SiteHeader nav={nav} socials={socials} />);
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  });
});
