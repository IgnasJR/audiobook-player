const fs = require("fs");
const path = require("path");
const { connection } = require("./mysql");
const {
  hashPassword,
  comparePassword,
} = require("../authentication/authentication");
const audioDir =
  process.env.AUDIO_STORAGE_DIR || path.join(__dirname, "audio_files");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const addAudio = async (file, album) => {
  try {
    const filePath = path.join(audioDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    const insertQuery =
      "INSERT INTO audiofiles (FileName, FileDir, Timestamp, album_id) VALUES (?, ?, ?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        throw Error(err);
      }

      const values = [
        file.originalname,
        filePath,
        new Date(),
        album !== undefined ? album : -1,
      ];

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

const getAudio = async (id) => {
  try {
    const selectQuery = "SELECT * FROM audiofiles WHERE id = ?";
    return new Promise((resolve, reject) => {
      connection.getConnection((err, conn) => {
        if (err) {
          console.error('Database connection error:', err);
          return reject(new Error('Database connection error'));
        }

        conn.query(selectQuery, [id], async (error, results) => {
          conn.release();
          if (error) {
            console.error('Query error:', error);
            return reject(new Error('Query error'));
          }
          if (results.length === 0) {
            return reject(new Error('File not found'));
          }

          try {
            const fileData = await fs.readFile(results[0].FileDir);
            resolve({
              fileName: results[0].FileName,
              fileData: fileData,
            });
          } catch (fileError) {
            console.error('File read error:', fileError);
            reject(new Error('File read error'));
          }
        });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    throw new Error('Unexpected error');
  }
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

const getAlbums = async () => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery =
        "SELECT albumName as Album, coverArtLink as Link, Artist, id as Id FROM albums";
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
      SELECT audiofiles.FileName, audiofiles.ID, albums.Artist, albums.albumName
      FROM audiofiles 
      INNER JOIN albums ON albums.id = audiofiles.album_id
      WHERE albums.id = ?
      ORDER BY 
        CASE 
          WHEN albums.album_type = "Audiobook" THEN audiofiles.FileName 
          ELSE NULL 
        END,
        audiofiles.FileName`;
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
    const selectQuery = "SELECT * FROM albums WHERE albumName = ?";
    const insertQuery =
      "INSERT INTO albums (albumName, coverArtLink, Artist) VALUES (?, ?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        reject(new Error(err));
        return;
      }
      conn.query(selectQuery, [albumName], (error, results, fields) => {
        if (error) {
          conn.release();
          console.error(error);
          reject(new Error("Internal Server Error"));
          return;
        }
        if (results.length > 0) {
          conn.release();
          reject(new Error("Album already exists"));
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
          resolve(results.insertId);
        });
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
