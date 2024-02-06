require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { setupExpress } = require("./controllers/express");

const setup = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupExpress(app);

  app.listen(3001, () => {
    console.log(`Server listening on port 3001`);
  });
};

setup();
