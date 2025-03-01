import { useEffect } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router';

import Button from 'components/material-kit-react/CustomButtons/Button';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import changePageTitle from 'helpers/pageTitleHelper';
import ContactSection from 'views/LandingPage/Sections/ContactSection';
import PostscriptSection from 'views/LandingPage/Sections/PostscriptSection';
import RulesPoliciesSection from 'views/LandingPage/Sections/RulesPoliciesSection';

import stylesModule from './LandingPage.module.scss';

function LandingPage() {
  useEffect(() => {
    changePageTitle('Kezdőlap');
  }, []);

  return (
    <>
      <Parallax filter>
        <div className={stylesModule.container}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={6}>
              <h1 className={stylesModule.title}>
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
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div className={stylesModule.container}>
          <RulesPoliciesSection />
          <ContactSection />
          <PostscriptSection />
        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { LandingPage as Component };
