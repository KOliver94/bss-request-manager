import { useEffect, useState } from 'react';

const DARK_MODE = 'dark-mode';

const prefersDarkMode = window.matchMedia(
  '(prefers-color-scheme: dark)'
).matches;

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState<boolean>(getDarkMode());

  // If no previous setting was saved we check the browser's preference.
  // Saved option always overrides browser's preference.
  function getDarkMode(): boolean {
    if (localStorage.getItem(DARK_MODE) === null) return prefersDarkMode;
    return localStorage.getItem(DARK_MODE) === 'true';
  }

  useEffect(() => {
    const previousValue = getDarkMode();
    if (previousValue !== darkMode) {
      localStorage.setItem(DARK_MODE, JSON.stringify(darkMode));
      window.location.reload();
    }
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
};
