const { connection } = require("./mysql");

const addAudio = async (file, artist, album) => {
  console.log("adding", file.originalname, artist, album, "to database");
  try {
    const insertQuery =
      "INSERT INTO AudioFiles (FileName, FileData, Timestamp, Artist, Album) VALUES (?, ?, ?, ?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        throw Error(error);
      }

      const values = [
        file.originalname,
        file.buffer,
        new Date(),
        artist !== undefined ? artist : "Unknown Artist",
        album !== undefined ? album : "Unknown Album",
      ];

      conn.query(insertQuery, values, (error, results, fields) => {
        conn.release();

        if (error) {
          console.error(error);
          throw Error(error);
        }
      });
    });
  } catch (error) {}
};

const getAudio = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT * FROM AudioFiles WHERE id = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, [id], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          if (results.length === 0) {
            reject("File not found");
            return;
          }
          resolve({
            fileName: results[0].FileName,
            fileData: results[0].FileData,
          });
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

const getUser = async (username) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT * FROM Users WHERE username = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, [username], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          if (results.length === 0) {
            reject("User not found");
            return;
          }
          resolve({
            username: results[0].username,
            password: results[0].password,
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
  try {
    const insertQuery = "INSERT INTO Users (username, password) VALUES (?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        throw Error(err);
      }

      const values = [username, password];

      conn.query(insertQuery, values, (error, results, fields) => {
        conn.release();
        if (error) {
          console.error(error);
          throw Error(error);
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};

const getAlbums = async () => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT DISTINCT Album, Artist FROM AudioFiles";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          resolve(results);
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

const getAlbum = async (album) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery =
        "SELECT ID, FileName, Artist FROM AudioFiles WHERE Album = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, [album], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          resolve(results);
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = { addAudio, getAudio, getUser, addUser, getAlbums, getAlbum };
