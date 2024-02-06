const { connection } = require("./mysql");

const addAudio = async (file) => {
  try {
    const insertQuery =
      "INSERT INTO AudioFiles (FileName, FileData, Timestamp) VALUES (?, ?, ?)";
    connection.getConnection((err, conn) => {
      if (err) {
        console.error(err);
        throw Error(error);
      }

      const values = [file.originalname, file.buffer, new Date()];

      conn.query(insertQuery, values, (error, results, fields) => {
        conn.release();

        if (error) {
          console.error(error);
          throw Error(error);
        }
      });
    });
  } catch (error) {}
};

const getAudio = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      const selectQuery = "SELECT * FROM AudioFiles WHERE id = ?";
      connection.getConnection((err, conn) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        conn.query(selectQuery, [id], (error, results, fields) => {
          conn.release();
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          if (results.length === 0) {
            reject("File not found");
            return;
          }
          resolve({
            fileName: results[0].FileName,
            fileData: results[0].FileData,
          });
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = { addAudio, getAudio };
