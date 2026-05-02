import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';
import type { ArticleListItem } from '../types/article';

const meta: ArticleListItem = {
  slug: 'foo',
  title: 'Foo Post',
  excerpt: 'about foo',
  date: '2026-01-01',
  readTime: '3 分鐘',
  tags: ['React'],
  featured: false,
  author: 'WJWang',
};

describe('ArticleCard', () => {
  it('renders title, excerpt, date, readTime, tags', () => {
    render(<ArticleCard meta={meta} />);
    expect(screen.getByText('Foo Post')).toBeInTheDocument();
    expect(screen.getByText('about foo')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText('3 分鐘')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('links to /articles/{slug}', () => {
    render(<ArticleCard meta={meta} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/foo');
  });

  it('applies featured class when variant=featured', () => {
    const { container } = render(<ArticleCard meta={meta} variant="featured" />);
    expect(container.querySelector('article')).toHaveClass('md:col-span-2');
  });
});
