import { useEffect } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';

import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import changePageTitle from 'helpers/pageTitleHelper';

import stylesModule from './LoadingPage.module.scss';

export default function LoadingPage() {
  useEffect(() => {
    changePageTitle('Betöltés...');
  }, []);

  return (
    <>
      <Parallax small filter />
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          <GridContainer justifyContent="center">
            <CircularProgress
              className={stylesModule.circularProgress}
              size={60}
            />
          </GridContainer>
        </div>
      </div>
    </>
  );
}
