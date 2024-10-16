import jwt from "jsonwebtoken";


export function generateJWT(userId, sessionId) {
  const token = jwt.sign({ _id: userId, sessionId }, process.env.LOGIN_SECRET, {
    expiresIn: "14d",
  });

  return token;
}

export function verifyJWT(JWT) {
  return jwt.verify(JWT, process.env.LOGIN_SECRET);
}
