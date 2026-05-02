import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GeometricBackground } from './GeometricBackground';

describe('GeometricBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<GeometricBackground />);
    expect(container.firstChild).toBeTruthy();
  });
});
