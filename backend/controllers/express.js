const upload = require("../middleware/multerMiddleware");
const {
  addAudio,
  getAudio,
  getAlbums,
  getAlbum,
  addAlbum,
  addUser,
  getUser,
} = require("../database/controller");
const {
  comparePassword,
  hashPassword,
} = require("../authentication/authentication");
const { generateToken } = require("../authentication/jwt");

const setupExpress = (app) => {
  app.get("/api/retrieve", async (req, res) => {
    try {
      if (!req.query.id) {
        res.status(400).send("No id provided");
        return;
      }

      const id = req.query.id;
      const { fileName, fileData } = await getAudio(id);

      console.log(fileName, fileData.length);
      const utf8FileName = encodeURIComponent(fileName);

      res.setHeader(
        "Content-Disposition",
        `inline; filename*=UTF-8''${utf8FileName}`
      );
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", fileData.length);
      res.setHeader("Accept-Ranges", "bytes");

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileData.length - 1;
        const chunkSize = end - start + 1;

        res.status(206);
        res.setHeader(
          "Content-Range",
          `bytes ${start}-${end}/${fileData.length}`
        );
        res.setHeader("Content-Length", chunkSize);

        res.end(fileData.slice(start, end + 1));
      } else {
        res.send(fileData);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/upload", upload.array("files"), async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No file uploaded.");
    }

    try {
      let uploadedFiles = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const mimeType = file.mimetype;
        if (!mimeType.startsWith("audio/")) {
          return res
            .status(400)
            .send("Invalid file type. Only audio files are allowed.");
        }
        uploadedFiles.push({
          originalname: file.originalname,
          buffer: file.buffer,
        });
      }

      if (req.files.length !== uploadedFiles.length) {
        throw new Error("Files not uploaded");
      }

      await addAlbum(req.body.album, req.body.coverArtLink, req.body.artist);

      for (let i = 0; i < uploadedFiles.length; i++) {
        await addAudio(uploadedFiles[i], req.body.artist, req.body.album);
      }
    } catch (error) {
      console.error(error);
      res.status(400).send("Server unable to process files. Please try again.");
    }
    res.status(200).send("Success");
  });

  app.get("/api/albums", async (req, res) => {
    try {
      const albums = await getAlbums();
      res.status(200).send(albums);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/album", async (req, res) => {
    try {
      console.log(req.query.album);
      if (!req.query.album) {
        res.status(400).send("No album provided");
        return;
      }
      const album = req.query.album;
      const albumData = await getAlbum(album);
      res.status(200).send(albumData);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/register", async (req, res) => {
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

  app.post("/api/login", async (req, res) => {
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
};
module.exports = { setupExpress };
