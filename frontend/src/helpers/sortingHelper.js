import { isSelf } from 'src/api/loginApi';

function moveOwnUserToTop(listOfUsers) {
  listOfUsers.unshift(
    listOfUsers.splice(
      listOfUsers.findIndex((user) => isSelf(user.id)),
      1,
    )[0],
  );
  return listOfUsers;
}

export default moveOwnUserToTop;
