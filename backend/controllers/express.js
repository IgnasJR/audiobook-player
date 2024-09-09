const upload = require("../middleware/multerMiddleware");
const {
  addAudio,
  getAudio,
  getAlbums,
  getAlbum,
  addAlbum,
  addUser,
  getUser,
  saveTrackProgress,
  getTrackProgress,
} = require("../database/controller");
const { comparePassword } = require("../authentication/authentication");
const { generateToken, verifyToken } = require("../authentication/jwt");

const setupExpress = (app) => {

  app.get("/api/progress", async (req, res) => {
    try {
      if (!req.query.bookId) {
        return res.status(400).send("No bookId provided");
      }

      if (!req.headers.authorization) {
        return res.getProgressstatus(401).send("Unauthorized");
      }

      let user = verifyToken(req.headers.authorization);
      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      const bookId = req.query.bookId;
      let progress = await getTrackProgress(bookId, user.userData.id);
      console.log(progress)
      res.status(200).send(progress);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

  app.post("/api/saveTrackProgress", async (req, res) => {
    console.log(req.body);
    console.log(req.body.bookId);
    console.log(req.body.progress);
    console.log(req.body.track);
    try {
      if (!req.body.bookId || !req.body.track || !req.body.progress)  {
        return res.status(400).send("Invalid request. Missing required fields.");
      }

      if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized");
      }
      console.log(req.headers.authorization);
      let user = verifyToken(req.headers.authorization);
      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      await saveTrackProgress(
        String(req.body.bookId),
        user.userData.id,
        String(req.body.track),
        String(req.body.progress)
      );
      res.status(200).send("Success");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/retrieve", async (req, res) => {
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
  
        if (isNaN(start) || isNaN(end) || start >= fileData.length || end >= fileData.length || start > end) {
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
  

  app.post("/api/upload", upload.array("files"), async (req, res) => {
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

  app.get("/api/albums", async (req, res) => {
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

  app.get("/api/album", async (req, res) => {
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
