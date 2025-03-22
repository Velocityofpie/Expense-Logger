// src/utils/testUtils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

/**
 * All providers used in the application
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

/**
 * Custom render method that includes all providers for testing
 * @param ui Component to render
 * @param options Render options
 * @returns Rendered component with all testing utilities
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

/**
 * Mock API service response generator
 * @param data Data to include in the mock response
 * @param status HTTP status code
 * @param statusText HTTP status text
 * @returns Mock response object
 */
export function mockApiResponse<T>(
  data: T,
  status = 200,
  statusText = 'OK'
): Response {
  return {
    data,
    status,
    statusText,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    ok: status >= 200 && status < 300,
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    bodyUsed: false,
    body: null,
    clone: function() { return this; },
    redirected: false,
    type: 'basic',
    url: 'https://api.example.com',
  } as Response;
}

/**
 * Create mock event object
 * @param overrides Properties to override in the mock event
 * @returns Mock event object
 */
export function mockEvent<T extends object>(overrides?: T): Event & T {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides,
  } as unknown as Event & T;
}

/**
 * Create a properly typed mock function
 * @param returnValue Optional value to return when the mock is called
 * @returns Typed mock function
 */
export function createMockFn<T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>
): jest.MockedFunction<T> {
  return jest.fn(() => returnValue) as jest.MockedFunction<T>;
}

/**
 * Mock the window.matchMedia function for tests
 * @param matches Whether the media query matches
 */
export function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Mock the IntersectionObserver API for tests
 */
export function mockIntersectionObserver(): void {
  const mockIntersectionObserver = jest.fn();
  
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };