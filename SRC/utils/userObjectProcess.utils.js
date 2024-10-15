export function userToUser(user) {
  const userClone = user.toObject();
  delete userClone.password;
  delete userClone.sessionId;
  delete userClone.__v;
  delete userClone.status;
  return userClone;
}

export function userToAdmin(user) {
  const userClone = user.toObject();
  delete userClone.password;
  delete userClone.__v;
  return userClone;
}
