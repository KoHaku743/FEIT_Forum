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
   git clone <your-repo-url>
   cd reddit
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure the database:**

   - Create a MySQL database and user.
   - Copy `.env.example` to `.env` and fill in your DB credentials and session secret.
   - Run the provided SQL schema to create tables (`users`, `threads`, `comments`, etc).

4. **Start the app:**
   ```sh
   node app.js
   # For admin dashboard (optional, if using separate admin port):
   node admin-app.js
   ```
   The main app runs at [http://localhost:3000](http://localhost:3000)
   The admin dashboard (if enabled) runs at [http://localhost:4000/admin](http://localhost:4000/admin)

## Folder Structure

- `app.js` - Main Express app
- `admin-app.js` - Admin dashboard app
- `routes/` - Express route handlers
- `models/` - Database models
- `public/` - Static files (CSS, avatars, uploads)
- `views/` - EJS templates (partials, admin, user, thread, etc)

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
