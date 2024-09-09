const argon2 = require("argon2");

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const comparePassword = async (password, hash) => {
  if (typeof hash !== "string" || hash.trim() === "") {
    throw new Error("Invalid hash");
  }
  return await argon2.verify(hash, password);
};

module.exports = { hashPassword, comparePassword };
