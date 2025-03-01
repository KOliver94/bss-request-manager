import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import PersonalDetails from 'views/ProfilePage/Sections/PersonalDetails/PersonalDetails';

export default function PersonalDetailsMobile({
  control,
  errors,
  disabled = false,
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
          control={control}
          errors={errors}
          disabled={disabled}
          isUser={isUser}
        />
      </AccordionDetails>
    </Accordion>
  );
}

PersonalDetailsMobile.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.shape({
    last_name: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    profile: PropTypes.shape({ phone_number: PropTypes.string }),
  }).isRequired,
  disabled: PropTypes.bool,
  isUser: PropTypes.bool.isRequired,
};
