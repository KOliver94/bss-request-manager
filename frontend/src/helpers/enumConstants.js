export const requestStatuses = [
  { id: 0, text: 'Elutasítva' },
  { id: 1, text: 'Felkérés' },
  { id: 2, text: 'Elvállalva' },
  { id: 3, text: 'Leforgatva' },
  { id: 4, text: 'Beírva' },
  { id: 5, text: 'Megvágva' },
  { id: 6, text: 'Archiválva' },
  { id: 7, text: 'Lezárva' },
  { id: 9, text: 'Szervezők által lemondva' },
  { id: 10, text: 'Meghíúsult' },
];

export const videoStatuses = [
  { id: 1, text: 'Vágásra vár' },
  { id: 2, text: 'Vágás alatt' },
  { id: 3, text: 'Megvágva' },
  { id: 4, text: 'Kikódolva' },
  { id: 5, text: 'Közzétéve' },
  { id: 6, text: 'Lezárva' },
];

export const requestTypes = [
  { text: 'Zenés hangulatvideó' },
  { text: 'Zenés hangulatvideó riportokkal' },
  { text: 'Promóciós videó' },
  { text: 'Élő közvetítés' },
  { text: 'Előadás/rendezvény dokumentálás jellegű rögzítése' },
];

export const crewPositionTypes = [
  { position: 'Operatőr', category: 'Általános' },
  { position: 'Riporter', category: 'Általános' },
  { position: 'Technikus', category: 'Általános' },
  { position: 'Bejátszós-feliratozó', category: 'Élő közvetítés' },
  { position: 'Díszletes', category: 'Élő közvetítés' },
  { position: 'Fénytechnikus', category: 'Élő közvetítés' },
  { position: 'Hangtechnikus', category: 'Élő közvetítés' },
  { position: 'Képvágó', category: 'Élő közvetítés' },
  { position: 'Mikroportos', category: 'Élő közvetítés' },
  { position: 'Rendező', category: 'Élő közvetítés' },
  { position: 'Stream', category: 'Élő közvetítés' },
  { position: 'Videotechnikus', category: 'Élő közvetítés' },
];

export const userRoles = (role) => {
  switch (role) {
    case 'admin':
      return 'Adminisztrátor';
    case 'staff':
      return 'BSS Tag';
    default:
      return 'Felhasználó';
  }
};

export const avatarProviders = (provider) => {
  switch (provider) {
    case 'google-oauth2':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    default:
      return 'Gravatar';
  }
};

export const groups = (group) => {
  switch (group) {
    case 'FOSZERKESZTO':
      return 'Főszerkesztő';
    case 'GYARTASVEZETO':
      return 'Gyártásvezető';
    case 'PR':
      return 'PR felelős';
    case 'VEZETOSEG':
      return 'Vezetőségi tag';
    default:
      return group;
  }
};
