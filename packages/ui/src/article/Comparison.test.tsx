import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Comparison } from './Comparison';

describe('Comparison', () => {
  it('renders all column titles and items', () => {
    render(
      <Comparison
        columns={[
          { title: 'Pros', items: ['fast', 'simple'], tone: 'pos' },
          { title: 'Cons', items: ['expensive'], tone: 'neg' },
        ]}
      />,
    );
    expect(screen.getByText('Pros')).toBeInTheDocument();
    expect(screen.getByText('Cons')).toBeInTheDocument();
    expect(screen.getByText('fast')).toBeInTheDocument();
    expect(screen.getByText('expensive')).toBeInTheDocument();
  });
});
