function compareValues(key1, order = 'asc', key2 = null) {
  return function innerSort(a, b) {
    if (
      !Object.prototype.hasOwnProperty.call(a, key1) ||
      !Object.prototype.hasOwnProperty.call(b, key1)
    ) {
      // property doesn't exist on either object
      return 0;
    }

    let varA;
    let varB;

    if (typeof a[key1] === 'object' && typeof b[key1] === 'object' && key2) {
      varA =
        typeof a[key1][key2] === 'string'
          ? a[key1][key2].toUpperCase()
          : a[key1][key2];
      varB =
        typeof b[key1][key2] === 'string'
          ? b[key1][key2].toUpperCase()
          : b[key1][key2];
    } else {
      varA = typeof a[key1] === 'string' ? a[key1].toUpperCase() : a[key1];
      varB = typeof b[key1] === 'string' ? b[key1].toUpperCase() : b[key1];
    }

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === 'desc' ? comparison * -1 : comparison;
  };
}

export default compareValues;
