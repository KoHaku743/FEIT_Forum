const express = require("express");
const pool = require("../models/db");
const { isAuthenticated } = require("./middleware");
const router = express.Router();

router.post("/vote", isAuthenticated, async (req, res) => {
  const { itemId, itemType, voteType } = req.body;
  const userId = req.session.user.id;

  if (!itemId || !itemType || !voteType) {
    return res.status(400).json({ success: false });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingVote] = await connection.query(
      "SELECT * FROM votes WHERE user_id = ? AND item_id = ? AND item_type = ?",
      [userId, itemId, itemType]
    );

    let voteChange = 0;
    if (existingVote.length > 0) {
      if (existingVote[0].vote_type === voteType) {
        await connection.query("DELETE FROM votes WHERE id = ?", [
          existingVote[0].id,
        ]);
        voteChange = voteType === "upvote" ? -1 : 1;
      } else {
        await connection.query("UPDATE votes SET vote_type = ? WHERE id = ?", [
          voteType,
          existingVote[0].id,
        ]);
        voteChange = voteType === "upvote" ? 2 : -2;
      }
    } else {
      await connection.query(
        "INSERT INTO votes (user_id, item_id, item_type, vote_type) VALUES (?, ?, ?, ?)",
        [userId, itemId, itemType, voteType]
      );
      voteChange = voteType === "upvote" ? 1 : -1;
    }

    const targetTable = itemType === "thread" ? "threads" : "comments";
    await connection.query(
      `UPDATE ${targetTable} SET vote_count = vote_count + ? WHERE id = ?`,
      [voteChange, itemId]
    );
    const [[{ vote_count }]] = await connection.query(
      `SELECT vote_count FROM ${targetTable} WHERE id = ?`,
      [itemId]
    );
    await connection.commit();
    connection.release();
    res.json({ success: true, newCount: vote_count });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
