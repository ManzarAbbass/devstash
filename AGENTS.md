# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and cutsom types.    

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md 
- @context/current-feature.md


<!-- BEGIN:neon-rules -->
# Neon Database — Default to Development

When working with Neon (via CLI, API, MCP, or direct queries), ALWAYS default to the **devstash** project and **development** branch. Never touch **production** unless explicitly told.

- **Project:** `bold-frog-42061604` (name: `devstash`)
- **Production branch:** `br-hidden-mud-aph4hawt` (name: `production`, primary)
- **Development branch:** `br-misty-glade-apvt2xz2` (name: `development`)
- **API key:** `{env:NEON_API_KEY}` (set in `.env` — never commit raw keys)
- **Connection string (dev branch):** `postgresql://neondb_owner:npg_xufngiPS5KC6@ep-royal-mouse-apb2wrio-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`

Usage rule:
- Any Neon query/operation → use **development** branch
- Any reference to "production" or explicit user request → use **production** branch
<!-- END:neon-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

