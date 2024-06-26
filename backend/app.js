require("dotenv").config();
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const { setupExpress } = require("./controllers/express");

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupExpress(app);

  const privateKey = fs.readFileSync("../ssl/key.pem", "utf8");
  const certificate = fs.readFileSync("../ssl/cert.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };

  Promise.all([privateKey, certificate])
    .then(() => {
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(3001, () => {
        console.log(`HTTPS Server running on port 3001`);
      });
    })
    .catch((error) => {
      console.error("Failed to read credentials:", error);
    });
};

setup();
