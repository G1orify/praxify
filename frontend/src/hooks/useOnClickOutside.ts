import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element
 * @param ref - Ref to the element to detect outside clicks for
 * @param handler - Function to call when click outside occurs
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T> | null,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    if (!ref?.current) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        handler(event);
      }
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler]);
}

/**
 * Hook to detect escape key press
 * @param handler - Function to call when escape key is pressed
 */
export function useOnEscape(handler: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handler]);
}

/**
 * Hook to detect when user scrolls to bottom
 * @param onBottom - Function to call when scroll reaches bottom
 * @param offset - Optional offset from bottom (default: 100px)
 */
export function useOnScrollToBottom(onBottom: () => void, offset = 100) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;

      if (scrollHeight - (scrollTop + clientHeight) < offset) {
        onBottom();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onBottom, offset]);
}
