import PropTypes from 'prop-types';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import PersonalDetails from './PersonalDetails';

export default function PersonalDetailsMobile({
  errors,
  touched,
  disabled,
  isUser,
}) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="personal-details-header"
      >
        <Typography>Személyes adatok</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <PersonalDetails
          errors={errors}
          touched={touched}
          disabled={disabled}
          isUser={isUser}
        />
      </AccordionDetails>
    </Accordion>
  );
}

PersonalDetailsMobile.propTypes = {
  errors: PropTypes.shape({
    last_name: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
  }).isRequired,
  touched: PropTypes.shape({
    last_name: PropTypes.bool,
    first_name: PropTypes.bool,
    email: PropTypes.bool,
    phone_number: PropTypes.bool,
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  isUser: PropTypes.bool.isRequired,
};
