// src/hooks/useOutsideClick.ts
import { useEffect, RefObject } from 'react';

/**
 * A hook that handles clicks outside of the referenced element
 * 
 * @param ref - The React ref object to check against
 * @param handler - The callback function to run when a click outside occurs
 * @param enabled - Whether the hook is enabled (optional, default true)
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent): void => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

export default useOutsideClick;