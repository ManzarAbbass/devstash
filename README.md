![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel&style=flat-square)

# DevStash

A developer knowledge hub for centralizing scattered resources — commands, code snippets, prompts, notes, files, images, and links — into one organized place for quick access.

> **Live:** [https://devlstash.vercel.app](https://devlstash.vercel.app)  
> **GitHub:** [https://github.com/ManzarAbbass/devstash](https://github.com/ManzarAbbass/devstash)

---

## Features

- **AI-powered item creation** — auto-generates tags, descriptions, and suggestions via OpenRouter API
- **AI in item drawer** — code explanation, prompt/notes optimization
- **Clean dashboard** — collections, global search, and pagination
- **Item drawer** — detailed view and management of saved resources
- **Authentication** — GitHub OAuth and email via NextAuth v5
- **File management** — Supabase Storage
- **Rate limiting** — Upstash Redis
- **Subscriptions** — Stripe payment infrastructure

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19 |
| Language | TypeScript |
| Database ORM | Prisma 7 |
| Database | Neon PostgreSQL |
| Auth | NextAuth v5 |
| Styling | Tailwind CSS v4, ShadCN UI |
| AI | OpenRouter API |
| Storage | Supabase Storage |
| Rate Limiting | Upstash Redis |
| Payments | Stripe |

## Target Users

Developers and software teams who work with multiple tools and need a centralized place for their reusable resources.

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/ManzarAbbass/devstash.git
   cd devstash
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in the required values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum, set:
   - `DATABASE_URL` — your Neon PostgreSQL connection string
   - `AUTH_SECRET` — run `npx auth secret` to generate one

   See `.env.example` for all optional configuration (GitHub OAuth, Resend, Upstash, OpenRouter, Supabase, Stripe).

4. **Run database migrations**

   ```bash
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Refer to [`.env.example`](./.env.example) for the full list of available variables and their descriptions.
