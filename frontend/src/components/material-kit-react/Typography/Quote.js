// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
// core components
import styles from 'assets/jss/material-kit-react/components/typographyStyle.js';

const useStyles = makeStyles(styles);

export default function Quote(props) {
  const { text, author } = props;
  const classes = useStyles();
  return (
    <blockquote className={classes.defaultFontStyle + ' ' + classes.quote}>
      <p className={classes.quoteText}>{text}</p>
      <small className={classes.quoteAuthor}>{author}</small>
    </blockquote>
  );
}

Quote.propTypes = {
  text: PropTypes.node,
  author: PropTypes.node,
};
