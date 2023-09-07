/**
 * useDocumentTitle
 * @description A hook to easily update document title with React
 * Copied from https://github.com/imbhargav5/rooks/blob/76426161edca1f233c8d4dea6ce5e5f97d4ff607/packages/rooks/src/hooks/useDocumentTitle.ts
 */
import { useEffect, useRef } from 'react';

const noop = () => {};

type UseDocumentTitleOptions = {
  resetOnUnmount?: boolean;
};

/**
 * useDocumentTitle hook
 *
 * This hook allows you to set the document title.
 *
 * @param title - The new title for the document
 * @param options - An optional object with a `resetOnUnmount` property to control whether the document title should be reset to its previous value when the component is unmounted. Defaults to false.
 *
 * @example
 * function App() {
 *   useDocumentTitle("My App", { resetOnUnmount: true });
 *   return <div>Hello, world!</div>;
 * }
 * @see {@link https://rooks.vercel.app/docs/useDocumentTitle}
 */
function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {},
): void {
  const isBrowser = typeof window !== 'undefined';
  const prevTitleRef = useRef(isBrowser ? document.title : '');
  const { resetOnUnmount = false } = options;

  useEffect(() => {
    if (isBrowser) {
      document.title = title;
      const lastTitle = prevTitleRef.current;
      if (resetOnUnmount) {
        return () => {
          document.title = lastTitle;
        };
      }
    }
    return noop;
  }, [title, isBrowser, resetOnUnmount]);
}

export { useDocumentTitle };
