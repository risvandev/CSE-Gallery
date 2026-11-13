# Production Setup Guide: Class Moments Gallery
**Domain:** `https://gallery.mndo.online`  
**Stack:** Pure HTML/JS + Tailwind CSS + Supabase (PostgreSQL + CDN Storage) + Google OAuth 2.0

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **"New Project"**, name it (e.g. `cseb-class-gallery`), set a secure database password, and choose a region close to your users (e.g. `Mumbai (ap-south-1)`).
3. Once the project finishes initializing (1-2 minutes):
   - Go to **Project Settings** (gear icon at bottom left) -> **API**.
   - Note down:
     - **Project URL** (e.g. `https://your-project-id.supabase.co`)
     - **anon / public key** (the long `eyJ...` token)
     - **Project Reference ID** (found in the URL: `https://supabase.com/dashboard/project/<PROJECT_REF>`)

---

## Step 2: Run the Database & Storage Script

1. In Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **"New query"**.
3. Copy the entire contents of [`supabase-schema.sql`](file:///d:/My%20Creations/CSE-B%20Gallery/supabase-schema.sql) and paste it into the editor.
4. Click **"Run"**.
   - This automatically creates the `moments` table with Row-Level-Security (RLS), creates the `class-moments` public storage bucket, and enables live Realtime updates.

---

## Step 3: Configure Google OAuth in Google Cloud Console

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Class Gallery`).
3. Set up the **OAuth Consent Screen**:
   - Go to **APIs & Services** -> **OAuth consent screen**.
   - Choose **External**, then click **Create**.
   - **App name**: `Class Gallery` (or your class name)
   - **User support email**: Your email.
   - **Authorized domains**: Add `mndo.online` and `supabase.co`.
   - **Developer contact information**: Your email.
   - Click **Save and Continue**, proceed through Scopes (default `email`, `profile`, `openid` are sufficient), and click **Back to Dashboard**.
   - *(Optional for testing)* Under **Publishing status**, you can leave it in **Testing** and add your classmates' Google emails under "Test users", or click **"Publish App"** so any student with a Google account can sign in.
4. Create **OAuth 2.0 Client Credentials**:
   - Go to **APIs & Services** -> **Credentials**.
   - Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
   - **Application type**: **Web application**
   - **Name**: `Class Gallery Web Client`
   - **Authorized JavaScript origins**:
     - `https://gallery.mndo.online`
     - `https://<YOUR_PROJECT_REF>.supabase.co`
     - `http://localhost:5500` *(for local development/testing)*
     - `http://127.0.0.1:5500` *(for local development/testing)*
   - **Authorized redirect URIs**:
     - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
   - Click **Create**.
   - Copy the **Client ID** and **Client Secret**.

---

## Step 4: Enable Google Provider in Supabase

1. In the Supabase Dashboard, go to **Authentication** -> **Providers** (left sidebar).
2. Locate **Google** and click to expand it.
3. Toggle **Enable Google provider** to ON.
4. Paste your **Client ID** and **Client Secret** obtained in Step 3.
5. Click **Save**.
6. In Supabase Dashboard, go to **Authentication** -> **URL Configuration**:
   - **Site URL**: `https://gallery.mndo.online`
   - **Redirect URLs** (add each of these):
     - `https://gallery.mndo.online/**`
     - `http://localhost:5500/**`
     - `http://127.0.0.1:5500/**`
   - Click **Save**.

---

## Step 5: Put Keys into `.env`

Open [`.env`](file:///d:/My%20Creations/CSE-B%20Gallery/.env) in your project and enter your credentials. **The frontend HTML and JS files contain zero keys.**

```env
SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_STORAGE_BUCKET=class-moments
PRODUCTION_DOMAIN=https://gallery.mndo.online
PORT=5500
```

> **Security Note:** `.env` is automatically ignored in [`.gitignore`](file:///d:/My%20Creations/CSE-B%20Gallery/.gitignore) so your secrets will never be committed to Git or exposed in the repository.

---

## Step 6: Run Locally or Deploy to `gallery.mndo.online`

### Running Locally
Run with zero dependencies (uses built-in Node.js server):
```bash
npm start
```
Open [http://localhost:5500](http://localhost:5500) in your browser. The server loads `.env` natively and serves the config dynamically via `/api/config`.

### Deploying to Production (`gallery.mndo.online`)

#### Option A: Vercel / Netlify
1. Connect your repository to Vercel or Netlify.
2. In your hosting project settings, add the Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_STORAGE_BUCKET` = `class-moments`
   - `PRODUCTION_DOMAIN` = `https://gallery.mndo.online`
3. The included [`api/config.js`](file:///d:/My%20Creations/CSE-B%20Gallery/api/config.js) automatically serves these environment variables securely to the frontend.
4. Assign your custom domain `gallery.mndo.online`.

#### Option B: Cloudflare Pages / VPS
1. Run `node server.js` behind a reverse proxy (like Cloudflare Tunnel, Nginx, or Caddy) with your domain `gallery.mndo.online`.

---

## Features Included in This Setup:
- **Instant Google Sign-In**: Verifies classmates via their Google profile.
- **Direct Cloud CDN Storage**: High-resolution photos are stored in Supabase Storage with automatic CDN delivery.
- **Dynamic Counters**: Live "Total moments" and personalized "Your uploads" counters.
- **Realtime Sync**: When another classmate uploads a photo, it appears live in the gallery and updates the counter without reloading.
- **Smooth Continuous Motion**: Hero background physics runs at 60fps with zero-lag loop math.
- **Clean Fallback**: If keys are not yet entered, the site informs the user and continues to operate smoothly in local demo mode.

