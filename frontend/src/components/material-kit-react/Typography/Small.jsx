// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
// core components
import styles from 'src/assets/jss/material-kit-react/components/typographyStyle.js';

const useStyles = makeStyles(styles);

export default function Small(props) {
  const classes = useStyles();
  const { children } = props;
  return (
    <div className={classes.defaultFontStyle + ' ' + classes.smallText}>
      {children}
    </div>
  );
}

Small.propTypes = {
  children: PropTypes.node,
};
