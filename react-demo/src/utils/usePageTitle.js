import { useEffect } from 'react';

/**
 * Custom hook to set the page title
 * @param {string} title - The page title to set
 */
export function usePageTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | BlogDemo` : 'BlogDemo';

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
