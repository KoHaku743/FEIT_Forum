const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const { marked } = require("marked"); // Import marked
const markedKatex = require("marked-katex-extension"); // Import KaTeX extension
const { markedEmoji } = require("marked-emoji"); // Import Emoji extension using destructuring

// Configure marked to use extensions
marked.use(markedKatex({ throwOnError: false }));

const emojiOptions = {
  emojis: {
    smile: "😄",
    heart: "❤️",
    rocket: '🚀',
    tada: '🎉'
  },
  renderer: (token) => `<span class="emoji">${token.emoji}</span>`,
};
marked.use(markedEmoji(emojiOptions)); // Use markedEmoji with defined options

function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Helper function to nest comments
function nestComments(comments) {
  const map = {};
  comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
  const roots = [];
  comments.forEach((c) => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

// List threads with pagination and search
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    let threadsQuery = `SELECT threads.*, users.username, COALESCE(threads.vote_count,0) AS vote_count FROM threads JOIN users ON threads.user_id = users.id`;
    let countQuery = "SELECT COUNT(*) AS count FROM threads ";
    const queryParams = [];
    if (search) {
      threadsQuery += " WHERE title LIKE ? OR body LIKE ?";
      countQuery += "WHERE title LIKE ? OR body LIKE ?";
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    threadsQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);
    const [threads] = await pool.query(threadsQuery, queryParams);
    const [countResult] = await pool.query(
      countQuery,
      queryParams.slice(0, -2)
    );
    const totalThreads = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalThreads / limit);

    // Process thread bodies for Markdown
    const processedThreads = threads.map((thread) => ({
      ...thread,
      body: thread.body ? marked.parse(thread.body) : "",
    }));

    res.render("index", {
      user: req.session.user,
      threads: processedThreads || [], // Use processed threads
      currentPage: page,
      totalPages,
      search,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).send("Database error");
  }
});

// Route to render the new thread form
router.get("/threads/new", isLoggedIn, (req, res) => {
  res.render("new-thread", { user: req.session.user });
});

// Create new thread (no image upload)
router.post("/threads/new", isLoggedIn, async (req, res) => {
  const { title, body, category } = req.body;
  // IMPORTANT: Do NOT parse Markdown here. Store raw Markdown.
  // Parsing will happen when the content is fetched for display.
  await pool.query(
    "INSERT INTO threads (title, body, user_id, category) VALUES (?, ?, ?, ?)",
    [title, body, req.session.user.id, category]
  );
  res.redirect("/");
});

// View single thread
router.get("/thread/:id", async (req, res) => {
  const [threads] = await pool.query(
    `SELECT threads.*, users.username, COALESCE(threads.vote_count,0) AS vote_count FROM threads JOIN users ON threads.user_id = users.id WHERE threads.id = ?`,
    [req.params.id]
  );
  if (threads.length === 0) return res.send("Thread not found.");
  const thread = threads[0];

  // Raw Markdown is sent to thread.ejs, which handles client-side rendering.
  // NO server-side parsing for thread.body here for this specific route.
  // if (thread.body) {
  //   thread.body = marked.parse(thread.body); // This line should be removed or commented out
  // } else {
  //   thread.body = '';
  // }

  // Fetch comments for the thread (with username)
  // Ensure comments is always defined
  const [comments] = await pool.query(
    `SELECT comments.*, users.username, COALESCE(comments.vote_count,0) AS vote_count FROM comments JOIN users ON comments.user_id = users.id WHERE comments.thread_id = ? ORDER BY comments.created_at ASC`,
    [req.params.id]
  );

  const nestedComments = nestComments(comments);

  // Fallback to an empty array if no comments are found
  res.render("thread", {
    thread,
    user: req.session.user,
    comments: nestedComments || [],
  });
});

// Edit thread form
router.get("/thread/:id/edit", isLoggedIn, async (req, res) => {
  const threadId = req.params.id;
  const userId = req.session.user.id;
  const [thread] = await pool.query(
    "SELECT * FROM threads WHERE id = ? AND user_id = ?",
    [threadId, userId]
  );
  if (thread.length === 0)
    return res.status(404).send("Thread not found or unauthorized");
  res.render("edit", {
    item: thread[0],
    type: "thread",
    user: req.session.user,
  });
});

// Update thread (AJAX and fallback)
router.post("/thread/:id/edit", isLoggedIn, async (req, res) => {
  const threadId = req.params.id;
  const userId = req.session.user.id;
  const { title, body } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE threads SET title = ?, body = ? WHERE id = ? AND user_id = ?",
      [title, body, threadId, userId]
    );
    if (result.affectedRows === 0) {
      if (req.headers["content-type"] === "application/json") {
        return res.status(404).json({
          success: false,
          message: "Thread not found or unauthorized",
        });
      }
      return res.status(404).send("Thread not found or unauthorized");
    }
    if (req.headers["content-type"] === "application/json") {
      return res.json({ success: true });
    }
    res.redirect(`/thread/${threadId}`);
  } catch (error) {
    console.error("Error updating thread:", error);
    if (req.headers["content-type"] === "application/json") {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    res.status(500).send("Internal server error");
  }
});

// Delete thread (and its comments)
router.post("/thread/:id/delete", isLoggedIn, async (req, res) => {
  const threadId = req.params.id;
  const userId = req.session.user.id;
  // Delete all comments (and replies) for this thread
  await pool.query("DELETE FROM comments WHERE thread_id = ?", [threadId]);
  // Delete thread
  const [result] = await pool.query(
    "DELETE FROM threads WHERE id = ? AND user_id = ?",
    [threadId, userId]
  );
  if (result.affectedRows === 0) {
    if (req.headers["content-type"] === "application/json") {
      return res
        .status(403)
        .json({ success: false, error: "Thread not found or unauthorized" });
    }
    return res.status(403).send("Thread not found or unauthorized");
  }
  if (req.headers["content-type"] === "application/json") {
    return res.json({ success: true });
  }
  res.redirect("/");
});

module.exports = router;
