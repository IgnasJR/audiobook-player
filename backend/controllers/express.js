const upload = require("../middleware/multerMiddleware");
const {
  addAudio,
  getAudio,
  getAlbums,
  getAlbum,
  addAlbum,
  addUser,
} = require("../database/controller");

const setupExpress = (app) => {
  app.get("/api/retrieve", async (req, res) => {
    try {
      if (!req.query.id) {
        res.status(400).send("No id provided");
        return;
      }

      const id = req.query.id;
      const { fileName, fileData } = await getAudio(id);

      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
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

  app.post("/api/upload", upload.array("files"), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No file uploaded.");
    }
    try {
      addAlbum(req.body.album, req.body.coverArtLink);
      req.files.forEach((file) => {
        addAudio(file, req.body.artist, req.body.album);
      });
    } catch (error) {
      res.status(400).send(error);
      return;
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
      console.error(error);
      if (error.message === "User already exists") {
        res.status(400).send("User already exists");
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
  });
};

module.exports = { setupExpress };
