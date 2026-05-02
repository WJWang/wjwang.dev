import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Aside } from './Aside';

describe('Aside', () => {
  it('renders title and children', () => {
    render(<Aside title="Side note">extra context</Aside>);
    expect(screen.getByText('Side note')).toBeInTheDocument();
    expect(screen.getByText('extra context')).toBeInTheDocument();
  });
});
