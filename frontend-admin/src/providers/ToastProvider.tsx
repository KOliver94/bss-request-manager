import { useRef, useLayoutEffect, useContext, createContext } from 'react';

import { ToastMessage, Toast } from 'primereact/toast';

type MessageType = ToastMessage | ToastMessage[];

type ToastProviderProps = {
  children: JSX.Element;
};

interface ToastContextValue {
  clear: () => void;
  show: (message: MessageType) => void;
}

const initialValue: ToastContextValue = {
  clear: () => null,
  show: () => null,
};

export class ToastEvent extends Event {
  constructor(public message: MessageType) {
    super('toast');
  }
}

export const toast = new (class Toaster {
  private _currentEvent: ToastEvent | null = null;

  show(message: MessageType) {
    this._currentEvent = new ToastEvent(message);
    if (this._currentEvent) window.dispatchEvent(this._currentEvent);
  }
})();

const ToastContext = createContext<ToastContextValue>(initialValue);

export const ToastProvider = (props: ToastProviderProps) => {
  const toast = useRef<Toast>(null);

  const show = (message: MessageType) => {
    toast.current?.show(message);
  };

  useLayoutEffect(() => {
    function callback(e: Event) {
      if (e instanceof ToastEvent) show(e.message);
    }

    window.addEventListener('toast', callback);
    return () => window.removeEventListener('toast', callback);
  }, []);

  const clear = () => toast.current?.clear();

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <ToastContext.Provider value={{ clear, show }}>
        {props.children}
      </ToastContext.Provider>
    </>
  );
};

export const useToast = () => useContext(ToastContext);
