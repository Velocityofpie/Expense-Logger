/**
 * Global type definitions barrel file
 * Re-exports all types from the types directory
 */

// Re-export API types
export type {
    ApiResponse,
    ApiError,
    ApiMetadata,
    RequestOptions,
    PaginationParams,
    SortParams,
    FilterParams,
    QueryParams,
    HttpMethod,
    ApiEndpoint,
    AuthTokens,
    UploadResponse,
    BatchResponse,
    WebSocketMessage
  } from './api';
  
  // Re-export model types
  export type {
    User,
    UserRole,
    UserSettings,
    NotificationSettings,
    Invoice,
    InvoiceStatus,
    InvoiceItem,
    Address,
    Payment,
    PaymentStatus,
    Card,
    CardNumber,
    Template,
    TemplateData,
    WishlistItem,
    PriceHistoryEntry,
    DashboardStats,
    ActivityEntry
  } from './models';
  
  // Re-export utility types
  export type {
    Partial,
    Required,
    Readonly,
    Pick,
    Omit,
    Exclude,
    Extract,
    Merge,
    Nullable,
    RequiredProps,
    OptionalProps,
    Dictionary,
    Func,
    AsyncFunc,
    DeepPartial,
    Maybe,
    Intersect,
    ArrayElement,
    Awaited,
    Mutable,
    PropsWithChildren,
    Discriminate,
    MaybePromise,
    ObjectKeys,
    ObjectEntries,
    NonNullableRecord,
    RefProps,
    HTMLProps,
    ForwardRefComponent,
    FC
  } from './utils';
  
  // Additional global utility types
  export type ID = number | string;
  
  export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  export type SortDirection = 'asc' | 'desc';
  
  export type DateRange = {
    startDate: string;
    endDate: string;
  };
  
  export type ThemeMode = 'light' | 'dark' | 'system';
  
  export type ViewMode = 'list' | 'grid' | 'calendar' | 'table';
  
  export type Status = 'idle' | 'loading' | 'success' | 'error';
  
  export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  export type ColorVariant = 
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  
  export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
  
  export type Position = 'top' | 'right' | 'bottom' | 'left';
  
  export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  
  export type Orientation = 'horizontal' | 'vertical';
  
  export type ValidationState = 'valid' | 'invalid' | 'neutral';