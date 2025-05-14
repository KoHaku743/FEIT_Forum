const pool = require("./db");

// Get all comments for a specific thread
const getCommentsForThread = async (threadId) => {
  const [comments] = await pool.query(
    `SELECT c.id, c.body, c.created_at, u.username, c.parent_id
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.thread_id = ?
     ORDER BY c.created_at DESC`,
    [threadId]
  );
  return comments;
};

// Create a new comment
const createComment = async (userId, threadId, body, parentId = null) => {
  const [result] = await pool.query(
    `INSERT INTO comments (body, user_id, thread_id, parent_id)
     VALUES (?, ?, ?, ?)`,
    [body, userId, threadId, parentId]
  );
  return result.insertId;
};

module.exports = { getCommentsForThread, createComment };
