# WIF Content Platform — Setup & Deployment Guide

## Overview

This is the admin platform for managing WIF Marketing's content. It's a React + Vite Single Page Application (SPA) deployed to Cloudflare Pages, with a serverless backend via Cloudflare Pages Functions.

## Prerequisites

- Node.js 18+
- npm or yarn
- A [Cloudflare account](https://dash.cloudflare.com)
- A GitHub App with permissions on `wifgroup/wif_marketing`

## Environment Variables

Copy `.env.example` and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE` | No | API base URL (defaults to `/api`) |
| `GITHUB_APP_ID` | Yes* | GitHub App Client ID |
| `GITHUB_APP_SECRET` | Yes* | GitHub App Client Secret |
| `GITHUB_INSTALLATION_ID` | Yes* | GitHub App Installation ID |
| `GITHUB_WEBHOOK_SECRET` | Yes* | Webhook HMAC secret |
| `GITHUB_REPO` | No | Target repo (default: `wifgroup/wif_marketing`) |
| `GITHUB_BRANCH` | No | Target branch (default: `New`) |

\* Set in Cloudflare Workers environment variables, not client-side.

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# API proxy will forward /api/* to Cloudflare Workers local dev
# Note: Some API calls may fail without a running Wrangler dev server
```

## Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Or deploy manually via Wrangler CLI
npx wrangler pages deploy ./dist --project-name wif-content-platform
```

## Architecture

```
┌─────────────────────────────────────────┐
│  React + Vite (Client)                  │
│  ├── Dashboard                          │
│  ├── Blog Editor (with SEO, Media tabs) │
│  ├── Case Study Editor                  │
│  ├── Settings (Webhook config)          │
│  └── Sync Status Component              │
└─────────────────┬───────────────────────┘
                  │ API calls (fetch)
                  ▼
┌─────────────────────────────────────────┐
│  Cloudflare Pages Functions (Serverless)│
│  ├── GET  /api/content                  │
│  ├── GET  /api/content/:collection/:slug│
│  ├── POST /api/content/save-draft       │
│  ├── POST /api/content/upload-media     │
│  ├── POST /api/content/open-pr          │
│  ├── GET  /api/content/search           │
│  ├── POST /api/webhook                  │
│  └── Shared: github.js, auth.js,        │
│             kv.js, r2.js, queue.js       │
└─────────────────┬───────────────────────┘
                  │ GitHub API
                  ▼
┌─────────────────────────────────────────┐
│  GitHub (wifgroup/wif_marketing)        │
│  ├── content/blog/*.md                  │
│  ├── content/case-studies/*.md          │
│  ├── New branch (deployed to Pages)     │
│  └── Webhooks → /api/webhook            │
└─────────────────────────────────────────┘
```

## Feature: MCP Server (Optional)

The platform includes an MCP (Model Context Protocol) server at `mcp/` for AI-assisted content creation. This allows AI clients like Claude Desktop, Cursor, or Windsurf to:

- List content
- Fetch individual posts
- Save drafts
- Upload images
- Publish posts (create PRs)
- Search content
- Run SEO reports

### Usage

```bash
# Install MCP CLI
npm install -g @modelcontextprotocol/cli

# Start MCP server
npx @modelcontextprotocol/server-stdio -- node mcp/index.js
```

## Webhook Setup (GitHub)

1. Go to **GitHub → wifgroup/wif_marketing → Settings → Webhooks**
2. Click **"Add webhook"**
3. Set:
   - **Payload URL**: `https://your-wif-content-platform.com/api/webhook`
   - **Content type**: `application/json`
   - **Secret**: Use a strong random string
   - **Events**: Select *Just the push event* and *Let me select individual events* → Pull requests
4. Click **"Add webhook"**

## Security Notes

- All admin API endpoints require authentication (GitHub OAuth token)
- Webhook endpoints validate HMAC signatures when a secret is configured
- Draft content lives on separate branches and is not published until PR merge
- Media uploads validate file type (JPG/PNG/WebP/GIF) and size (5MB max)

## Cost

All services fit within Cloudflare and GitHub free tiers:

| Service | Cost |
|---------|------|
| Cloudflare Pages | Free |
| Cloudflare Workers | 100K requests/day |
| Cloudflare KV | 100K reads/day |
| Cloudflare R2 | 10GB |
| GitHub Pages + Actions | Free tier |
| **Total** | **$0/month** |