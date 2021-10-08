import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
// helpers
import changePageTitle from 'helpers/pageTitleHelper';

import styles from 'assets/jss/material-kit-react/views/termsAndPrivacyPage';

const useStyles = makeStyles(styles);

export default function TermsOfServicePage({
  isAuthenticated,
  setIsAuthenticated,
}) {
  const classes = useStyles();

  useEffect(() => {
    changePageTitle('Szolgáltatási feltételek');
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
          height: 200,
          color: 'white',
        }}
      />
      <Parallax small filter image={background} />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6} className={classes.text}>
              <h2 className={classes.title}>Terms of Service</h2>
              <h3>1. Terms</h3>
              <p>
                By accessing the website at{' '}
                <Link to="/">
                  {`${window.location.protocol}//${window.location.host}/`}
                </Link>
                , you are agreeing to be bound by these terms of service, all
                applicable laws and regulations, and agree that you are
                responsible for compliance with any applicable local laws. If
                you do not agree with any of these terms, you are prohibited
                from using or accessing this site. The materials contained in
                this website are protected by applicable copyright and trademark
                law.
              </p>
              <h3>2. Use License</h3>
              <ol type="a">
                <li>
                  Permission is granted to temporarily download one copy of the
                  materials (information or software) on Budavári Schönherz
                  Stúdió&apos;s website for personal, non-commercial transitory
                  viewing only. This is the grant of a license, not a transfer
                  of title, and under this license you may not:
                  <ol type="i">
                    <li>modify or copy the materials;</li>
                    <li>
                      use the materials for any commercial purpose, or for any
                      public display (commercial or non-commercial);
                    </li>
                    <li>
                      attempt to decompile or reverse engineer any software
                      contained on Budavári Schönherz Stúdió&apos;s website;
                    </li>
                    <li>
                      remove any copyright or other proprietary notations from
                      the materials; or
                    </li>
                    <li>
                      transfer the materials to another person or
                      &quot;mirror&quot; the materials on any other server.
                    </li>
                  </ol>
                </li>
                <li>
                  This license shall automatically terminate if you violate any
                  of these restrictions and may be terminated by Budavári
                  Schönherz Stúdió at any time. Upon terminating your viewing of
                  these materials or upon the termination of this license, you
                  must destroy any downloaded materials in your possession
                  whether in electronic or printed format.
                </li>
              </ol>
              <h3>3. Disclaimer</h3>
              <ol type="a">
                <li>
                  The materials on Budavári Schönherz Stúdió&apos;s website are
                  provided on an &apos;as is&apos; basis. Budavári Schönherz
                  Stúdió makes no warranties, expressed or implied, and hereby
                  disclaims and negates all other warranties including, without
                  limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation
                  of rights.
                </li>
                <li>
                  Further, Budavári Schönherz Stúdió does not warrant or make
                  any representations concerning the accuracy, likely results,
                  or reliability of the use of the materials on its website or
                  otherwise relating to such materials or on any sites linked to
                  this site.
                </li>
              </ol>
              <h3>4. Limitations</h3>
              <p>
                In no event shall Budavári Schönherz Stúdió or its suppliers be
                liable for any damages (including, without limitation, damages
                for loss of data or profit, or due to business interruption)
                arising out of the use or inability to use the materials on
                Budavári Schönherz Stúdió&apos;s website, even if Budavári
                Schönherz Stúdió or a Budavári Schönherz Stúdió authorized
                representative has been notified orally or in writing of the
                possibility of such damage. Because some jurisdictions do not
                allow limitations on implied warranties, or limitations of
                liability for consequential or incidental damages, these
                limitations may not apply to you.
              </p>
              <h3>5. Accuracy of materials</h3>
              <p>
                The materials appearing on Budavári Schönherz Stúdió&apos;s
                website could include technical, typographical, or photographic
                errors. Budavári Schönherz Stúdió does not warrant that any of
                the materials on its website are accurate, complete or current.
                Budavári Schönherz Stúdió may make changes to the materials
                contained on its website at any time without notice. However
                Budavári Schönherz Stúdió does not make any commitment to update
                the materials.
              </p>
              <h3>6. Links</h3>
              <p>
                Budavári Schönherz Stúdió has not reviewed all of the sites
                linked to its website and is not responsible for the contents of
                any such linked site. The inclusion of any link does not imply
                endorsement by Budavári Schönherz Stúdió of the site. Use of any
                such linked website is at the user&apos;s own risk.
              </p>
              <h3>7. Modifications</h3>
              <p>
                Budavári Schönherz Stúdió may revise these terms of service for
                its website at any time without notice. By using this website
                you are agreeing to be bound by the then current version of
                these terms of service.
              </p>
              <h3>8. Governing Law</h3>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of Hungary and you irrevocably submit
                to the exclusive jurisdiction of the courts in that location.
              </p>
              <p>
                <a
                  href="https://getterms.io"
                  title="Generate a free terms of use document"
                >
                  Terms of Use created with GetTerms.
                </a>
              </p>
            </GridItem>
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}

TermsOfServicePage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
