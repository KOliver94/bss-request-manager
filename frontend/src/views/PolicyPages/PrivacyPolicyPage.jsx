import { useEffect } from 'react';
import { Link } from 'react-router';
// nodejs library that concatenates classes
import classNames from 'classnames';
// core components
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
// helpers
import changePageTitle from 'src/helpers/pageTitleHelper';

import stylesModule from './PolicyPages.module.scss';

function PrivacyPolicyPage() {
  useEffect(() => {
    changePageTitle('Adatvédelmi irányelvek');
  }, []);

  return (
    <>
      <Parallax small filter />
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6} className={stylesModule.text}>
              <h2 className={stylesModule.title}>Privacy Policy</h2>
              <p>
                Your privacy is important to us. It is Budavári Schönherz
                Stúdió&apos;s policy to respect your privacy regarding any
                information we may collect from you across our website,{' '}
                <Link to="/">
                  {`${window.location.protocol}//${window.location.host}/`}
                </Link>
                , and other sites we own and operate.
              </p>
              <p>
                We only ask for personal information when we truly need it to
                provide a service to you. We collect it by fair and lawful
                means, with your knowledge and consent. We also let you know why
                we’re collecting it and how it will be used.
              </p>
              <p>
                We only retain collected information for as long as necessary to
                provide you with your requested service. What data we store,
                we’ll protect within commercially acceptable means to prevent
                loss and theft, as well as unauthorized access, disclosure,
                copying, use or modification.
              </p>
              <p>
                We don’t share any personally identifying information publicly
                or with third-parties, except when required to by law.
              </p>
              <p>
                Our website may link to external sites that are not operated by
                us. Please be aware that we have no control over the content and
                practices of these sites, and cannot accept responsibility or
                liability for their respective privacy policies.
              </p>
              <p>
                You are free to refuse our request for your personal
                information, with the understanding that we may be unable to
                provide you with some of your desired services.
              </p>
              <p>
                Your continued use of our website will be regarded as acceptance
                of our practices around privacy and personal information. If you
                have any questions about how we handle user data and personal
                information, feel free to contact us.
              </p>
              <h3>Types of Data Collected</h3>
              <p>
                While using Our Service, We may ask You to provide Us with
                certain personally identifiable information that can be used to
                contact or identify You. Personally identifiable information may
                include, but is not limited to:
              </p>
              <ul>
                <li>
                  <p>Email address</p>
                </li>
                <li>
                  <p>First name and last name</p>
                </li>
                <li>
                  <p>Phone number</p>
                </li>
              </ul>
              <p>
                If you sign in using your AuthSCH, Google or Microsoft account,
                we collect these data with your consent from the selected
                provider. We also store a link to your profile picture from the
                selected provider if available.
              </p>
              <h3>Use of Your Personal Data</h3>
              <p>We may use Personal Data for the following purposes:</p>
              <ul>
                <li>
                  <p>
                    <strong>To provide and maintain our Service</strong>,
                    including to monitor the usage of our Service.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>To manage Your Account:</strong> to manage Your
                    registration as a user of the Service. The Personal Data You
                    provide can give You access to different functionalities of
                    the Service that are available to You as a registered user.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>To contact You:</strong> To contact You by email,
                    telephone calls, SMS, or other equivalent forms of
                    electronic communication, such as a mobile
                    application&apos;s push notifications regarding updates or
                    informative communications related to the functionalities or
                    contracted services, including the security updates, when
                    necessary or reasonable for their implementation.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>To manage Your requests:</strong> To attend and
                    manage Your requests to Us.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>For other purposes</strong>: We may use Your
                    information for other purposes, such as data analysis,
                    identifying usage trends and to evaluate and improve our
                    Service and your experience.
                  </p>
                </li>
              </ul>
              <p>This policy is effective as of 1 January 2021.</p>
              <h2>Data Deletion Policy</h2>
              <p>
                Information may be deleted from our system upon request to{' '}
                <a href="mailto:info@bsstudio.hu">info@bsstudio.hu</a>. We
                undertake to perform the deletion within one month (30 calendar
                days) and will send you a confirmation once the information has
                been deleted. Wherever possible, we will aim to complete the
                request in advance of the deadline.
              </p>
              <p>
                Data may still remain in the systems back-up files, which will
                be deleted periodically.
              </p>
            </GridItem>
          </GridContainer>
        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { PrivacyPolicyPage as Component };
