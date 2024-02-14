const argon2 = require("argon2");
const { generateToken } = require("./jwt");
var crypto = require("crypto");

const hashPassword = async (password, username) => {
  return await argon2.hash(password);
};

const comparePassword = async (password, hash) => {
  return await argon2.verify(hash, password);
};

module.exports = { hashPassword, comparePassword };
