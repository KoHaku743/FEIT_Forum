const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Disable HSTS to prevent automatic HTTPS redirection
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Keep for existing inline scripts, but consider refactoring them
          "blob:",
          "https://cdn.jsdelivr.net", // For KaTeX and potentially other CDN-hosted scripts
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Keep for existing inline styles
          "blob:",
          "https://cdnjs.cloudflare.com", // For Font Awesome
          "https://cdn.jsdelivr.net", // For KaTeX CSS
          "https://fonts.googleapis.com", // For Google Fonts
        ],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: [
          "'self'",
          "data:",
          "https://cdnjs.cloudflare.com", // For Font Awesome fonts
          "https://cdn.jsdelivr.net", // For KaTeX fonts
        ],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: false, // Disable HTTP Strict Transport Security
  })
);

// View engine
app.set("view engine", "ejs");

// Routes
const indexRoutes = require("./routes/index");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const threadRoutes = require("./routes/threads");
app.use("/", threadRoutes);

const commentRoutes = require("./routes/comments");
app.use("/comments", commentRoutes);

const voteRoutes = require("./routes/votes");
app.use("/votes", voteRoutes);

// Start server
app.listen(3000, () => {
  console.log("Uniza forum running on http://localhost:3000");
});
