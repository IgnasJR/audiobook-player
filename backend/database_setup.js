console.log("Running database setup script...");

const mysql = require("mysql2/promise");
const argon2 = require("argon2");
require("dotenv").config();

async function setupDatabase() {
  const {
    host,
    user,
    port,
    password: dbPassword,
    database,
    admin_password,
  } = process.env;

  let initialConnection;
  try {
    initialConnection = await mysql.createConnection({
      host,
      user,
      port,
      password: dbPassword,
    });

    await initialConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\``
    );
    console.log("Database created or already exists.");

    const pool = mysql.createPool({
      host,
      user,
      port,
      password: dbPassword,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        user VARCHAR(50) NOT NULL UNIQUE,
        pass VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('pending', 'active', 'deleted') DEFAULT 'pending',
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;

    await pool.query(createUsersTable);
    console.log("Users table created or already exists.");

    const hashedPassword = await argon2.hash(admin_password || "password");

    const insertAdminUser = `
      INSERT INTO users (user, pass, role, status)
      VALUES ('admin', ?, 'admin', 'active')
      ON DUPLICATE KEY UPDATE user = user;`;

    await pool.query(insertAdminUser, [hashedPassword]);
    console.log("Admin user added or already exists.");

    const insertAudioBooksTable = `
      CREATE TABLE IF NOT EXISTS albums (
        id INT AUTO_INCREMENT PRIMARY KEY,
        albumName VARCHAR(255) NOT NULL,
        Artist VARCHAR(255) NOT NULL,
        coverArtLink VARCHAR(255),
        album_type ENUM('Audiobook', 'Music') DEFAULT 'Audiobook',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;

    await pool.query(insertAudioBooksTable);
    console.log("Albums table created or already exists.");

    const audioFileTable = `
      CREATE TABLE IF NOT EXISTS audiofiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        FileName VARCHAR(255) NOT NULL,
        FileDir VARCHAR(255) NOT NULL,
        Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        album_id INT,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
      );`;

    await pool.query(audioFileTable);
    console.log("Audio files table created or already exists.");

    const progressTable = `
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        track INT DEFAULT 0,
        track_progress INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES albums(id) ON DELETE CASCADE,
        UNIQUE (user_id, book_id)
      );`;

    await pool.query(progressTable);
    console.log("Progress table created or already exists.");

    await pool.end();
    await initialConnection.end();
  } catch (err) {
    console.error("Error during database setup:", err);
    if (initialConnection) await initialConnection.end();
  }
}

setupDatabase();
