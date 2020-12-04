function handleError(error) {
  if (error.code === 'ECONNABORTED') {
    return 'A kapcsolat időtúllépés miatt megszakadt.';
  }
  if (error.response) {
    if (error.response.status === 400) {
      return `Hibás kérés. ${error.response.data}`;
    }
    if (error.response.status === 401) {
      return 'Hitelesítési hiba. Kérlek jelentkezz be!';
    }
    if (error.response.status === 403) {
      return 'Nincs jogosultságod a kérés végrehajtásához.';
    }
    if (error.response.status === 404) {
      return 'A kért objektum nem található. Kérlek frissítsd az oldalt.';
    }
    if (error.response.status === 500) {
      return 'Belső szerverhiba. Kérlek próbált újra később vagy értesítsd a rendszergazdát.';
    }
    return `Nem várt hiba történt. Kérlek próbáld újra később. ${error.response.data}`;
  }
  return `Nem várt hiba történt. Kérlek próbáld újra később. ${error.message}`;
}

export default handleError;
