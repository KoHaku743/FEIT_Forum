# FEIT Forum (Reddit Clone)

A modern forum web application inspired by Reddit, built with Node.js, Express, EJS, and MySQL. Features Markdown/KaTeX support, emoji, user authentication, voting, threaded comments, and a full-featured admin dashboard.

## Features

- User registration, login, and profile with avatar
- Create, edit, and delete threads and comments
- Markdown and KaTeX math rendering in posts/comments
- Emoji support (e.g. `:smile:`)
- Voting on threads and comments
- Search threads
- Admin dashboard:
  - Promote users to admin
  - Edit/delete any thread or comment
  - Manage users
- Responsive UI with Bulma CSS

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/KoreanPizzaGuy/FEIT_Forum.git
   cd FEIT_Forum
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure the database:**
   - Run the provided SQL schema to create tables (`users`, `threads`, `comments`, etc).

## MySQL Database Setup

1. Log in to MySQL:
   ```sh
   mysql -u root -p
   ```
2. Create the database and user (customize names and password as needed):
   ```sql
   CREATE DATABASE feit_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'forum_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON feit_forum.* TO 'forum_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Import the database schema (see the included `schema.sql` file):
   ```sh
   mysql -u forum_user -p feit_forum < schema.sql
   ```
4. Copy `.env.example` to `.env` and fill in your DB credentials and session secret.

You can now continue with the installation steps above.

4. **Start the app:**

   ```sh
   # For admin dashboard (optional, if using separate admin port):
   node app.js
   node admin-app.js
   ```

   The main app runs at [http://localhost:3000](http://localhost:3000)
   The admin dashboard (if enabled) runs at [http://localhost:4000/admin](http://localhost:4000/admin)

## Folder Structure

- `routes/` - Express route handlers
- `models/` - Database models
- `public/` - Static files (CSS, avatars, uploads)
- `views/` - EJS templates (partials, admin, user, thread, etc)
- `app.js` - Main Express app
- `admin-app.js` - Admin dashboard app

## Admin Features

- Login as admin at `/admin/login` (default: admin/admin)
- Promote users to admin in the admin dashboard
- Edit/delete any thread or comment
- Manage users

## Tech Stack

- Node.js, Express, EJS
- MySQL
- Bulma CSS, Font Awesome
- Marked.js (Markdown), KaTeX (math), emoji support

## License

MIT
