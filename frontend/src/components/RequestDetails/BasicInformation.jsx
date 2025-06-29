import { useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';

import { getRequest } from 'api/requestApi';
import handleError from 'helpers/errorHandler';

import stylesModule from './BasicInformation.module.scss';

export default function BasicInformation({
  requestId,
  requestData,
  setRequestData,
  reload,
  setReload,
}) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    setReload(!reload);
    try {
      await getRequest(requestId, null).then((response) => {
        setLoading(false);
        setRequestData(response.data);
      });
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 15px',
          }}
        >
          <Grid>
            <Typography variant="h6" className={stylesModule.title}>
              Alapinformációk
            </Typography>
          </Grid>
          <Grid>
            <Tooltip
              title="Vissza a felkérések listájához"
              placement="top"
              arrow
            >
              <span>
                <IconButton
                  onClick={() => navigate('/my-requests', { replace: true })}
                  disabled={loading}
                >
                  <ArrowBackIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Frissítés" placement="top" arrow>
              <span>
                <IconButton onClick={handleReload} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
      <Divider variant="middle" />
      <Paper className={stylesModule.paper} elevation={2}>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Esemény neve: <strong>{requestData.title}</strong>
        </Typography>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Kezdés időpontja:{' '}
          <strong>
            {format(
              new Date(requestData.start_datetime),
              'yyyy. MMMM d. (eeee) | H:mm',
              { locale: hu },
            )}
          </strong>
        </Typography>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Várható befejezés:{' '}
          <strong>
            {format(
              new Date(requestData.end_datetime),
              'yyyy. MMMM d. (eeee) | H:mm',
              { locale: hu },
            )}
          </strong>
        </Typography>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Helyszín: <strong>{requestData.place}</strong>
        </Typography>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Videó típusa: <strong>{requestData.type}</strong>
        </Typography>
        <Typography variant="body2" component="p" sx={{ marginBottom: '10px' }}>
          Felkérő: <strong>{requestData.requester.full_name}</strong>
          <br />
          <strong>
            (
            <a href={`mailto:${requestData.requester.email}`}>
              {requestData.requester.email}
            </a>
            {requestData.requester.phone_number && (
              <>
                {', '}
                <a href={`tel:${requestData.requester.phone_number}`}>
                  {requestData.requester.phone_number}
                </a>
              </>
            )}
            )
          </strong>
        </Typography>
        {requestData.requested_by &&
          requestData.requested_by.id !== requestData.requester.id && (
            <Typography
              variant="body2"
              component="p"
              sx={{ marginBottom: '10px' }}
            >
              Beküldő: <strong>{requestData.requested_by.full_name}</strong>
            </Typography>
          )}
        <Divider />
        <Typography variant="body2" component="p" sx={{ marginTop: '10px' }}>
          Beküldve:{' '}
          <strong>
            {format(
              new Date(requestData.created),
              'yyyy. MMMM d. (eeee) | H:mm',
              {
                locale: hu,
              },
            )}
          </strong>
        </Typography>
        {requestData.responsible && (
          <Typography
            variant="body2"
            component="p"
            sx={{ marginBottom: '10px' }}
          >
            Felelős: <strong>{requestData.responsible.full_name}</strong>
            <br />
            <strong>
              (
              <a href={`mailto:${requestData.responsible.email}`}>
                {requestData.responsible.email}
              </a>
              {requestData.responsible.phone_number && (
                <>
                  {', '}
                  <a href={`tel:${requestData.responsible.phone_number}`}>
                    {requestData.responsible.phone_number}
                  </a>
                </>
              )}
              )
            </strong>
          </Typography>
        )}
      </Paper>
    </div>
  );
}

BasicInformation.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
  reload: PropTypes.bool.isRequired,
  setReload: PropTypes.func.isRequired,
};
