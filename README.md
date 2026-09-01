# Toolsy

A vendor-neutral AI tool recommendation search. Type a task, get ranked tool suggestions with live web search.

## Files

- `index.html` — the search page (static)
- `api/search.js` — serverless function that calls the Claude API with web search
- `package.json` — lists the one dependency (`@anthropic-ai/sdk`)

## Deploy steps

### 1. Get this code into a GitHub repo (no command line needed)

1. Go to github.com and log in.
2. Click the **+** in the top right → **New repository**.
3. Name it `toolsy` (or whatever you like), leave it public or private, don't add a README/gitignore (we already have one), click **Create repository**.
4. On the empty repo page, click **uploading an existing file**.
5. Drag in all three files (`index.html`, `package.json`, `README.md`) plus the `api` folder with `search.js` inside it. GitHub's uploader supports dragging a folder in modern browsers — if it doesn't pick up the folder structure, create the `api` folder first (there's an option to type a path like `api/search.js` as the filename when uploading) and upload `search.js` into it that way.
6. Click **Commit changes**.

### 2. Import into Vercel

1. From your Vercel dashboard, click **Add New → Project**.
2. Select the `toolsy` repo (you may need to click **Adjust GitHub App Permissions** if it's not listed, and grant Vercel access to the repo).
3. Leave the default settings — Vercel auto-detects this as a Node.js project with a static root and an `/api` function.
4. Click **Deploy**. It'll fail on the first try — that's expected, because the API key isn't set yet. That's fine, continue to step 3.

### 3. Add your API key

1. In the project, go to **Settings → Environment Variables**.
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key (starts with `sk-ant-`)
   - Environment: select all (Production, Preview, Development)
3. Click **Save**.
4. Go to the **Deployments** tab, click the three dots on the latest deployment, and click **Redeploy**.

### 4. Connect your domain

1. In **Settings → Domains**, type your domain name and click **Add**.
2. Vercel will show you a DNS record to add (usually an A record pointing to `76.76.21.21`, or a CNAME — Vercel tells you exactly which).
3. Go to wherever you registered your domain, find the DNS settings, and add the record Vercel showed you.
4. Wait for it to propagate (a few minutes to a few hours). Vercel's domain page will show a green check once it's live.

### 5. Test it

Visit your domain, try a few queries, make sure real results come back (not an error). If something fails, check **Deployments → [latest] → Functions → search** in Vercel for the error log.

## Notes

- The API key is never exposed to the browser — it only lives in the serverless function, set as an environment variable.
- Each search costs a small amount (web search + tokens) — see the Anthropic Console's usage page to monitor spend.
- This is a live-search-every-query setup for launch simplicity. If traffic grows, revisit caching by category to control cost.
