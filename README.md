# Czechibank

Super simple application for showcase how API works. It is for Czechitas lecture during DA2024
Techstack: NextJS (Typescript) + Prisma + Auth.js (email)

- Check Postman collection what is possible.
- k6 script is possible to run as `k6 run -e APIKEY=yourApiKey k6-tests/script.js`

## Contains

- Docker container for Postgresql
- JS Frameworks
  - NextJS 14
  - Prisma
  - NextAuth
  - shadcn/ui
  - Tailwind

## Setup

1. Make sure, that you have `pnpm`, not `npm`
1. `cp .env.example .env` - and fill environment variables
1. Run docker image with database
   - `docker compose up -d`
1. Run script to initialize tables for NextAuth
   - `npx prisma generate && npx prisma migrate dev`
1. Basic pnpm stuff
   - Install dependencies - `pnpm install`
   - Run server - `pnpm run dev`

## Frameworks + Tools

### Prisma

Prisma provides the best experience for your team to work and interact with databases. Scheme is defined in `prisma/schema.prisma`. It defines database in "pseudo code", which is easy to read and write and it provides types to Typescript.

#### Commands

1. `npx prisma generate` - [link](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
2. `npx prisma dev` - migrate changes from `schema` to database

### Better-Auth

https://www.better-auth.com/

### shadcn/ui

For quick and keep some styling, this template use [shadcn/ui](https://ui.shadcn.com/) components.

So far, this template has these components: `Avatar`, `Button`, `DropdownMenu`.

For new components, check components on official page and follow installation instructions.

### Tailwind

Template use [Tailwind](https://tailwindcss.com/docs/installation), so please check it to.

**Tip:** If you need to figure out some layouts or something, check [Flowbite](flowbite.com)

### Prettier + Husky

1. I use it everywhere and it force format style in project.

## Project structure

Check [NextJS app structure](https://nextjs.org/docs/getting-started/project-structure)

**TLDR:**

- `app/layout.tsx` is wrapper around all pages in folder
- `app/page.tsx` is like `index` for folder.
  - `/app/contact/page.tsx` is `localhost:3000/contact`
  - `/app/contact/[id]/page.tsx` is `localhost:3000/contact/someId`
  - `/app/contact/layout/` is used for all ^^ these pages
- `components` - folder for UI components (shadcn/ui + tailwind)
- `app/api` is special folder for API responses

Check how you can handle `notFound`, `error` and [others pages](https://nextjs.org/docs/getting-started/project-structure#app-routing-conventions) - it is super simple.
