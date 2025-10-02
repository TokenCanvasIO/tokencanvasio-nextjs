// src/hooks/useResponsiveColumns.js

import { useState, useEffect, useLayoutEffect } from 'react';

// This hook measures a component and returns the optimal number of columns
export const useResponsiveColumns = (ref, columnWidth) => {
  const [columns, setColumns] = useState(3);

  // useLayoutEffect runs after the component has rendered but before the browser paints
  useLayoutEffect(() => {
    const calculateColumns = () => {
      if (ref.current) {
        const containerWidth = ref.current.offsetWidth;
        const newColumnCount = Math.max(1, Math.floor(containerWidth / columnWidth));
        setColumns(newColumnCount);
      }
    };

    // Initial calculation
    calculateColumns();

    // Set up a ResizeObserver to recalculate whenever the container size changes
    const resizeObserver = new ResizeObserver(calculateColumns);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, [ref, columnWidth]);

  return columns;
};