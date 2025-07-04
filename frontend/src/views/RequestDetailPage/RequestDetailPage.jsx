import { useState, useEffect } from 'react';

import TheatersIcon from '@mui/icons-material/Theaters';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router';

import { getRequest } from 'api/requestApi';
import StatusBadge from 'components/material-kit-react/Badge/StatusBadge';
import CustomTabs from 'components/material-kit-react/CustomTabs/CustomTabs';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import BasicInformation from 'components/RequestDetails/BasicInformation';
import Comments from 'components/RequestDetails/Comments';
import Videos from 'components/RequestDetails/Videos';
import { isPrivileged } from 'helpers/authenticationHelper';
import { requestStatuses } from 'helpers/enumConstants';
import handleError from 'helpers/errorHandler';
import changePageTitle from 'helpers/pageTitleHelper';

import stylesModule from './RequestDetailPage.module.scss';

export default function RequestDetailPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [data, setData] = useState({
    id: 0,
    title: '',
    created: '',
    start_datetime: '',
    end_datetime: '',
    type: '',
    place: '',
    status: 1,
    reponsible: {},
    requester: {},
    requested_by: {},
  });
  const requestStatus = requestStatuses.find((x) => x.id === data.status);

  const tabsContent = () => {
    return [
      {
        tabName: 'Videók',
        tabIcon: TheatersIcon,
        tabContent: <Videos requestId={id} reload={reload} />,
      },
    ];
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadData(requestId) {
      try {
        const result = await getRequest(requestId, {
          signal: controller.signal,
        });
        setData(result.data);
        setLoading(false);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          if (isPrivileged()) {
            window.location.replace(`/admin/requests/${requestId}`);
          } else {
            navigate('/404', { replace: true });
          }
        } else {
          const errorMessage = handleError(e);
          if (errorMessage) {
            enqueueSnackbar(errorMessage, {
              variant: 'error',
            });
          }
        }
      }
    }

    setLoading(true);
    loadData(id);

    return () => {
      controller.abort();
    };
  }, [id, enqueueSnackbar, closeSnackbar, navigate]);

  useEffect(() => {
    changePageTitle(!loading && data.title);
  }, [loading, data]);

  return (
    <>
      <Parallax small filter>
        <div className={stylesModule.container}>
          <GridContainer sx={{ justifyContent: 'center' }}>
            <GridItem sx={{ textAlign: 'center' }}>
              <h1 className={stylesModule.title}>
                {loading ? 'Betöltés...' : data.title}
              </h1>
            </GridItem>
            <GridItem
              size={{ xs: 12, sm: 12, md: 6 }}
              sx={{ textAlign: 'center' }}
            >
              {!loading && (
                <StatusBadge color={requestStatus.color}>
                  {requestStatus.text}
                </StatusBadge>
              )}
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          {loading ? (
            <GridContainer sx={{ justifyContent: 'center' }}>
              <CircularProgress
                className={stylesModule.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <GridContainer sx={{ color: 'black', justifyContent: 'center' }}>
              <GridItem size={{ xs: 12, sm: 12, md: 6 }}>
                <BasicInformation
                  requestId={id}
                  requestData={data}
                  setRequestData={setData}
                  reload={reload}
                  setReload={setReload}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 12, md: 6 }}>
                <CustomTabs
                  headerColor="primary"
                  tabs={tabsContent()}
                  activeTab={0}
                />
              </GridItem>
              <GridItem>
                <Comments
                  requestId={id}
                  requesterId={data.requester.id}
                  reload={reload}
                />
              </GridItem>
            </GridContainer>
          )}
        </div>
      </div>
    </>
  );
}
