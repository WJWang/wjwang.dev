import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock language="ts">{'const x = 1;'}</CodeBlock>);
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('renders filename header when provided', () => {
    render(<CodeBlock language="ts" filename="foo.ts">{'x'}</CodeBlock>);
    expect(screen.getByText('foo.ts')).toBeInTheDocument();
  });
});
