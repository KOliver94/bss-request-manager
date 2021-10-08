function changePageTitle(newTitle) {
  const titleBase = 'Felkéréskezelő | Budavári Schönherz Stúdió';
  document.title = newTitle ? `${newTitle} | ${titleBase}` : titleBase;
}

export default changePageTitle;
