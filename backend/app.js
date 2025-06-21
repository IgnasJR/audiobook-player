require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const setupRoutes = require("./controllers/index");

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupRoutes(app);

  const httpServer = http.createServer(app);
  httpServer.listen(3001, () => {
    console.log(`HTTP Server running on port 3001`);
  });
};

setup();
