# 3D Portfolio (React + Vite + React Three Fiber + Framer Motion)

Pages: home (hero, about, projects, 3D desk, contact), `/project/<slug>` detail pages, `/admin` editor.

## Run locally
    npm install
    npm run dev        # http://localhost:5173

Locally, /admin saves to your browser only (the API runs on Vercel). To test the real API locally use `vercel dev`.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. vercel.com -> Add New Project -> import the repo -> Deploy.
3. In the project, open Storage -> create an Upstash Redis (free) database and connect it to the project.
   Vercel adds the connection variables (KV_REST_API_URL, KV_REST_API_TOKEN) automatically.
4. Settings -> Environment Variables -> add ADMIN_PASSWORD with a strong password of your choice.
5. Redeploy (Deployments -> ... -> Redeploy) so the new variables are picked up.
6. Open https://your-site.vercel.app/admin, log in, edit, press "Save and publish".

## Colours / defaults
Colours: CSS variables at the top of `src/styles.css`.
Placeholder content before your first save: `src/data.js`.
