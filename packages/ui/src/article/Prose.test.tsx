import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Prose } from './Prose';

describe('Prose', () => {
  it('renders children inside a typography wrapper', () => {
    render(<Prose><p>hello</p></Prose>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies size variant class', () => {
    const { container } = render(<Prose size="lg"><span>x</span></Prose>);
    expect(container.firstChild).toHaveClass('prose-lg');
  });
});
