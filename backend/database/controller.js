const { connection } = require("./mysql");
const {
  hashPassword,
  comparePassword,
} = require("../authentication/authentication");

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
      const selectQuery = "SELECT * FROM Users WHERE user = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, [username], (error, results) => {
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
  const selectQuery = "SELECT * FROM Users WHERE user = ?";
  const insertQuery = "INSERT INTO Users (user, pass) VALUES (?, ?)";
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

const getAlbums = async () => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery =
        "SELECT albumName as Album, coverArtLink as Link, Artist, id as Id FROM Albums";
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
      const selectQuery = `
      SELECT audiofiles.FileName, audiofiles.ID, audiofiles.Artist, albums.albumName
      FROM audiofiles 
      INNER JOIN albums ON albums.albumName = audiofiles.album
      WHERE albums.id = ?
      ORDER BY 
        CASE 
          WHEN albums.album_type = 'Audiobook' THEN audiofiles.FileName 
          ELSE NULL 
        END,
        audiofiles.FileName
    `;
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject("Internal Server Error", err);
          return;
        }

        conn.query(selectQuery, [album], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          if (results.length === 0) {
            reject("Album not found");
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

const addAlbum = (albumName, coverArtLink, artist) => {
  return new Promise((resolve, reject) => {
    const selectQuery = "SELECT * FROM Albums WHERE albumName = ?";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(new Error(err));
        return;
      }
      conn.query(selectQuery, [albumName], (error, results, fields) => {
        conn.release();
        if (error) {
          console.error(error);
          reject(new Error("Internal Server Error"));
          return;
        }
        if (results.length > 0) {
          reject(new Error("Album already exists"));
          return;
        }
        resolve();
      });
    });

    const insertQuery =
      "INSERT INTO Albums (albumName, coverArtLink, Artist) VALUES (?, ?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(new Error(err));
        return;
      }

      const values = [albumName, coverArtLink, artist];

      conn.query(insertQuery, values, (error, results, fields) => {
        conn.release();
        if (error) {
          console.error(error);
          reject(new Error(error));
          return;
        }
        resolve();
      });
    });
  });
};

module.exports = {
  addAudio,
  getAudio,
  getUser,
  addUser,
  getAlbums,
  getAlbum,
  addAlbum,
};
