// src/types/common.types.ts

/**
 * Interface for generic API response
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

/**
 * Interface for error response
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Type for chart data
 */
export interface ChartData {
  name: string;
  value: number;
}

/**
 * Interface for user authentication
 */
export interface AuthUser {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Interface for authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Interface for register data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Utility type to make specific properties required
 */
export type RequireProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Utility type to make all properties required
 */
export type RequireAll<T> = { [P in keyof T]-?: T[P] };

/**
 * Utility type to make some properties optional
 */
export type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type for button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';

/**
 * Type for button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Type for form field validation state
 */
export type ValidationState = 'valid' | 'invalid' | 'warning' | 'neutral';

/**
 * Type for toast notification variants
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Type for theme modes
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Type for notification position
 */
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/**
 * Interface for notification
 */
export interface Notification {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  position?: NotificationPosition;
  onClose?: () => void;
  autoClose?: boolean;
}

/**
 * Type for component event handlers
 */
export type EventHandler<E extends React.SyntheticEvent = React.SyntheticEvent> = (event: E) => void;

/**
 * Interface for component with children
 */
export interface WithChildren {
  children: React.ReactNode;
}

/**
 * Type for component with class name
 */
export interface WithClassName {
  className?: string;
}

/**
 * Type for component with test ID for testing
 */
export interface WithTestId {
  'data-testid'?: string;
}

/**
 * Type for base component props
 */
export type BaseComponentProps = WithChildren & WithClassName & WithTestId;

/**
 * Type for component with ref
 */
export type WithRef<T> = {
  ref?: React.Ref<T>;
};

/**
 * Type for component that can be disabled
 */
export interface Disableable {
  disabled?: boolean;
}

/**
 * Type for route metadata
 */
export interface RouteMetadata {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  exact?: boolean;
}

/**
 * Type for screen breakpoints
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Interface for responsive value based on breakpoints
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;