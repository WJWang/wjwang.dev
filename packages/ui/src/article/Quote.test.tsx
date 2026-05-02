import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Quote } from './Quote';

describe('Quote', () => {
  it('renders children + author', () => {
    render(<Quote author="Dijkstra">Simplicity is prerequisite for reliability.</Quote>);
    expect(screen.getByText(/Simplicity/)).toBeInTheDocument();
    expect(screen.getByText(/Dijkstra/)).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(<Quote author="X" source="EWD"><p>q</p></Quote>);
    expect(screen.getByText(/EWD/)).toBeInTheDocument();
  });
});
