const express = require("express");
const session = require("express-session");
const path = require("path");
const pool = require("./models/db");

const app = express();
const PORT = 4000; // Admin dashboard runs on port 4000

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "adminsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Simple admin authentication middleware
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.redirect("/admin/login");
}

// Admin navigation middleware
app.use((req, res, next) => {
  res.locals.adminNav = [
    { name: "Dashboard", url: "/admin" },
    { name: "Users", url: "/admin/users" },
    { name: "Threads", url: "/admin/threads" },
    { name: "Comments", url: "/admin/comments" },
    { name: "Logout", url: "/admin/logout" },
  ];
  next();
});

// Admin login page
app.get("/admin/login", (req, res) => {
  res.render("admin-login");
});

// Admin login handler (for demo: username 'admin', password 'admin')
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    req.session.user = { username, isAdmin: true };
    return res.redirect("/admin");
  }
  res.render("admin-login", { error: "Invalid credentials" });
});

// Admin dashboard
app.get("/admin", isAdmin, async (req, res) => {
  // Example: show thread and user counts
  const [[{ threadCount }]] = await pool.query(
    "SELECT COUNT(*) AS threadCount FROM threads"
  );
  const [[{ userCount }]] = await pool.query(
    "SELECT COUNT(*) AS userCount FROM users"
  );
  res.render("admin-dashboard", {
    user: req.session.user,
    threadCount,
    userCount,
  });
});

// List all users
app.get("/admin/users", isAdmin, async (req, res) => {
  const [users] = await pool.query(
    "SELECT id, username, is_admin, created_at FROM users"
  );
  res.render("admin-users", { user: req.session.user, users });
});

// Delete user
app.post("/admin/users/:id/delete", isAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query("DELETE FROM users WHERE id = ?", [userId]);
  res.redirect("/admin/users");
});

// Promote user to admin
app.post("/admin/users/:id/promote", isAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query("UPDATE users SET is_admin = 1 WHERE id = ?", [userId]);
  res.redirect("/admin/users");
});

// List all threads
app.get("/admin/threads", isAdmin, async (req, res) => {
  const [threads] = await pool.query(
    `SELECT threads.id, threads.title, threads.created_at, users.username FROM threads JOIN users ON threads.user_id = users.id ORDER BY threads.created_at DESC`
  );
  res.render("admin-threads", { user: req.session.user, threads });
});

// Show edit thread form
app.get("/admin/threads/:id/edit", isAdmin, async (req, res) => {
  const [[thread]] = await pool.query("SELECT * FROM threads WHERE id = ?", [
    req.params.id,
  ]);
  res.render("admin-edit-thread", { thread });
});

// Handle edit thread (now updates both title and body)
app.post("/admin/threads/:id/edit", isAdmin, async (req, res) => {
  const { title, body } = req.body;
  await pool.query("UPDATE threads SET title = ?, body = ? WHERE id = ?", [
    title,
    body,
    req.params.id,
  ]);
  res.redirect("/admin/threads");
});

// Delete thread
app.post("/admin/threads/:id/delete", isAdmin, async (req, res) => {
  const threadId = req.params.id;
  await pool.query("DELETE FROM comments WHERE thread_id = ?", [threadId]);
  await pool.query("DELETE FROM threads WHERE id = ?", [threadId]);
  res.redirect("/admin/threads");
});

// List all comments
app.get("/admin/comments", isAdmin, async (req, res) => {
  const [comments] = await pool.query(
    `SELECT comments.id, comments.body, comments.created_at, users.username, threads.title AS thread_title FROM comments JOIN users ON comments.user_id = users.id JOIN threads ON comments.thread_id = threads.id ORDER BY comments.created_at DESC`
  );
  res.render("admin-comments", { user: req.session.user, comments });
});

// Show edit comment form
app.get("/admin/comments/:id/edit", isAdmin, async (req, res) => {
  const [[comment]] = await pool.query("SELECT * FROM comments WHERE id = ?", [
    req.params.id,
  ]);
  res.render("admin-edit-comment", { comment });
});

// Handle edit comment
app.post("/admin/comments/:id/edit", isAdmin, async (req, res) => {
  const { body } = req.body;
  await pool.query("UPDATE comments SET body = ? WHERE id = ?", [
    body,
    req.params.id,
  ]);
  res.redirect("/admin/comments");
});

// Delete comment
app.post("/admin/comments/:id/delete", isAdmin, async (req, res) => {
  const commentId = req.params.id;
  await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);
  res.redirect("/admin/comments");
});

// Admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

app.listen(PORT, () => {
  console.log(`Admin dashboard running on http://localhost:${PORT}/admin`);
});
