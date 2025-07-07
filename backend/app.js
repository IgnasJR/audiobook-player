require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const setupRoutes = require("./controllers/index");

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupRoutes(app);

  if (process.env.RUN_FRONTEND === "true") {
    const buildPath = path.join(__dirname, "client", "build");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }

  const httpServer = http.createServer(app);
  httpServer.listen(3001, () => {
    console.log(`HTTP Server running on port 3001`);
  });
};

setup();
