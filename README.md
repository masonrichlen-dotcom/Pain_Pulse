# Pain Pulse — Movement Education & Self-Management

A clinically-informed self-management app built with React + Anthropic Claude.
Deployable to Vercel in under 10 minutes.

---

## What's in this folder

```
pain-pulse/
├── api/
│   └── chat.js          ← Serverless function: proxies Anthropic API (key stays server-side)
├── public/
│   └── index.html       ← HTML entry point
├── src/
│   ├── index.js         ← React entry point
│   └── App.js           ← Full application
├── .env.example         ← Copy to .env.local and add your key
├── .gitignore           ← Keeps secrets out of version control
├── package.json         ← Dependencies and scripts
└── vercel.json          ← Vercel deployment config
```

---

## Deploy in 4 steps

### Step 1 — Get the code into GitHub

1. Create a new repository at github.com (free account is fine)
2. Upload this entire `pain-pulse/` folder to that repository
   - Easiest way: drag and drop the folder into the GitHub web UI
   - Or use: `git init && git add . && git commit -m "init" && git remote add origin YOUR_REPO_URL && git push`

### Step 2 — Connect to Vercel

1. Go to vercel.com and sign up (free — use your GitHub account)
2. Click "Add New Project"
3. Select your GitHub repository
4. Vercel detects the React app automatically — no configuration needed
5. Click "Deploy"

### Step 3 — Add your Anthropic API key

1. In your Vercel project dashboard → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-your-key-here` (get this from console.anthropic.com)
   - **Environments:** Production, Preview, Development (check all three)
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

Your app is now live at `https://your-project-name.vercel.app`

### Step 4 — Share the link

Send anyone that URL. Works on any device, any browser. No download required.

---

## Run locally (optional)

```bash
# Install dependencies
npm install

# Copy env file and add your key
cp .env.example .env.local
# Edit .env.local and paste your Anthropic API key

# Start the app
npm start
```

For local API proxying, install Vercel CLI:
```bash
npm install -g vercel
vercel dev
```
This runs both the React app and the `/api/chat` serverless function locally.

---

## Collecting feedback from early users

**Quickest setup — Google Form:**
Create a form with 3 questions and add the link to the session end screen:
1. Did the guide understand what you were dealing with? (1–5)
2. Did it feel like talking to someone who knew what they were doing? (1–5)  
3. What felt off or missing? (open text)

**Privacy-safe usage analytics:**
Add Plausible Analytics (plausible.io — $9/mo, no cookies, GDPR compliant):
```html
<!-- Add to public/index.html <head> -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```
Tracks: page views, session starts, case creation — no personal data.

---

## Updating the app

Any push to your GitHub repo automatically redeploys to Vercel.
1. Edit `src/App.js`
2. Commit and push to GitHub
3. Vercel redeploys in ~60 seconds
4. All users get the new version on next page load

---

## When to add PWA (not yet — read this first)

Add PWA when users are returning regularly and you want:
- Home screen install ("Add to Home Screen")
- Push notifications for session reminders
- Better mobile performance

**Don't add it now because:**
- Service workers cache aggressively — users can get stuck on old versions
- Offline mode breaks the AI chat (needs internet)
- Adds debugging complexity before you've validated the core experience

**When you're ready, add these two files:**

`public/manifest.json`:
```json
{
  "name": "Pain Pulse",
  "short_name": "Pain Pulse",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0D1117",
  "theme_color": "#1D9E75",
  "description": "Movement education and self-management",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add to `public/index.html` `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
```

Then add a service worker via `workbox` or `vite-plugin-pwa` when ready.

---

## Architecture

```
Browser (React)
     ↓  POST /api/chat  (no API key in browser)
Vercel Serverless Function (api/chat.js)
     ↓  POST with API key (server-side only)
Anthropic Claude API
     ↓  Response
Vercel Function → Browser → Rendered in chat
```

## Tech stack
- **Frontend:** React 18 (Create React App)
- **AI:** Anthropic Claude Sonnet 4
- **Backend:** Vercel serverless function (Node.js)
- **Hosting:** Vercel (free tier covers early usage)
- **Speech:** Web Speech API (built into browser, no cost)
- **Analytics:** Plausible (optional, $9/mo)
- **Storage:** In-memory only (state resets on page reload — persistent storage is next)

## Roadmap
- [ ] Persistent storage (localStorage → Supabase for cross-device)
- [ ] Session feedback form embedded in app
- [ ] Push notifications for session reminders (requires PWA)
- [ ] Progress export as PDF
- [ ] Rate limiting on /api/chat to control costs
