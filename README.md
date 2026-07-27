# Abba's Joy

Accessible, responsive website and publishing platform for Abba's Joy by Becca
Etudaiye.

Live site: [abbasjoy.vercel.app](https://abbasjoy.vercel.app/)

## Features

- Responsive service, tutoring, media, FAQ, and contact sections
- Accessible navigation and keyboard-friendly interactions
- Protected blog administration
- Blog post, category, and featured-image management
- Persistent publishing through Vercel Blob

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm start
```

Open `http://localhost:5510`.

## Quality checks

```bash
npm run check
npm test
```

## Deployment

The repository includes its Vercel build and serverless API configuration.
Connect a public Vercel Blob store and configure the required deployment
variables using `.env.example` as the reference.

Never commit passwords, tokens, or local `.env` files.
