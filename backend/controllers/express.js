const upload = require("../middleware/multerMiddleware");
const {
  addAudio,
  getAudio,
  getAlbums,
  getAlbum,
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
      res.status(200).send(fileData);
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
};

module.exports = { setupExpress };
