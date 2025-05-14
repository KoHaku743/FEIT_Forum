const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// SQL schema for upvotes/downvotes feature
// Create votes table
const createVotesTable = `
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  item_type ENUM('thread', 'comment') NOT NULL,
  vote_type ENUM('upvote', 'downvote') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES threads(id) ON DELETE CASCADE
);
`;

// Check if column exists before adding it
const checkAndAddColumn = async (
  connection,
  tableName,
  columnName,
  columnDefinition
) => {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = ?`,
    [tableName, columnName, process.env.DB_NAME]
  );

  if (rows[0].count === 0) {
    await connection.query(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    );
  }
};

// Execute schema changes
(async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(createVotesTable);
    await checkAndAddColumn(
      connection,
      "threads",
      "vote_count",
      "INT DEFAULT 0"
    );
    await checkAndAddColumn(
      connection,
      "comments",
      "vote_count",
      "INT DEFAULT 0"
    );
  } catch (error) {
    console.error("Error setting up database schema:", error);
  } finally {
    connection.release();
  }
})();

module.exports = pool;
