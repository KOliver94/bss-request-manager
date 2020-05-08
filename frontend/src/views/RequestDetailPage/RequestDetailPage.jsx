import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Face from '@material-ui/icons/Face';
import TheatersIcon from '@material-ui/icons/Theaters';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// core components
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

import styles from 'assets/jss/material-kit-react/views/requestDetailPage';

const useStyles = makeStyles(styles);

export default function RequestDetailPage({
  isAuthenticated,
  setIsAuthenticated,
  isAdmin,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
            isAdmin={isAdmin}
          />
        ),
      },
    ];
    if (isAdmin) {
      content.unshift({
        tabName: 'Stáb',
        tabIcon: Face,
        tabContent: (
          <Crew
            requestId={id}
            requestData={data}
            setRequestData={setData}
            staffMembers={staffMembers}
            isAdmin={isAdmin}
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
        if (isAdmin) {
          result = await getRequestAdmin(requestId);
          await listStaffUsers().then((response) => {
            setStaffMembers(response.data);
          });
        } else {
          result = await getRequest(requestId);
        }
        setData(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }

    loadData(id);
  }, [id, isAdmin, enqueueSnackbar]);

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkérés kezelő"
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
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={6} className={classes.textCenter}>
              <h1 className={classes.title}>
                {loading ? 'Betöltés...' : data.title}
              </h1>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          {loading ? (
            <GridContainer justify="center">
              <CircularProgress
                className={classes.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <>
              <GridContainer justify="center" className={classes.content}>
                <GridItem xs={12} sm={6}>
                  <BasicInformation
                    requestId={id}
                    requestData={data}
                    setRequestData={setData}
                    staffMembers={staffMembers}
                    isAdmin={isAdmin}
                  />
                </GridItem>
                <GridItem xs={12} sm={6} className={classes.textColor}>
                  <CustomTabs
                    headerColor="primary"
                    tabs={tabsContent()}
                    activeTab={isAdmin && data.status > 4 ? 1 : 0}
                  />
                </GridItem>
                <GridItem xs={12} className={classes.textColor}>
                  <Comments
                    requestId={id}
                    requestData={data}
                    setRequestData={setData}
                    isAdmin={isAdmin}
                  />
                </GridItem>
              </GridContainer>
            </>
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
  isAdmin: PropTypes.bool,
};

RequestDetailPage.defaultProps = {
  isAdmin: false,
};
