const express = require("express");
const pool = require("../models/db");
const { isAuthenticated } = require("./middleware");
const router = express.Router();

router.post("/:threadId", isAuthenticated, async (req, res) => {
  const { threadId } = req.params;
  const { body } = req.body;
  const parent_id = req.query.parent_id || null;
  const user_id = req.session.user.id;

  const [result] = await pool.query(
    `INSERT INTO comments (body, user_id, thread_id, parent_id) VALUES (?, ?, ?, ?)`,
    [body, user_id, threadId, parent_id]
  );

  const [rows] = await pool.query(
    `SELECT c.id, c.body, c.created_at, c.user_id, u.username, c.parent_id
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [result.insertId]
  );
  const comment = rows[0];

  if (req.headers["content-type"] === "application/json") {
    return res.json({ success: true, comment });
  }

  res.redirect(`/thread/${threadId}`);
});

router.get("/:threadId", async (req, res) => {
  const threadId = req.params.threadId;
  try {
    const [comments] = await pool.query(
      `SELECT c.*, u.username FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.thread_id = ?
             ORDER BY c.created_at ASC`,
      [threadId]
    );

    const commentMap = {};
    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(comment);
      } else {
        nestedComments.push(comment);
      }
    });

    res.json({ success: true, comments: nestedComments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching comments." });
  }
});

router.get("/comment/:id/edit", isAuthenticated, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.session.user.id;
  try {
    const [comment] = await pool.query(
      "SELECT * FROM comments WHERE id = ? AND user_id = ?",
      [commentId, userId]
    );
    if (comment.length === 0) {
      return res.status(404).send("Comment not found or unauthorized");
    }
    res.render("edit", {
      item: comment[0],
      type: "comment",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching comment for edit:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/comment/:id/edit", isAuthenticated, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.session.user.id;
  const { body } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM comments WHERE id = ? AND user_id = ?",
      [commentId, userId]
    );
    if (rows.length === 0) {
      if (req.headers["content-type"] === "application/json") {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
      return res.status(403).send("Forbidden");
    }
    await pool.query("UPDATE comments SET body = ? WHERE id = ?", [
      body,
      commentId,
    ]);
    if (req.headers["content-type"] === "application/json") {
      return res.json({ success: true });
    }
    res.redirect("back");
  } catch (error) {
    if (req.headers["content-type"] === "application/json") {
      return res.status(500).json({ success: false });
    }
    res.status(500).send("Error updating comment");
  }
});

async function deleteChildComments(commentId) {
  const [children] = await pool.query(
    "SELECT id FROM comments WHERE parent_id = ?",
    [commentId]
  );
  for (const child of children) {
    await deleteChildComments(child.id);
  }
  await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);
}

router.post("/comment/:id/delete", isAuthenticated, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.session.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT thread_id FROM comments WHERE id = ? AND user_id = ?",
      [commentId, userId]
    );
    if (rows.length === 0) {
      if (req.headers["content-type"] === "application/json") {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
      return res.status(403).send("Forbidden");
    }
    const threadId = rows[0].thread_id;
    await deleteChildComments(commentId);
    await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);
    if (req.headers["content-type"] === "application/json") {
      return res.json({ success: true });
    }
    res.redirect(`/thread/${threadId}`);
  } catch (error) {
    if (req.headers["content-type"] === "application/json") {
      return res
        .status(500)
        .json({ success: false, error: "Error deleting comment" });
    }
    res.status(500).send("Error deleting comment");
  }
});

module.exports = router;
