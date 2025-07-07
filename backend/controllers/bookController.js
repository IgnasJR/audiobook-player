const express = require("express");
const router = express.Router();
const connection = require("../database/mysql").connection;
const { verifyToken } = require("../authentication/jwt");
const upload = require("../middleware/multerMiddleware");
const fs = require("fs");
const path = require("path");

const audioDir =
  process.env.AUDIO_STORAGE_DIR || path.join(__dirname, "audio_files");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

router.get("/albums", async (req, res) => {
  try {
    if (!req.headers.authorization) {
      res.status(401).send("Unauthorized");
      return;
    }
    if (!verifyToken(req.headers.authorization)) {
      res.status(401).send("Unauthorized");
      return;
    }

    const albums = await getAlbums();
    res.status(200).send(albums);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/album", async (req, res) => {
  try {
    if (!req.query.album) {
      res.status(400).send("No album provided");
      return;
    }
    if (!req.headers.authorization) {
      res.status(401).send("Unauthorized");
      return;
    }
    const user = verifyToken(req.headers.authorization);
    if (!user) {
      res.status(401).send("Unauthorized");
      return;
    }
    const album = req.query.album;
    const albumData = await getAlbum(album, user.userData.id);
    res.status(200).send(albumData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/retrieve", async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).send("No id provided");
    }

    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized");
    }

    let user = verifyToken(req.headers.authorization);
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const id = req.query.id;
    let fileName, fileData;

    try {
      ({ fileName, fileData } = await getAudio(id));
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error retrieving the file");
    }

    console.log(fileName, fileData.length);
    const utf8FileName = encodeURIComponent(fileName);

    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${utf8FileName}`
    );
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileData.length - 1;

      if (
        isNaN(start) ||
        isNaN(end) ||
        start >= fileData.length ||
        end >= fileData.length ||
        start > end
      ) {
        return res.status(416).send("Requested range not satisfiable");
      }

      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileData.length}`
      );
      res.setHeader("Content-Length", chunkSize);

      return res.end(fileData.slice(start, end + 1));
    } else {
      res.setHeader("Content-Length", fileData.length);
      return res.status(200).send(fileData);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
});

router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No file uploaded.");
    }

    if (!req.body.album || !req.body.artist) {
      return res.status(400).send("Album and Artist are required fields.");
    }

    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized");
    }

    let user = verifyToken(req.headers.authorization);
    if (!user || user.userData.role !== "admin") {
      return res.status(401).send("Unauthorized. Admin access required.");
    }

    let uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const decodedName = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      const mimeType = file.mimetype;
      if (!mimeType.startsWith("audio/")) {
        return res
          .status(400)
          .send("Invalid file type. Only audio files are allowed.");
      }
      uploadedFiles.push({
        originalname: decodedName,
        buffer: file.buffer,
      });
    }

    if (req.files.length !== uploadedFiles.length) {
      throw new Error("Files not uploaded");
    }

    let album_id = await addAlbum(
      req.body.album,
      req.body.coverArtLink,
      req.body.artist
    );

    for (let i = 0; i < uploadedFiles.length; i++) {
      await addAudio(uploadedFiles[i], album_id);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send("Server unable to process files. Please try again.");
    }
  }
});

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
          albums.coverArtLink as coverArtLink,
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

          const albumInfo = {
            artist: results[0].Artist,
            albumName: results[0].albumName,
            coverArtLink: results[0].coverArtLink,
            track: results[0].track,
            trackProgress: results[0].track_progress,
            tracks: results.map((track) => ({
              fileName: track.FileName,
              id: track.ID,
            })),
          };

          resolve(albumInfo);
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
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

module.exports = router;
