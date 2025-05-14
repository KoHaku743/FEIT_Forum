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
4. **Start the app:**

   ````sh
   # For admin dashboard (optional, if using separate admin port):   node app.js
   node admin-app.jsatabase and user.
   ```y `.env.example` to `.env` and fill in your DB credentials and session secret.
   The main app runs at [http://localhost:3000](http://localhost:3000)rovided SQL schema to create tables (`users`, `threads`, `comments`, etc).
   The admin dashboard (if enabled) runs at [http://localhost:4000/admin](http://localhost:4000/admin)
   ````

## Folder Structure

- `routes/` - Express route handlers- `app.js` - Main Express app
- `models/` - Database modelsAdmin dashboard app
- `public/` - Static files (CSS, avatars, uploads) node app.js
- `views/` - EJS templates (partials, admin, user, thread, etc)onal, if using separate admin port):

## Admin Features

- Login as admin at `/admin/login` (default: admin/admin)//localhost:3000](http://localhost:3000)
- Promote users to admin in the admin dashboard/localhost:4000/admin](http://localhost:4000/admin)
- Edit/delete any thread or comment
- Manage users
  re

## Tech Stack

- Node.js, Express, EJS
- MySQL
- Bulma CSS, Font Awesomes
- Marked.js (Markdown), KaTeX (math), emoji supportDatabase models
- `public/` - Static files (CSS, avatars, uploads)

## LicenseEJS templates (partials, admin, user, thread, etc)

MIT

- Node.js, Express, EJS
- MySQL
- Bulma CSS, Font Awesome
- Marked.js (Markdown), KaTeX (math), emoji support

## License

MIT
