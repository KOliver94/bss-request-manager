import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Face from '@mui/icons-material/Face';
import TheatersIcon from '@mui/icons-material/Theaters';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Badge from 'components/material-kit-react/Badge/Badge';
import CustomTabs from 'components/material-kit-react/CustomTabs/CustomTabs';
import Header from 'components/material-kit-react/Header/Header';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
// Notistack
import { useSnackbar } from 'notistack';
// Page components
import BasicInformation from 'components/RequestDetails/BasicInformation';
import Comments from 'components/RequestDetails/Comments';
import Crew from 'components/RequestDetails/Crew';
import Videos from 'components/RequestDetails/Videos';
// API calls
import { getRequest } from 'api/requestApi';
import { getRequestAdmin } from 'api/requestAdminApi';
import { listStaffUsers } from 'api/userApi';
import { requestStatuses } from 'helpers/enumConstants';
import { isPrivileged as isPrivilegedCheck } from 'api/loginApi';
import handleError from 'helpers/errorHandler';
import changePageTitle from 'helpers/pageTitleHelper';
import moveOwnUserToTop from 'helpers/sortingHelper';

import styles from 'assets/jss/material-kit-react/views/requestDetailPage';

const useStyles = makeStyles(styles);

export default function RequestDetailPage({
  isAuthenticated,
  setIsAuthenticated,
  isPrivileged,
}) {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { id } = useParams();
  const [snackbarId, setSnackbarId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    id: 0,
    title: '',
    created: '',
    start_datetime: '',
    end_datetime: '',
    deadline: '',
    type: '',
    place: '',
    status: 1,
    reponsible: {},
    requester: {},
    requested_by: {},
    videos: [],
    comments: [],
  });
  const [staffMembers, setStaffMembers] = useState([]);

  const tabsContent = () => {
    const content = [
      {
        tabName: 'Videók',
        tabIcon: TheatersIcon,
        tabContent: (
          <Videos
            requestId={id}
            requestData={data}
            setRequestData={setData}
            staffMembers={staffMembers}
            isPrivileged={isPrivileged}
          />
        ),
      },
    ];
    if (isPrivileged) {
      content.unshift({
        tabName: 'Stáb',
        tabIcon: Face,
        tabContent: (
          <Crew
            requestId={id}
            requestData={data}
            setRequestData={setData}
            staffMembers={staffMembers}
            isPrivileged={isPrivileged}
          />
        ),
      });
    }
    return content;
  };

  useEffect(() => {
    async function loadData(requestId) {
      try {
        let result;
        if (isPrivileged) {
          result = await getRequestAdmin(requestId);
          await listStaffUsers().then((response) => {
            setStaffMembers(moveOwnUserToTop(response.data));
          });
          if (
            result.data.status === 3 &&
            (!result.data.additional_data ||
              (result.data.additional_data &&
                !result.data.additional_data.recording) ||
              (result.data.additional_data &&
                result.data.additional_data.recording &&
                !result.data.additional_data.recording.path))
          ) {
            setSnackbarId(
              enqueueSnackbar(
                'A nyersek helye még nincs megadva. Ne felejtsd el kitölteni!',
                {
                  variant: 'warning',
                  persist: true,
                  action: (key) => (
                    <Button
                      size="small"
                      onClick={() => closeSnackbar(key)}
                      className={classes.snackbarButton}
                    >
                      Rendben
                    </Button>
                  ),
                },
              ),
            );
          }
        } else {
          result = await getRequest(requestId);
        }
        setData(result.data);
        setLoading(false);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          if (!isPrivileged && isPrivilegedCheck()) {
            navigate(`/admin/requests/${id}`, { replace: true });
          } else {
            navigate('/404', { replace: true });
          }
        } else {
          enqueueSnackbar(handleError(e), {
            variant: 'error',
          });
        }
      }
    }

    setLoading(true);
    loadData(id);
  }, [
    id,
    isPrivileged,
    enqueueSnackbar,
    closeSnackbar,
    navigate,
    classes.snackbarButton,
  ]);

  useEffect(() => {
    changePageTitle(!loading && data.title);
  }, [loading, data]);

  useEffect(() => {
    return function cleanup() {
      closeSnackbar(snackbarId);
    };
  }, [snackbarId, closeSnackbar]);

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
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem className={classes.textCenter}>
              <h1 className={classes.title}>
                {loading ? 'Betöltés...' : data.title}
              </h1>
            </GridItem>
            <GridItem xs={12} sm={12} md={6} className={classes.textCenter}>
              {!loading && (
                <Badge color="primary">
                  {requestStatuses.find((x) => x.id === data.status).text}
                </Badge>
              )}
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          {loading ? (
            <GridContainer justifyContent="center">
              <CircularProgress
                className={classes.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <GridContainer justifyContent="center" className={classes.content}>
              <GridItem xs={12} sm={12} md={6}>
                <BasicInformation
                  requestId={id}
                  requestData={data}
                  setRequestData={setData}
                  staffMembers={staffMembers}
                  isPrivileged={isPrivileged}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomTabs
                  headerColor="primary"
                  tabs={tabsContent()}
                  activeTab={isPrivileged && data.status >= 4 ? 1 : 0}
                />
              </GridItem>
              <GridItem>
                <Comments
                  requestId={id}
                  requestData={data}
                  setRequestData={setData}
                  isPrivileged={isPrivileged}
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
  isPrivileged: PropTypes.bool,
};

RequestDetailPage.defaultProps = {
  isPrivileged: false,
};
