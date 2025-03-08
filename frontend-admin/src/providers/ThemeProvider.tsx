import React, { useEffect, useState } from 'react';

import { useTheme } from 'hooks/useTheme';

type ThemeProviderProps = {
  children: React.JSX.Element;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode] = useTheme();
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      if (darkMode) {
        await import('themes/dark/dark-theme.css');
      } else {
        await import('themes/light/light-theme.css');
      }
      setThemeLoaded(true);
    };

    void loadTheme();
  }, [darkMode]);

  if (!themeLoaded) {
    return <></>;
  }

  return <>{children}</>;
};
