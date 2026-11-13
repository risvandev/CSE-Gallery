# CSE-B Class Gallery 📸

A simple, lightweight place for our class to share and look back at our college moments together.

Live site: [gallery.mndo.online](https://gallery.mndo.online)

---

### What it does

- **Open gallery**: Anyone can visit and browse class photos without signing in.
- **Google login for uploads**: Sign in with your college/personal Google account to add your photos. Keeps things clean and tags who uploaded what.
- **Fast & responsive**: Works smoothly on phones and laptops with real-time updates when someone adds a new picture.

---

### Tech behind it

- Vanilla HTML, Tailwind CSS, JavaScript
- Supabase (PostgreSQL for data, Storage for high-res images)
- Google OAuth 2.0
- Node.js zero-dependency static server

---

### Running locally

1. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open `http://localhost:5500` in your browser.
