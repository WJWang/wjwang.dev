import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

describe('Callout', () => {
  it('renders children', () => {
    render(<Callout>note</Callout>);
    expect(screen.getByText('note')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Callout title="重要">x</Callout>);
    expect(screen.getByText('重要')).toBeInTheDocument();
  });

  it.each(['info', 'warn', 'success', 'danger', 'tip'] as const)('accepts variant %s', (v) => {
    const { container } = render(<Callout variant={v}>x</Callout>);
    expect(container.firstChild).toBeTruthy();
  });
});
