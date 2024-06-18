const mysql = require("mysql2");

const connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  port: process.env.port,
  password: process.env.password,
  database: process.env.database,
  connectionLimit: 10,
});
module.exports = { connection };
