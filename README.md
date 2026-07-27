# Abba's Joy

Accessible, mobile-responsive website and blog publishing service for Abba's Joy by Becca Etudaiye.

## Requirements

- Node.js 20 or newer
- A persistent filesystem on traditional Node hosting, or a public Vercel Blob
  store when deploying to Vercel

## Local setup

```bash
npm install
npm start
```

Open `http://localhost:5510`. The admin area is at `http://localhost:5510/admin.html`.

On a fresh development data directory, the initial password is `change-this-password`. Change it through the admin screen before using real content. Production refuses to start with this default.

The admin editor can upload JPG, PNG, and WebP featured images directly. Images are resized and converted to WebP in the browser when supported, validated by the server, and stored under `DATA_DIR/uploads` locally or Vercel Blob in a Vercel deployment.

If the local password is lost, reset it from the project directory:

```bash
npm run admin:reset -- "choose-a-new-password"
```

The password must contain at least 12 characters. The command updates the ignored local authentication file and does not put the password in the website source.

### Optional VS Code Live Server preview

The `.vscode/settings.json` file is not an extension. It is a project setting that tells the VS Code Live Server extension to use port `5500`.

For a visual preview, Live Server can open `http://localhost:5500`. Keep `npm start` running at the same time on port `5510` if you also want admin login, post editing, or category management to work. Opening the files with Live Server alone only provides the static pages.

## Release checks

```bash
npm run check
npm test
```

Run `npm run optimize:images` after replacing any of the source portrait or service images.

## Production configuration

Copy the variable names from `.env.example` into the deployment provider's environment settings. Do not commit a real `.env` file.

- `NODE_ENV=production`
- `ADMIN_PASSWORD`: unique initial password with at least 12 characters
- `SESSION_SECRET`: an independent random value containing at least 32 characters
- `ADMIN_RESET_KEY`: optional private reset key with at least 20 characters
- `BLOB_READ_WRITE_TOKEN`: added automatically when a public Vercel Blob store
  is connected to the project
- `DATA_DIR`: absolute path to a persistent disk directory
- `PORT`: normally supplied by the host

The `data/auth.json` file is intentionally ignored. On the first production start, the server creates a salted password record from `ADMIN_PASSWORD`. On Vercel, the record is encrypted with `SESSION_SECRET` before it is stored.

## Deployment notes

### Vercel

1. Import the GitHub repository into Vercel.
2. Create a **public** Blob store in the project's Storage tab and connect it to
   the project.
3. Add `ADMIN_PASSWORD`, `SESSION_SECRET`, and optionally `ADMIN_RESET_KEY` to
   the Production environment.
4. Deploy, open `/admin.html`, and sign in. Posts, categories, password changes,
   and uploaded images then persist in Vercel Blob.

The public Blob store is used because the uploaded blog images are public site
content. The admin password record is encrypted before storage. Never commit the
actual environment values.

### Traditional Node hosting

Use a host that supports a Node web service and a persistent volume, such as
Render, Railway, Fly.io, or a VPS. Point `DATA_DIR` at the mounted volume, use
`/api/health` as the health-check path, run `npm ci --omit=dev`, and start with
`npm start`.

After deployment, verify the home page, `/blog.html`, `/admin.html`, and `/api/health`, then log in and publish/delete a temporary test post.
