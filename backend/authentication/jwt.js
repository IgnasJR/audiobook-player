const jsonwebtoken = require("jsonwebtoken");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const token = jsonwebtoken.sign(user, secret, { expiresIn: "1d" });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jsonwebtoken.verify(token, secret);
};

const decodeToken = (token) => {
  return jsonwebtoken.decode(token).user;
};

module.exports = { generateToken, verifyToken, decodeToken };
