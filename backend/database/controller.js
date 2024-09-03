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

const getTrackProgress = (bookId, userId) => {
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return reject(err);
      }

      conn.query(
        'SELECT * FROM progress WHERE user_id = ? AND book_id = ?',
        [userId, bookId],
        (err, rows) => {
          conn.release();
          if (err) {
            console.error('Error selecting progress:', err);
            return reject(err);
          }

          if (rows.length === 0) {
            console.log('Track progress not found');
            return resolve({
              track: 0,
              progress: 0,
            });
          } else {
            console.log('Track progress retrieved successfully');
            console.log(rows[0].track, rows[0].track_progress);
            return resolve({
              track: rows[0].track,
              progress: rows[0].track_progress,
            });
          }
        }
      );
    });
  });
};




const saveTrackProgress = (bookId, userId, track, progress,) => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.error('Error getting connection:', err);
    }

    conn.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        conn.release();
        return callback(err);
      }

      conn.query(
        'SELECT * FROM progress WHERE user_id = ? AND book_id = ?', [userId, bookId], (err, rows) => {
          if (err) {
            console.error('Error selecting progress:', err);
            conn.rollback(() => {
              conn.release();
            });
            return;
          }
          let query;
          if (rows.length > 0) {
            query = 'UPDATE progress SET track = ?, track_progress = ? WHERE user_id = ? AND book_id = ?';
          } else {
            query = 'INSERT INTO progress (track, track_progress, user_id, book_id) VALUES (?, ?, ?, ?)';
          }

          conn.query(query, [track, progress, userId, bookId], (err) => {
            if (err) {
              console.error('Error updating or inserting progress:', err);
              conn.rollback(() => {
                conn.release();
              });
              return;
            }

            conn.commit((err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                conn.rollback(() => {
                  conn.release();
                });
                return;
              }

              console.log('Track progress saved successfully');
              conn.release();
            });
          });
        }
      );
    });
  });
};


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
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT * FROM audiofiles WHERE id = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          return reject(err);
        }

        conn.query(selectQuery, [id], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            return reject(error);
          }
          if (results.length === 0) {
            return reject("File not found");
          }
          const fileData = fs.readFileSync(results[0].FileDir);
          return resolve({
            fileName: results[0].FileName,
            fileData: fileData,
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

const getAlbum = async (album, user_id) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = `
        SELECT 
          audiofiles.FileName, 
          audiofiles.ID, 
          albums.Artist, 
          albums.albumName,
          IFNULL(progress.track, 0) AS track,
          IFNULL(progress.track_progress, 0) AS track_progress
        FROM 
          audiofiles 
        INNER JOIN 
          albums ON albums.id = audiofiles.album_id
        LEFT JOIN 
          progress ON progress.book_id = albums.id AND progress.user_id = ?
        WHERE 
          albums.id = ?
        ORDER BY 
          CASE 
            WHEN albums.album_type = 'Audiobook' THEN audiofiles.FileName 
            ELSE audiofiles.ID
          END;
      `;

      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject("Internal Server Error");
          return;
        }

        conn.query(selectQuery, [user_id, album], (error, results) => {
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
  saveTrackProgress,
  getTrackProgress,
};
