import { useEffect } from 'react';

const usePageTheme = (themeName) => {
  useEffect(() => {
    const themeToApply = themeName || 'main'; 
    const themeClass = `theme-${themeToApply}`;

    document.body.classList.add(themeClass);

    return () => {
      document.body.classList.remove(themeClass);
    };
  }, [themeName]);
};

export default usePageTheme;