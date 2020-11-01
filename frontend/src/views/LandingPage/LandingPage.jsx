import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Header from 'components/material-kit-react/Header/Header';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import styles from 'assets/jss/material-kit-react/views/landingPage';
// Sections for this page
import RulesPoliciesSection from './Sections/RulesPoliciesSection';
import ContactSection from './Sections/ContactSection';

const useStyles = makeStyles(styles);

export default function LandingPage({ isAuthenticated, setIsAuthenticated }) {
  const classes = useStyles();
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
                <i className="fas fa-play" />
                Nézd meg korábbi videóinkat
              </Button>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <RulesPoliciesSection />
          <ContactSection />
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
