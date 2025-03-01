import PropTypes from 'prop-types';

import PersonalDetails from 'components/RequestCreatorForm/Steps/PersonalDetails';
import RequestDetails from 'components/RequestCreatorForm/Steps/RequestDetails';
import OtherInformation from 'components/RequestCreatorForm/Steps/OtherInformation';
import Summary from 'components/RequestCreatorForm/Steps/Summary';
import Success from 'components/RequestCreatorForm/Steps/Success';

function RequestCreatorForm({
  step,
  formData,
  setFormData,
  handleNext,
  handleBack,
  setActiveStep,
  isAuthenticated,
}) {
  switch (step) {
    case 0:
      return (
        <PersonalDetails
          formData={formData}
          setFormData={setFormData}
          handleNext={handleNext}
          isAuthenticated={isAuthenticated}
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
      return (
        <Summary
          formData={formData}
          setActiveStep={setActiveStep}
          isAuthenticated={isAuthenticated}
        />
      );
    default:
      return <Success />;
  }
}

RequestCreatorForm.propTypes = {
  step: PropTypes.number.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  setActiveStep: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default RequestCreatorForm;
