import Breadcrumb from './Breadcrumb/Breadcrumb';
import Menubar from './Menubar/Menubar';

const Header = () => {
  return (
    <header>
      <Menubar />
      <Breadcrumb />
    </header>
  );
};

export default Header;
