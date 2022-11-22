import { lazy, Suspense } from 'react';

import { useTheme } from 'hooks/useTheme';

const DarkTheme = lazy(() => import('./dark/DarkTheme'));
const LightTheme = lazy(() => import('./light/LightTheme'));

type ThemeProviderProps = {
  children: JSX.Element;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode] = useTheme();

  return (
    <>
      <Suspense fallback={<span />}>
        {darkMode ? <DarkTheme /> : <LightTheme />}
        {children}
      </Suspense>
    </>
  );
};
