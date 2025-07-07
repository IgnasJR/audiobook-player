const express = require("express");
const router = express.Router();
const connection = require("../database/mysql").connection;
const {
  hashPassword,
  comparePassword,
} = require("../authentication/authentication");
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
    if (!user || !(await comparePassword(password, user.password))) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }
    if (user.status === "pending") {
      res.status(403).json({ message: "User is pending approval" });
      return;
    }
    if (user.status === "deleted") {
      res.status(403).json({ message: "User has been deleted" });
      return;
    }
    const token = generateToken(user);
    res.status(200).send({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get-all-users", async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized");
    }
    let user = verifyToken(req.headers.authorization);
    if (!user || user.userData.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }
    const users = await getUsers();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/user-status/:id", (req, res) => {
  handleUserStatusUpdate(req, res, "active");
});

router.delete("/user-status/:id", (req, res) => {
  handleUserStatusUpdate(req, res, "deleted");
});

async function handleUserStatusUpdate(req, res, status) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send("Unauthorized");

    const user = verifyToken(token);
    if (!user || user.userData.role !== "admin") {
      return res.status(401).send("Unauthorized");
    }

    const userId = req.params.id;
    const result = await updateUserStatus(userId, status);

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }

    res.status(200).send("User status updated successfully");
  } catch (error) {
    console.error(error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(404).send("User not found");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
}

const updateUserStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    const updateQuery = "UPDATE users SET status = ? WHERE ID = ?";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      conn.query(updateQuery, [status, id], (error, results) => {
        conn.release();
        if (error) {
          console.error(error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });
  });
};

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
            status: results[0].status,
          });
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    const selectQuery = "SELECT * FROM users";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      conn.query(selectQuery, (error, results) => {
        conn.release();
        console.log(results);
        if (error) {
          console.error(error);
          reject(error);
          return;
        }
        const users = results.map((user) => ({
          username: user.user,
          role: user.role,
          id: user.ID,
          created: user.create_date,
          status: user.status,
        }));
        resolve(users);
      });
    });
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
