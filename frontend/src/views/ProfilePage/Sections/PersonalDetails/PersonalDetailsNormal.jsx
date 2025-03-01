import PropTypes from 'prop-types';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import PersonalDetails from 'views/ProfilePage/Sections/PersonalDetails/PersonalDetails';

export default function PersonalDetailsNormal({
  control,
  errors,
  disabled = false,
  isUser,
}) {
  return (
    <GridItem xs={12} sm={12} md={6}>
      <PersonalDetails
        control={control}
        errors={errors}
        disabled={disabled}
        isUser={isUser}
      />
    </GridItem>
  );
}

PersonalDetailsNormal.propTypes = {
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
