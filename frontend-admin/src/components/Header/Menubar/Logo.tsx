import logoUrl from 'assets/logo.svg';

const Logo = () => {
  return (
    <img
      alt="Budavári Schönherz Stúdió"
      className="align-self-center lg:mr-4 mr-0"
      height="40"
      src={logoUrl}
    />
  );
};

export default Logo;
