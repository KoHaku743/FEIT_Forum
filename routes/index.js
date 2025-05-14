const express = require("express");
const pool = require("../models/db");
const router = express.Router();
const { isAuthenticated } = require("./middleware");
const multer = require("multer");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "../public/avatars") });

// Profile page (GET) - support ?user=username for public profiles
router.get("/profile", async (req, res) => {
  let user;
  let isSelf = false;
  try {
    const username = req.query.user;
    if (username) {
      const [users] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      if (!users.length) return res.status(404).send("User not found");
      user = users[0];
    } else if (req.session.user) {
      user = req.session.user;
      isSelf = true;
    } else {
      return res.redirect("/login");
    }
    const [threads] = await pool.query(
      "SELECT id, title, vote_count FROM threads WHERE user_id = ?",
      [user.id]
    );
    const [comments] = await pool.query(
      "SELECT id, body, vote_count FROM comments WHERE user_id = ?",
      [user.id]
    );
    const [karmaResult] = await pool.query(
      `SELECT SUM(vote_count) AS karma FROM (
        SELECT vote_count FROM threads WHERE user_id = ?
        UNION ALL
        SELECT vote_count FROM comments WHERE user_id = ?
      ) AS user_votes`,
      [user.id, user.id]
    );
    const karma = karmaResult[0].karma || 0;
    res.render("profile", { user, threads, comments, karma, isSelf });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Internal server error");
  }
});

// Profile update (POST)
router.post(
  "/profile",
  isAuthenticated,
  upload.single("avatar"),
  async (req, res) => {
    const userId = req.session.user.id;
    const { about, fakulta, user_group } = req.body;
    let avatar = req.file
      ? `/avatars/${req.file.filename}`
      : req.session.user.avatar;
    try {
      const connection = await pool.getConnection();
      await connection.query(
        "UPDATE users SET about = ?, fakulta = ?, user_group = ?, avatar = ? WHERE id = ?",
        [about, fakulta, user_group, avatar, userId]
      );
      // Update session user
      req.session.user.about = about;
      req.session.user.fakulta = fakulta;
      req.session.user.user_group = user_group;
      req.session.user.avatar = avatar;
      res.redirect("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Top contributors for sidebar
router.get("/top-contributors", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT u.username, u.avatar, 
        (IFNULL(SUM(t.vote_count),0) + IFNULL(SUM(c.vote_count),0)) AS karma
      FROM users u
      LEFT JOIN threads t ON t.user_id = u.id
      LEFT JOIN comments c ON c.user_id = u.id
      GROUP BY u.id
      ORDER BY karma DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top contributors" });
  }
});

module.exports = router;
