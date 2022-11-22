import { useEffect, useState } from 'react';

const DARK_MODE = 'dark-mode';

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState<boolean>(getDarkMode());

  // If no previous setting was saved we check the browser's preference.
  // Saved option always overrides browser's preference.
  function getDarkMode(): boolean {
    if (localStorage.getItem(DARK_MODE) === null)
      return prefersDarkMode.matches;
    return localStorage.getItem(DARK_MODE) === 'true';
  }

  // Save preferences on change if:
  // 1. User did not save previous preference and changes to
  //  something else than browser's preference.
  // 2. User has a saved preference but changes to other theme.
  function savePreference() {
    const darkModeSavedPref = localStorage.getItem(DARK_MODE);
    const darkModeSavedPrefBool = darkModeSavedPref === 'true';

    if (darkModeSavedPref === null) {
      if (prefersDarkMode.matches !== darkMode)
        localStorage.setItem(DARK_MODE, JSON.stringify(darkMode));
    } else {
      if (darkModeSavedPrefBool !== darkMode)
        localStorage.setItem(DARK_MODE, JSON.stringify(darkMode));
    }
  }

  useEffect(() => {
    const previousValue = getDarkMode();
    if (previousValue !== darkMode) {
      savePreference();
      window.location.reload();
    }
  }, [darkMode]);

  // Subscribe to brower's theme preference changes.
  // If the brower changes the preference and we don't have
  // any saved preferences, we update the theme accordingly.
  useEffect(() => {
    function handlePreferredThemeChange() {
      if (
        localStorage.getItem(DARK_MODE) === null &&
        darkMode !== prefersDarkMode.matches
      ) {
        setDarkMode(prefersDarkMode.matches);
        window.location.reload();
      }
    }

    prefersDarkMode.addEventListener('change', handlePreferredThemeChange);
    return () =>
      prefersDarkMode.removeEventListener('change', handlePreferredThemeChange);
  }, []);

  return [darkMode, setDarkMode] as const;
};
