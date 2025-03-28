/**
 * Utility type definitions
 */

/**
 * Makes all properties in T optional
 */
export type Partial<T> = {
    [P in keyof T]?: T[P];
  };
  
  /**
   * Makes all properties in T required
   */
  export type Required<T> = {
    [P in keyof T]-?: T[P];
  };
  
  /**
   * Makes all properties in T readonly
   */
  export type Readonly<T> = {
    readonly [P in keyof T]: T[P];
  };
  
  /**
   * Picks a set of properties K from T
   */
  export type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };
  
  /**
   * Omits a set of properties K from T
   */
  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  
  /**
   * Constructs a type with all properties of T except those that are assignable to U
   */
  export type Exclude<T, U> = T extends U ? never : T;
  
  /**
   * Constructs a type with all properties of T that are assignable to U
   */
  export type Extract<T, U> = T extends U ? T : never;
  
  /**
   * Constructs a type with properties of T and U
   */
  export type Merge<T extends object, U extends object> = Omit<T, Extract<keyof T, keyof U>> & U;
  
  /**
   * Makes all properties in T nullable
   */
  export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
  };
  
  /**
   * Makes specified properties in T required
   */
  export type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
  
  /**
   * Makes specified properties in T optional
   */
  export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  
  /**
   * Record type with specified keys and values
   */
  export type Dictionary<K extends keyof any, T> = {
    [P in K]: T;
  };
  
  /**
   * Function type with generic parameters and return type
   */
  export type Func<P extends any[], R> = (...args: P) => R;
  
  /**
   * Async function type with generic parameters and return type
   */
  export type AsyncFunc<P extends any[], R> = (...args: P) => Promise<R>;
  
  /**
   * Deep partial type (makes all nested properties optional)
   */
  export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  } : T;
  
  /**
   * Makes all properties in T either the original type or undefined
   */
  export type Maybe<T> = T | undefined;
  
  /**
   * Constructs an intersection type of object types
   */
  export type Intersect<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
  
  /**
   * Extracts the type of an array element
   */
  export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
  
  /**
   * Extract the type of a promise
   */
  export type Awaited<T> = T extends Promise<infer U> ? U : T;
  
  /**
   * Makes properties K of T mutable (removes readonly)
   */
  export type Mutable<T, K extends keyof T> = {
    -readonly [P in K]: T[P]
  } & Omit<T, K>;
  
  /**
   * Utility type for component props with children
   */
  export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode };
  
  /**
   * Type for discriminated unions with a 'type' field
   */
  export type Discriminate<T, K extends keyof T, V extends T[K]> = T extends { [key in K]: V } ? T : never;
  
  /**
   * Type for a function that returns a value immediately or a promise
   */
  export type MaybePromise<T> = T | Promise<T>;
  
  /**
   * Type safe object keys
   */
  export type ObjectKeys<T extends object> = Array<keyof T>;
  
  /**
   * Type safe object entries
   */
  export type ObjectEntries<T extends object> = Array<[keyof T, T[keyof T]]>;
  
  /**
   * Ensures all properties in a Record are non-nullable
   */
  export type NonNullableRecord<T> = {
    [P in keyof T]: NonNullable<T[P]>;
  };
  
  /**
   * Utility type for component ref props
   */
  export type RefProps<T> = {
    ref?: React.Ref<T>;
  };
  
  /**
   * Utility type for HTML element props
   */
  export type HTMLProps<T extends HTMLElement> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>;
  
  /**
   * Type for a React component that accepts a ref
   */
  export type ForwardRefComponent<P, T> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>;
  
  /**
   * Function component with ref forwarding
   */
  export type FC<P = {}, T = any> = React.FunctionComponent<P & RefProps<T>>;