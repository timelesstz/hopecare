import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessibleImage from '../components/AccessibleImage';
import SkipLink from '../components/SkipLink';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Component Tests
 * 
 * This file contains tests for React components.
 * Run with: npx jest src/tests/components.test.tsx
 */

// Mock for testing
jest.mock('react-dom', () => {
  return {
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('AccessibleImage Component', () => {
  test('renders with proper alt text for informative images', () => {
    render(<AccessibleImage src="/test.jpg" alt="Test image description" />);
    const image = screen.getByAltText('Test image description');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('renders without alt text and presentation role for decorative images', () => {
    render(<AccessibleImage src="/decorative.jpg" alt="This should be ignored" decorative={true} />);
    const image = screen.getByRole('presentation');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', '');
  });

  test('renders with figure and figcaption when caption is provided', () => {
    render(
      <AccessibleImage 
        src="/test.jpg" 
        alt="Test image" 
        caption="This is a caption"
      />
    );
    
    const figure = screen.getByRole('figure');
    expect(figure).toBeInTheDocument();
    
    const caption = screen.getByText('This is a caption');
    expect(caption).toBeInTheDocument();
    expect(caption.tagName).toBe('FIGCAPTION');
  });

  test('renders with responsive image attributes when provided', () => {
    render(
      <AccessibleImage 
        src="/test.jpg" 
        alt="Test image" 
        srcSet="/test-small.jpg 480w, /test-large.jpg 1200w"
        sizes="(max-width: 600px) 480px, 1200px"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('srcSet', '/test-small.jpg 480w, /test-large.jpg 1200w');
    expect(image).toHaveAttribute('sizes', '(max-width: 600px) 480px, 1200px');
  });

  test('renders with aria-describedby when extended description is provided', () => {
    render(
      <AccessibleImage 
        src="/test.jpg" 
        alt="Test image" 
        describedBy="extended-desc"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('aria-describedby', 'extended-desc');
  });
});

describe('SkipLink Component', () => {
  test('renders with default text', () => {
    render(<SkipLink targetId="main-content" />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveClass('skip-link');
  });

  test('renders with custom text', () => {
    render(<SkipLink targetId="main-content" text="Skip to content" />);
    const link = screen.getByText('Skip to content');
    expect(link).toBeInTheDocument();
  });

  test('renders with additional class name', () => {
    render(<SkipLink targetId="main-content" className="custom-class" />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('skip-link');
    expect(link).toHaveClass('custom-class');
  });
});

describe('ErrorBoundary Component', () => {
  // Save the original console.error to restore it later
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console.error to prevent test output pollution
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });
  
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );
    
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Child content');
  });
  
  test('renders fallback UI when there is an error', () => {
    // Component that throws an error when rendered
    const BuggyComponent = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Error occurred</div>}>
        <BuggyComponent />
      </ErrorBoundary>
    );
    
    const fallback = screen.getByTestId('fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('Error occurred');
  });
  
  test('renders custom fallback function when there is an error', () => {
    // Component that throws an error when rendered
    const BuggyComponent = () => {
      throw new Error('Custom error');
    };
    
    const customFallback = (error: Error, resetError: () => void) => (
      <div data-testid="custom-fallback">
        <p>Error message: {error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    );
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent />
      </ErrorBoundary>
    );
    
    const fallback = screen.getByTestId('custom-fallback');
    expect(fallback).toBeInTheDocument();
    expect(screen.getByText('Error message: Custom error')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
}); 