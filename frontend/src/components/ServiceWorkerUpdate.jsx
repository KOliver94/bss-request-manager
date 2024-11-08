import { useEffect } from 'react';
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function ServiceWorkerUpdate() {
  const { enqueueSnackbar } = useSnackbar();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return () => {};

    enqueueSnackbar('Az alkalmazás frissült. Újratöltés folyamatban...', {
      persist: true,
      variant: 'info',
    });

    const timer = setTimeout(() => updateServiceWorker(true), 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [needRefresh, updateServiceWorker, enqueueSnackbar]);

  return (
    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      open={needRefresh}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
