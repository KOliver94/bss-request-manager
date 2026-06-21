import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import { toast } from 'providers/ToastProvider';

export const showErrorToast = (error: unknown) => {
  toast.showToast({
    detail: getErrorMessage(error),
    life: 3000,
    severity: 'error',
    summary: 'Hiba',
  });
};
