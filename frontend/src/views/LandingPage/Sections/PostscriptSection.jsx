import { Link } from 'react-router-dom';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
// core components
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
// logo
import logo from 'assets/img/bss_logo.png';

import styles from 'assets/jss/material-kit-react/views/landingPageSections/postscriptStyle';

const useStyles = makeStyles(styles);

export default function Postscript() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justifyContent="center">
        <GridItem xs={12} sm={12} md={8}>
          <h5 className={classes.description}>
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
