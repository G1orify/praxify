import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design based on media queries
 * @param query - The media query string
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  xs: '(max-width: 639px)',
  xm: '(max-width: 767px)',
  sl: '(max-width: 1023px)',
  mx: '(max-width: 1279px)',
} as const;

/**
 * Hook to check if screen is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery(breakpoints.xs);
}

/**
 * Hook to check if screen is tablet or smaller
 */
export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.xm);
}

/**
 * Hook to check if screen is desktop or larger
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}

/**
 * Hook to get current breakpoint
 */
export function useCurrentBreakpoint(): string {
  if (useMediaQuery(breakpoints['2xl'])) return '2xl';
  if (useMediaQuery(breakpoints.xl)) return 'xl';
  if (useMediaQuery(breakpoints.lg)) return 'lg';
  if (useMediaQuery(breakpoints.md)) return 'md';
  if (useMediaQuery(breakpoints.sm)) return 'sm';
  return 'xs';
}
