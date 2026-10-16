import { useEffect } from 'react';

/**
 * Calls `onEscape` when the user presses Escape.
 *
 * Used by every modal so that keyboard and mobile users can always
 * dismiss a dialog without hunting for the close button.
 */
export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, active]);
}

export default useEscapeKey;