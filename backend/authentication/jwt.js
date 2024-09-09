const jsonwebtoken = require("jsonwebtoken");

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  const userData = {
    username: user.username,
    role: user.role,
    id: user.id,
  };
  const token = jsonwebtoken.sign({ userData }, secret, { expiresIn: "1d" });
  return token;
}

const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken.verify(token, secret);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

const decodeToken = (token) => {
  return jsonwebtoken.decode(token).user;
};

module.exports = { generateToken, verifyToken, decodeToken };
