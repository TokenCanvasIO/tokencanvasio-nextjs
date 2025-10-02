import { useCallback, useRef } from 'react';

/**
 * A custom hook to detect a double-tap or double-click on an element.
 * It handles both mouse and touch events reliably.
 * @param {function} callback - The function to call on a double-tap.
 * @param {number} [timeout=300] - The maximum time in ms between taps.
 * @returns {function} A handler to attach to the element's onClick event.
 */
export const useDoubleTap = (callback, timeout = 300) => {
  // Use a ref to store the timestamp of the last tap.
  // This prevents re-renders on every tap.
  const lastTap = useRef(0);

  // Return a memoized handler function.
  const handler = useCallback((event) => {
    const now = new Date().getTime();
    const timeSinceLastTap = now - lastTap.current;

    // Check if the time since the last tap is within the timeout period.
    if (timeSinceLastTap < timeout && timeSinceLastTap > 0) {
      // This is a double-tap, so execute the callback.
      callback(event);
    }
    
    // Update the last tap timestamp.
    lastTap.current = now;
  }, [callback, timeout]);

  return handler;
};