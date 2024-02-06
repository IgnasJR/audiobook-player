const upload = require("../middleware/multerMiddleware");
const { addAudio, getAudio } = require("../database/controller");

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
      res.status(200).send(fileData);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    try {
      addAudio(req.file);
    } catch (error) {
      res.status(400).send(error);
      return;
    }
    res.status(200).send("Success");
  });
};

module.exports = { setupExpress };
