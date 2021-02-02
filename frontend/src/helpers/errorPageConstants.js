const errorTypes = {
  internal: {
    code: 500,
    title: 'Nem várt hiba történt',
    body:
      'Az általad végzett művelet közben nem várt hiba történt. Kérlek próbáld újra később.',
    isException: true,
  },
  notfound: {
    code: 404,
    title: 'Az oldal nem található',
    body:
      'Az általad keresett oldal nem létezik. Lehet, hogy törlésre került, megváltozott a címe vagy ideiglenesen nem elérhető.',
    isException: false,
  },
};

export default function getErrorDetails(errorType) {
  return errorTypes[errorType];
}
