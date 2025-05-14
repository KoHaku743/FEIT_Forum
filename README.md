# FEIT Fórum (Reddit Klon)

Moderná webová aplikácia fóra inšpirovaná Redditom, postavená na Node.js, Express, EJS a MySQL. Obsahuje podporu Markdown/KaTeX, emoji, autentifikáciu používateľov, hlasovanie, vláknové komentáre a plnohodnotný admin dashboard.

## Funkcie

- Registrácia používateľa, prihlásenie a profil s avatarom
- Vytváranie, úprava a mazanie vlákien a komentárov
- Zobrazovanie Markdown a KaTeX matematiky v príspevkoch/komentároch
- Podpora emoji (napr. `:smile:`) :/ niekedy nefunguje
- Hlasovanie za vlákna a komentáre
- Vyhľadávanie vlákien
- Admin dashboard:
  - Povýšenie používateľov na adminov
  - Úprava/mazanie akéhokoľvek vlákna alebo komentára
  - Správa používateľov
- Responzívne rozhranie s Bulma CSS

## Inštalácia

1. **Klonujte repozitár:**
   ```sh
   git clone https://github.com/KoreanPizzaGuy/FEIT_Forum.git
   cd FEIT_Forum
   ```
2. **Nainštalujte závislosti:**
   ```sh
   npm install
   ```
3. **Nastavte databázu:**
   - Spustite priložený SQL súbor so schémou na vytvorenie tabuliek (`users`, `threads`, `comments`, atď).
4. **Spustite aplikáciu:**
   ```sh
   # Pre admin dashboard (voliteľné, ak používate samostatný admin port):
   node app.js
   node admin-app.js
   ```
   Skopírujte `.env.example` na `.env` a vyplňte prihlasovacie údaje k DB a session secret.
   Hlavná aplikácia beží na [http://localhost:3000](http://localhost:3000)
   Admin dashboard (ak je povolený) beží na [http://localhost:4000/admin](http://localhost:4000/admin)

## Štruktúra priečinkov

- `routes/` – Express route handlery
- `app.js` – Hlavná Express aplikácia
- `models/` – Databázové modely
- `public/` – Statické súbory (CSS, avatary, uploady)
- `views/` – EJS šablóny (partials, admin, používateľ, vlákno, atď)

## Admin funkcie

- Prihlásenie ako admin na `/admin/login` (predvolené: admin/admin)
- Povýšenie používateľov na adminov v admin dashboarde
- Úprava/mazanie akéhokoľvek vlákna alebo komentára
- Správa používateľov

## Použité technológie

- Node.js, Express, EJS
- MySQL
- Bulma CSS, Font Awesome
- Marked.js (Markdown), KaTeX (matematika), podpora emoji

## Licencia

MIT
