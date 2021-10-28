function moveOwnUserToTop(listOfUsers) {
  listOfUsers.unshift(
    listOfUsers.splice(
      listOfUsers.findIndex(
        (user) => user.id.toString() === localStorage.getItem('user_id')
      ),
      1
    )[0]
  );
  return listOfUsers;
}

export default moveOwnUserToTop;
