// src/utils/layoutStyles.ts
// A centralized location for layout-related style variables and functions

/**
 * Width mode types
 */
export type WidthMode = 'standard' | 'compact' | 'full';

/**
 * Width mode descriptions for UI display
 */
export const WIDTH_MODE_LABELS: Record<WidthMode, string> = {
  standard: 'Standard Width',
  compact: 'Compact Width',
  full: 'Full Width'
};

/**
 * CSS classes for each width mode
 * - Standard: Wide layout with minimal padding and max width
 * - Compact: Medium width with moderate padding
 * - Full: Full width with very minimal padding
 */
export const WIDTH_MODE_CLASSES: Record<WidthMode, string> = {
  standard: 'w-full px-4 sm:px-6 md:px-8 lg:px-10 max-w-screen-2xl mx-auto',
  compact: 'w-full px-6 max-w-screen-lg mx-auto',
  full: 'w-full px-2'
};

/**
 * Get the CSS classes for a specific width mode
 */
export const getWidthModeClasses = (mode: WidthMode): string => {
  return WIDTH_MODE_CLASSES[mode] || WIDTH_MODE_CLASSES.compact;
};

/**
 * Get the display label for a specific width mode
 */
export const getWidthModeLabel = (mode: WidthMode): string => {
  return WIDTH_MODE_LABELS[mode] || WIDTH_MODE_LABELS.compact;
};

/**
 * Cycle to the next width mode in the sequence: standard -> compact -> full -> standard
 */
export const getNextWidthMode = (currentMode: WidthMode): WidthMode => {
  switch (currentMode) {
    case 'standard':
      return 'compact';
    case 'compact':
      return 'full';
    case 'full':
      return 'standard';
    default:
      return 'compact';
  }
};

/**
 * Save the width mode to localStorage
 */
export const saveWidthMode = (mode: WidthMode): void => {
  localStorage.setItem('widthMode', mode);
};

/**
 * Load the width mode from localStorage
 */
export const loadWidthMode = (): WidthMode => {
  return (localStorage.getItem('widthMode') as WidthMode) || 'compact';
};

/**
 * Dispatch a width mode change event
 */
export const dispatchWidthModeChange = (mode: WidthMode): void => {
  window.dispatchEvent(
    new CustomEvent('widthmodechange', { 
      detail: { widthMode: mode } 
    })
  );
};

/**
 * A complete function to cycle to the next width mode, save it, and dispatch the event
 */
export const cycleWidthMode = (currentMode: WidthMode): WidthMode => {
  const nextMode = getNextWidthMode(currentMode);
  saveWidthMode(nextMode);
  dispatchWidthModeChange(nextMode);
  return nextMode;
};