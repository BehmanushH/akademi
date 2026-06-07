# Akademi — Setup Guide

This guide walks you through deploying Akademi from scratch. No prior web development experience needed. Estimated time: 20–30 minutes.

---

## What you'll need

- A computer with internet access
- A GitHub account (free) — sign up at https://github.com
- A Supabase account (free) — sign up at https://supabase.com
- A Vercel account (free) — sign up at https://vercel.com

---

## Step 1: Install Node.js

Node.js lets you run the app on your own computer for testing.

1. Go to https://nodejs.org
2. Click the big green button that says **"LTS"** (recommended for most users)
3. Run the installer — click Next through everything, accept all defaults
4. When done, open a new terminal window and type: `node --version`
   - You should see something like `v20.x.x` — that means it worked

---

## Step 2: Get the code

If you have the code as a ZIP file:
1. Unzip it anywhere you like (e.g., your Desktop)
2. Open a terminal and navigate to the folder: `cd path/to/akademi`

If you're cloning from GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/akademi.git
cd akademi
```

---

## Step 3: Create a Supabase project

Supabase is the database that stores all your research data.

1. Go to https://supabase.com and click **"Start your project"**
2. Sign in with GitHub
3. Click **"New project"**
4. Fill in:
   - **Name**: `akademi` (or anything you like)
   - **Database Password**: create a strong password and save it somewhere safe
   - **Region**: pick the one closest to you
5. Click **"Create new project"** and wait about 2 minutes

---

## Step 4: Run the database migration

This creates all the tables Akademi needs.

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project in any text editor
4. Copy all the text and paste it into the Supabase SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" — that's good!

---

## Step 5: Get your API keys

1. In Supabase, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"**
3. You'll see two important values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
4. Keep this tab open — you'll need these in the next steps

---

## Step 6: Set up environment variables

1. In the `akademi` folder, find the file `.env.local.example`
2. Make a copy of it and name the copy `.env.local` (no ".example" at the end)
3. Open `.env.local` in a text editor and fill it in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Replace the placeholder values with your actual Supabase URL and anon key from Step 5.

---

## Step 7: Test locally

1. Open a terminal in the `akademi` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: http://localhost:3000
5. You should see the Akademi login page!
6. Create an account with your email and a password
7. You're in — the dashboard should load

---

## Step 8: (Optional) Load sample data

If you want to see the app with example projects and logs already filled in:

1. Open `.env.local` and add your service role key:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
   ```
   (Find this in Supabase → Settings → API → "service_role" key. Keep this secret!)

2. Run:
   ```bash
   npx tsx scripts/seed.ts
   ```

3. Refresh the app — you'll see 3 sample projects, 7 days of logs, and more.

---

## Step 9: Push to GitHub

1. Go to https://github.com/new and create a new repository
   - Name: `akademi`
   - Keep it **Private**
   - Don't add README or .gitignore (we have one already)
2. Click **"Create repository"**
3. GitHub will show you commands. In your terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/akademi.git
   git push -u origin main
   ```
4. Refresh GitHub — you should see all your files

---

## Step 10: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Find your `akademi` repository and click **"Import"**
4. On the configuration screen:
   - Framework Preset: **Next.js** (should be auto-detected)
   - Root Directory: leave as-is
5. Click **"Environment Variables"** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **"Deploy"**
7. Wait 1–2 minutes while Vercel builds your app
8. You'll get a URL like `https://akademi-xxx.vercel.app` — that's your live app!

---

## Step 11: Set your custom Vercel URL in Supabase

For auth to work correctly on your live URL:

1. Go back to Supabase → Authentication → URL Configuration
2. Set **Site URL** to your Vercel URL (e.g., `https://akademi-xxx.vercel.app`)
3. Under **Redirect URLs**, add: `https://akademi-xxx.vercel.app/**`
4. Click Save

---

## Updating the app later

Whenever you want to make changes or deploy updates:

```bash
git add .
git commit -m "describe what you changed"
git push
```

Vercel automatically redeploys whenever you push to GitHub. Usually takes under 1 minute.

---

## Troubleshooting

**"Invalid API key" error** — Double-check your `.env.local` has the correct Supabase URL and anon key. No extra spaces.

**Login doesn't redirect** — Make sure the Supabase Site URL matches exactly where you're accessing the app.

**Database errors** — Make sure you ran the SQL migration in Step 4. Try running it again — it's safe to run twice (it'll just say some tables already exist).

**App won't start locally** — Make sure Node.js is installed (`node --version`) and you ran `npm install` first.
