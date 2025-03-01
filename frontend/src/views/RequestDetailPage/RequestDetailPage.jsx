import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import CircularProgress from '@mui/material/CircularProgress';
import TheatersIcon from '@mui/icons-material/Theaters';
// core components
import StatusBadge from 'components/material-kit-react/Badge/StatusBadge';
import CustomTabs from 'components/material-kit-react/CustomTabs/CustomTabs';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
// Notistack
import { useSnackbar } from 'notistack';
// Page components
import BasicInformation from 'components/RequestDetails/BasicInformation';
import Comments from 'components/RequestDetails/Comments';
import Videos from 'components/RequestDetails/Videos';
// API calls
import { getRequest } from 'api/requestApi';
import { requestStatuses } from 'helpers/enumConstants';
import handleError from 'helpers/errorHandler';
import changePageTitle from 'helpers/pageTitleHelper';

import { isPrivileged } from 'helpers/authenticationHelper';
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
          <GridContainer justifyContent="center">
            <GridItem className={stylesModule.textCenter}>
              <h1 className={stylesModule.title}>
                {loading ? 'Betöltés...' : data.title}
              </h1>
            </GridItem>
            <GridItem
              xs={12}
              sm={12}
              md={6}
              className={stylesModule.textCenter}
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
            <GridContainer justifyContent="center">
              <CircularProgress
                className={stylesModule.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <GridContainer
              justifyContent="center"
              className={stylesModule.content}
            >
              <GridItem xs={12} sm={12} md={6}>
                <BasicInformation
                  requestId={id}
                  requestData={data}
                  setRequestData={setData}
                  reload={reload}
                  setReload={setReload}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
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
