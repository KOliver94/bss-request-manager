import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
// background
import background from 'src/assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Header from 'src/components/material-kit-react/Header/Header';
import Footer from 'src/components/material-kit-react/Footer/Footer';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import HeaderLinks from 'src/components/material-kit-react/Header/HeaderLinks';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
import styles from 'src/assets/jss/material-kit-react/views/landingPage';
// helpers
import changePageTitle from 'src/helpers/pageTitleHelper';
// Sections for this page
import RulesPoliciesSection from './Sections/RulesPoliciesSection';
import ContactSection from './Sections/ContactSection';
import PostscriptSection from './Sections/PostscriptSection';

const useStyles = makeStyles(styles);

export default function LandingPage({ isAuthenticated, setIsAuthenticated }) {
  const classes = useStyles();

  useEffect(() => {
    changePageTitle('Kezdőlap');
  }, []);

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
          height: 400,
          color: 'white',
        }}
      />
      <Parallax filter image={background}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={6}>
              <h1 className={classes.title}>
                Szeretnéd, hogy megörökítsük az eseményed?
              </h1>
              <h4>
                A Budavári Schönherz Stúdió fő céljai közé tartozik, hogy a
                Schönherz Kollégium és a BME-VIK eseményeiről videókat
                készítsen, vagy élőben közvetítse azokat.
              </h4>
              <br />
              <Button
                color="warning"
                size="lg"
                href="https://bsstudio.hu/video/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-play" />
                Nézd meg korábbi videóinkat
              </Button>
              <br />
              <Link to="/new-request">
                <Button color="info" size="lg">
                  <i className="fa-solid fa-paper-plane" />
                  Küldj be felkérést
                </Button>
              </Link>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <RulesPoliciesSection />
          <ContactSection />
          <PostscriptSection />
        </div>
      </div>
      <Footer />
    </div>
  );
}

LandingPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
