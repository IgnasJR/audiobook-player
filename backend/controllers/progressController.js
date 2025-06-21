const express = require('express');
const router = express.Router();
const connection = require("../database/mysql").connection;
const { verifyToken } = require("../authentication/jwt");

router.get("/progress", async (req, res) => {
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

router.post("/saveTrackProgress", async (req, res) => {
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

const getTrackProgress = (bookId, userId) => {
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return reject(err);
      }

      conn.query(
        'SELECT * FROM progress WHERE user_id = ? AND book_id = ?',
        [userId, bookId],
        (err, rows) => {
          conn.release();
          if (err) {
            console.error('Error selecting progress:', err);
            return reject(err);
          }

          if (rows.length === 0) {
            console.log('Track progress not found');
            return resolve({
              track: 0,
              progress: 0,
            });
          } else {
            console.log('Track progress retrieved successfully');
            console.log(rows[0].track, rows[0].track_progress);
            return resolve({
              track: rows[0].track,
              progress: rows[0].track_progress,
            });
          }
        }
      );
    });
  });
};

const saveTrackProgress = (bookId, userId, track, progress,) => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.error('Error getting connection:', err);
    }

    conn.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        conn.release();
        return callback(err);
      }

      conn.query(
        'SELECT * FROM progress WHERE user_id = ? AND book_id = ?', [userId, bookId], (err, rows) => {
          if (err) {
            console.error('Error selecting progress:', err);
            conn.rollback(() => {
              conn.release();
            });
            return;
          }
          let query;
          if (rows.length > 0) {
            query = 'UPDATE progress SET track = ?, track_progress = ? WHERE user_id = ? AND book_id = ?';
          } else {
            query = 'INSERT INTO progress (track, track_progress, user_id, book_id) VALUES (?, ?, ?, ?)';
          }

          conn.query(query, [track, progress, userId, bookId], (err) => {
            if (err) {
              console.error('Error updating or inserting progress:', err);
              conn.rollback(() => {
                conn.release();
              });
              return;
            }

            conn.commit((err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                conn.rollback(() => {
                  conn.release();
                });
                return;
              }

              console.log('Track progress saved successfully');
              conn.release();
            });
          });
        }
      );
    });
  });
};

module.exports = router;