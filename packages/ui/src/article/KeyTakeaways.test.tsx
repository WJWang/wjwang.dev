import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyTakeaways } from './KeyTakeaways';

describe('KeyTakeaways', () => {
  it('renders default title 重點摘要', () => {
    render(<KeyTakeaways items={['a', 'b']} />);
    expect(screen.getByText('重點摘要')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<KeyTakeaways title="TL;DR" items={['x']} />);
    expect(screen.getByText('TL;DR')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(<KeyTakeaways items={['one', 'two', 'three']} />);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
  });
});
