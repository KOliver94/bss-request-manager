import { Link } from 'react-router';

import logo from 'assets/img/bss_logo.webp';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';

import stylesModule from './PostscriptSection.module.scss';

export default function Postscript() {
  return (
    <div className={stylesModule.section}>
      <GridContainer justifyContent="center">
        <GridItem size={{ xs: 12, sm: 12, md: 8 }}>
          <h5 className={stylesModule.description}>
            Az oldal használatával elfogadod a{' '}
            <Link to="/terms">Szolgáltatási Feltételeket</Link> valamint az{' '}
            <Link to="/privacy">Adatvédelmi Irányelveket</Link>.
          </h5>
        </GridItem>
        <GridItem
          style={{
            backgroundImage: `url(${logo})`,
            height: '100px',
            marginTop: 20,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </GridContainer>
    </div>
  );
}
