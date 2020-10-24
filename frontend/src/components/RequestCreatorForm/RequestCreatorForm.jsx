import PropTypes from 'prop-types';

import PersonalDetails from './Steps/PersonalDetails';
import RequestDetails from './Steps/RequestDetails';
import OtherInformation from './Steps/OtherInformation';
import Summary from './Steps/Summary';
import Success from './Steps/Success';

const RequestCreatorForm = ({
  step,
  formData,
  setFormData,
  handleNext,
  handleBack,
}) => {
  switch (step) {
    case 0:
      return (
        <PersonalDetails
          formData={formData}
          setFormData={setFormData}
          handleNext={handleNext}
        />
      );
    case 1:
      return (
        <RequestDetails
          formData={formData}
          setFormData={setFormData}
          handleNext={handleNext}
          handleBack={handleBack}
        />
      );
    case 2:
      return (
        <OtherInformation
          formData={formData}
          setFormData={setFormData}
          handleNext={handleNext}
          handleBack={handleBack}
        />
      );
    case 3:
      return <Summary formData={formData} />;
    default:
      return <Success />;
  }
};

RequestCreatorForm.propTypes = {
  step: PropTypes.number.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default RequestCreatorForm;
