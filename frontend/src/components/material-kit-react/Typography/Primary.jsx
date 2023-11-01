// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
// core components
import styles from 'src/assets/jss/material-kit-react/components/typographyStyle.js';

const useStyles = makeStyles(styles);

export default function Primary(props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={classes.defaultFontStyle + ' ' + classes.primaryText}>
      {children}
    </div>
  );
}

Primary.propTypes = {
  children: PropTypes.node,
};
