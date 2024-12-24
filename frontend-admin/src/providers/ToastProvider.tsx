import React, {
  useRef,
  useLayoutEffect,
  useContext,
  createContext,
} from 'react';

import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

type MessageType = ToastMessage | ToastMessage[];

type ToastProviderProps = {
  children: React.JSX.Element;
};

interface ToastContextValue {
  clearToasts: () => void;
  showToast: (message: MessageType) => void;
}

const initialValue: ToastContextValue = {
  clearToasts: () => null,
  showToast: () => null,
};

export class ToastEvent extends Event {
  constructor(public message: MessageType) {
    super('toast');
  }
}

export const toast = new (class Toaster {
  private _currentEvent: ToastEvent | null = null;

  showToast(message: MessageType) {
    this._currentEvent = new ToastEvent(message);
    window.dispatchEvent(this._currentEvent);
  }
})();

const ToastContext = createContext<ToastContextValue>(initialValue);

export const ToastProvider = (props: ToastProviderProps) => {
  const toast = useRef<Toast>(null);

  const showToast = (message: MessageType) => {
    toast.current?.show(message);
  };

  useLayoutEffect(() => {
    function callback(e: Event) {
      if (e instanceof ToastEvent) showToast(e.message);
    }

    window.addEventListener('toast', callback);
    return () => {
      window.removeEventListener('toast', callback);
    };
  }, []);

  const clearToasts = () => toast.current?.clear();

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <ToastContext.Provider value={{ clearToasts, showToast }}>
        {props.children}
      </ToastContext.Provider>
    </>
  );
};

export const useToast = () => useContext(ToastContext);
