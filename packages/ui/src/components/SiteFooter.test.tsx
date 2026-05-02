import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders copyright text', () => {
    render(<SiteFooter copyright="© 2026 WJWang" />);
    expect(screen.getByText('© 2026 WJWang')).toBeInTheDocument();
  });
});
