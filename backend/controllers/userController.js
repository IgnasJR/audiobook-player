const express = require('express');
const router = express.Router();
const connection = require("../database/mysql").connection;
const { hashPassword, comparePassword } = require("../authentication/authentication");
const { generateToken, verifyToken } = require("../authentication/jwt");

router.post("/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      await addUser(username, password);
      res.status(200).send("Success");
    } catch (error) {
      if (error.message === "User already exists") {
        res.status(400).send("User already exists");
      } else if (error.message === "Registration Disabled") {
        res.status(403).send("Registration Disabled");
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
});

router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await getUser(username);
      console.log(user);
      if (!user || !(await comparePassword(password, user.password))) {
        res.status(400).send("Unable to authenticate user");
        return;
      }
      const token = generateToken(user);
      res.status(200).send({ token, role: user.role, username: user.username });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
});

const getUser = async (username) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT * FROM users WHERE user = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.execute(selectQuery, [username], (error, results) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          if (results.length === 0) {
            resolve(null);
            return;
          }
          resolve({
            username: results[0].user,
            password: results[0].pass,
            role: results[0].role,
            id: results[0].ID,
          });
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

const addUser = async (username, password) => {
  const selectQuery = "SELECT * FROM users WHERE user = ?";
  const insertQuery = "INSERT INTO users (user, pass) VALUES (?, ?)";
  return new Promise((resolve, reject) => {
    if (process.env.Registration_Disabled === "true") {
      reject(new Error("Registration Disabled"));
    }
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      conn.query(selectQuery, [username], async (error, results) => {
        if (error) {
          console.error(error);
          conn.release();
          reject(new Error("Internal Server Error"));
        }

        if (results.length > 0) {
          conn.release();
          reject(new Error("User already exists"));
        } else {
          const hashedPassword = await hashPassword(password);
          console.log(password, hashedPassword);
          const values = [username, hashedPassword];
          conn.query(insertQuery, values, (error, results) => {
            conn.release();
            if (error) {
              console.error(error);
              reject(error);
            } else {
              resolve(results);
            }
          });
        }
      });
    });
  });
};



module.exports = router;