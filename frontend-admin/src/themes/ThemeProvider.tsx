import { lazy, Suspense, useContext } from 'react';

import { PrimeReactContext } from 'primereact/api';
import { useMountEffect } from 'primereact/hooks';

import { useTheme } from 'hooks/useTheme';

const DarkTheme = lazy(() => import('./dark/DarkTheme'));
const LightTheme = lazy(() => import('./light/LightTheme'));

type ThemeProviderProps = {
  children: JSX.Element;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { setRipple } = useContext(PrimeReactContext);
  const [darkMode] = useTheme();

  useMountEffect(() => {
    setRipple(true);
  });

  return (
    <Suspense fallback={<span />}>
      {darkMode ? <DarkTheme /> : <LightTheme />}
      {children}
    </Suspense>
  );
};
