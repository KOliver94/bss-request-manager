import { useTheme } from 'hooks/useTheme';

import AvatarButton from './Button/AvatarButton';
import Button from './Button/Button';
import DropdownButton from './Button/DropdownButton';
import IconButton from './Button/IconButton';
import Logo from './Logo';
import SandwichMenu from './SandwichMenu';

const Menubar = () => {
  const [darkMode, setDarkMode] = useTheme();

  const signOut = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div
      className="flex justify-content-between lg:static px-3 relative sm:px-5 surface-overlay"
      style={{ minHeight: '80px' }}
    >
      <Logo />
      <SandwichMenu />
      <div className="absolute flex-grow-1 hidden justify-content-between left-0 lg:flex lg:shadow-none lg:static shadow-2 surface-overlay top-100 w-full z-1">
        <ul className="flex flex-column lg:flex-row list-none m-0 p-0 select-none">
          <Button icon="pi-home" label="Kezdőlap" path="/" />
          <DropdownButton
            icon="pi-video"
            label="Felkérések"
            dropdownItems={[
              { icon: 'pi-bars', label: 'Lista', path: '/requests' },
              { icon: 'pi-plus', label: 'Új', path: '/requests/new' },
            ]}
          />
          <Button icon="pi-users" label="Felhasználók" path="/users" />
          <Button icon="pi-search" label="Keresés" path="/search" />
        </ul>
        <ul className="border-top-1 flex flex-column lg:border-top-none lg:flex-row list-none m-0 p-0 select-none surface-border">
          <IconButton
            icon={darkMode ? 'pi-sun' : 'pi-moon'}
            label={darkMode ? 'Világos téma' : 'Sötét téma'}
            onClick={() => setDarkMode(!darkMode)}
          />
          <IconButton
            icon="pi-sign-out"
            label="Kijelentkezés"
            onClick={() => signOut()}
          />
          <AvatarButton />
        </ul>
      </div>
    </div>
  );
};

export default Menubar;
