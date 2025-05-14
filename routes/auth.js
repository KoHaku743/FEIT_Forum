const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../models/db");
const router = express.Router();

// Show signup form
router.get("/signup", (req, res) => {
  res.render("signup", { user: req.session.user || null });
});

// Handle signup
router.post("/signup", async (req, res) => {
  const { username, password, avatar, fakulta, user_group } = req.body;
  const cleanUsername = username.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      "INSERT INTO users (username, password_hash, avatar, fakulta, user_group) VALUES (?, ?, ?, ?, ?)",
      [
        cleanUsername,
        hash,
        avatar || "default-avatar.png",
        fakulta || "",
        user_group || "",
      ]
    );
    res.redirect("/login");
  } catch (err) {
    res.send("Username already taken");
  }
});

// Show login form
router.get("/login", (req, res) => {
  res.render("login", { user: req.session.user || null });
});

// Handle login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = username.trim().toLowerCase();
  const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
    cleanUsername,
  ]);
  if (
    users.length > 0 &&
    (await bcrypt.compare(password, users[0].password_hash))
  ) {
    req.session.user = users[0];
    res.redirect("/");
  } else {
    res.send("Invalid login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
