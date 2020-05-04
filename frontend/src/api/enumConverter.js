export function requestEnumConverter(status) {
  switch (status) {
    case 0:
      return 'Elutasítva';
    case 1:
      return 'Felkérés';
    case 2:
      return 'Elvállalva';
    case 3:
      return 'Leforgatva';
    case 4:
      return 'Beírva';
    case 5:
      return 'Megvágva';
    case 6:
      return 'Archiválva';
    case 7:
      return 'Lezárva';
    case 9:
      return 'Szervezők által lemondva';
    case 10:
      return 'Meghíusult';
    default:
      return '';
  }
}

export function videoEnumConverter(status) {
  switch (status) {
    case 1:
      return 'Vágásra vár';
    case 2:
      return 'Vágás alatt';
    case 3:
      return 'Megvágva';
    case 4:
      return 'Kikódolva';
    case 5:
      return 'Közzétéve';
    case 6:
      return 'Lezárva';
    default:
      return '';
  }
}
