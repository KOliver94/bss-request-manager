import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
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
  disabled: PropTypes.bool,
  isUser: PropTypes.bool.isRequired,
};

PersonalDetailsMobile.defaultProps = {
  disabled: false,
};
