import PropTypes from 'prop-types';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import PersonalDetails from './PersonalDetails';

export default function PersonalDetailsNormal({
  errors,
  touched,
  disabled,
  isUser,
}) {
  return (
    <GridItem xs={12} sm={12} md={6}>
      <PersonalDetails
        errors={errors}
        touched={touched}
        disabled={disabled}
        isUser={isUser}
      />
    </GridItem>
  );
}

PersonalDetailsNormal.propTypes = {
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
