import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageFigure } from './ImageFigure';

describe('ImageFigure', () => {
  it('renders img with src and alt', () => {
    render(<ImageFigure src="/x.png" alt="alt text" />);
    const img = screen.getByAltText('alt text');
    expect(img).toHaveAttribute('src', '/x.png');
  });

  it('renders caption when provided', () => {
    render(<ImageFigure src="/x.png" caption="cap" />);
    expect(screen.getByText('cap')).toBeInTheDocument();
  });
});
