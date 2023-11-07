import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import CircularProgress from '@mui/material/CircularProgress';
import TheatersIcon from '@mui/icons-material/Theaters';
// background
import background from 'src/assets/img/header.jpg';
// core components
import StatusBadge from 'src/components/material-kit-react/Badge/StatusBadge';
import CustomTabs from 'src/components/material-kit-react/CustomTabs/CustomTabs';
import Header from 'src/components/material-kit-react/Header/Header';
import Footer from 'src/components/material-kit-react/Footer/Footer';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'src/components/material-kit-react/Header/HeaderLinks';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
// Notistack
import { useSnackbar } from 'notistack';
// Page components
import BasicInformation from 'src/components/RequestDetails/BasicInformation';
import Comments from 'src/components/RequestDetails/Comments';
import Videos from 'src/components/RequestDetails/Videos';
// API calls
import { getRequest } from 'src/api/requestApi';
import { requestStatuses } from 'src/helpers/enumConstants';
import handleError from 'src/helpers/errorHandler';
import changePageTitle from 'src/helpers/pageTitleHelper';

import stylesModule from './RequestDetailPage.module.scss';

export default function RequestDetailPage({
  isAuthenticated,
  setIsAuthenticated,
}) {
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
    async function loadData(requestId) {
      try {
        const result = await getRequest(requestId);
        setData(result.data);
        setLoading(false);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          navigate('/404', { replace: true });
        } else {
          enqueueSnackbar(handleError(e), {
            variant: 'error',
          });
        }
      }
    }

    setLoading(true);
    loadData(id);
  }, [id, enqueueSnackbar, closeSnackbar, navigate]);

  useEffect(() => {
    changePageTitle(!loading && data.title);
  }, [loading, data]);

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkéréskezelő"
        rightLinks={
          <HeaderLinks
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        }
        fixed
        changeColorOnScroll={{
          height: 200,
          color: 'white',
        }}
      />
      <Parallax small filter image={background}>
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
      <Footer />
    </div>
  );
}

RequestDetailPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
