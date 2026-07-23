# Deploy CampusPerks on Vercel

This project is a frontend-only Next.js, React, TypeScript, and Tailwind CSS
site. It uses mock data and does not require environment variables, a database,
authentication, maps, payments, or any external service.

## Option 1: Import from GitHub

1. Create a new empty GitHub repository.
2. Upload the project files to that repository. Do not upload `node_modules`,
   `.next`, `dist`, or `.sites-runtime`.
3. In Vercel, choose **Add New → Project**.
4. Connect GitHub if needed, then select the CampusPerks repository.
5. Vercel should detect **Next.js** automatically.
6. Leave the root directory as `./`.
7. The included `vercel.json` tells Vercel to run `npm run build:vercel`.
8. Click **Deploy**.

No environment variables are needed for this first version.

## Option 2: Vercel CLI

Install dependencies and verify the Vercel build locally:

```bash
npm install
npm run dev:vercel
```

Then deploy:

```bash
npm install -g vercel
vercel
```

Follow the prompts, then run `vercel --prod` when you are ready to publish the
same project as the production deployment.

## Change the placeholder domain

Before launching under a real domain, replace every instance of:

```text
https://www.campusperks.example
```

Update it in:

- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- the Organization structured data in `app/page.tsx`

Use the final production URL, such as `https://campusperks.com`.

## Where to edit content

- Colleges, featured brands, categories, benefits, verification labels, and
  demo discounts: `data/mock-data.ts`
- Homepage section order: `app/page.tsx`
- Colors, spacing, responsive rules, shadows, and typography:
  `app/globals.css`
- Reusable interface pieces: `components/`
- Placeholder pages: `app/[...slug]/page.tsx`
- College placeholder page: `app/colleges/[slug]/page.tsx`

## Important launch note

The business names and deals shown on the homepage are clearly labeled sample
or demo data. Replace or verify every listing before presenting it as an active
student discount.
