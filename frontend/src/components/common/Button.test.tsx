// src/components/common/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '../../utils/testUtils';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/Click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const buttonElement = screen.getByText(/Click me/i);
    
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let buttonElement = screen.getByText(/Primary/i);
    expect(buttonElement).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    buttonElement = screen.getByText(/Secondary/i);
    expect(buttonElement).toHaveClass('bg-gray-600');

    rerender(<Button variant="danger">Danger</Button>);
    buttonElement = screen.getByText(/Danger/i);
    expect(buttonElement).toHaveClass('bg-red-600');
  });

  test('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let buttonElement = screen.getByText(/Small/i);
    expect(buttonElement).toHaveClass('text-xs');

    rerender(<Button size="md">Medium</Button>);
    buttonElement = screen.getByText(/Medium/i);
    expect(buttonElement).toHaveClass('text-sm');

    rerender(<Button size="lg">Large</Button>);
    buttonElement = screen.getByText(/Large/i);
    expect(buttonElement).toHaveClass('text-base');
  });

  test('renders with icon', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<Button icon={icon}>With Icon</Button>);
    
    const buttonElement = screen.getByText(/With Icon/i);
    const iconElement = screen.getByTestId('test-icon');
    
    expect(buttonElement).toBeInTheDocument();
    expect(iconElement).toBeInTheDocument();
  });

  test('renders disabled state correctly', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const buttonElement = screen.getByText(/Disabled/i);
    
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('opacity-60');
    expect(buttonElement).toHaveClass('cursor-not-allowed');
    
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);
    
    const buttonElement = screen.getByText(/Loading/i);
    const spinnerElement = screen.getByRole('status');
    
    expect(buttonElement).toBeDisabled();
    expect(spinnerElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('opacity-60');
    expect(buttonElement).toHaveClass('cursor-not-allowed');
  });
});