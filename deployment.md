# Deployment & Infrastructure Guide

This document provides a comprehensive, step-by-step guide to deploying the entire AUR ecosystem from a single GitHub Monorepo.

The architecture consists of 4 separate instances hosted on [Render](https://render.com/):
1. **AUR Main Portal** (Web Service)
2. **UniLink Hub** (Web Service)
3. **Erasmus+ Portal** (Static Site)
4. **Work & Travel Portal** (Static Site)

---

## 1. Monorepo Setup (GitHub)

1. Create a new repository on GitHub.
2. Push the root directory (containing all 4 folders, `README.md`, `deployment.md`, and `.gitignore`) to the `main` branch.

---

## 2. Database Setup (Neon PostgreSQL)

The `unilink` hub requires a PostgreSQL database to store user accounts and tracker data.
1. Create a free account at [Neon.tech](https://neon.tech/).
2. Create a new project (e.g., `aur-unilink`).
3. Copy the **Postgres Connection String** from the dashboard. It will look like:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
4. Save this string; you will need it when configuring the `unilink` Web Service in Render.

---

## 3. Google AI Studio (ApexEssay API)

UniLink's ApexEssay uses Google's Gemini AI.
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in and navigate to **Get API Key**.
3. Generate a new API key.
4. Save this key; you will need it for the `unilink` Web Service in Render.

---

## 4. Hosting Setup (Render)

Log in to [Render](https://render.com/) and connect your GitHub account. You will create 4 distinct instances, all pointing to the **same GitHub repository** but utilizing different **Root Directories**.

### Instance A: AUR Main Portal (Web Service)
1. Click **New +** > **Web Service**.
2. Select your GitHub repository.
3. **Name**: `aur-main`
4. **Root Directory**: `aliantauniversitararomana`
5. **Environment**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. **Plan**: Free
9. Click **Create Web Service**.

### Instance B: UniLink Hub (Web Service)
1. Click **New +** > **Web Service**.
2. Select your GitHub repository.
3. **Name**: `aur-unilink`
4. **Root Directory**: `unilink`
5. **Environment**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. **Plan**: Free
9. **Environment Variables**:
   - `DATABASE_URL`: *(Paste your Neon connection string here)*
   - `GEMINI_API_KEY`: *(Paste your Google AI Studio API key here)*
   - `SESSION_SECRET`: *(Enter a long, random alphanumeric string)*
10. Click **Create Web Service**.

### Instance C: Erasmus+ Portal (Static Site)
1. Click **New +** > **Static Site**.
2. Select your GitHub repository.
3. **Name**: `aur-erasmus`
4. **Root Directory**: `erasmus`
5. **Build Command**: *(Leave blank)*
6. **Publish Directory**: `.` (or leave blank depending on UI defaults, as it serves the root of the erasmus folder)
7. Click **Create Static Site**.

### Instance D: Work & Travel Portal (Static Site)
1. Click **New +** > **Static Site**.
2. Select your GitHub repository.
3. **Name**: `aur-workandtravel`
4. **Root Directory**: `workandtravel`
5. **Build Command**: *(Leave blank)*
6. **Publish Directory**: `.`
7. Click **Create Static Site**.

---

## 5. Search Engine Optimization (Google Search Console)

All four sites have been pre-configured with SEO meta tags, `robots.txt`, and `sitemap.xml`. To ensure Google indexes your sites:

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and select **URL prefix**.
3. Enter the URL provided by Render (e.g., `https://aur-main.onrender.com/`).
4. **Verify Ownership**: Since Render doesn't allow FTP, the easiest method is to use the **HTML Tag** verification. 
   *(Alternatively, if you add custom domains later, use DNS verification).*
5. Once verified, go to the **Sitemaps** tab on the left menu.
6. Enter `sitemap.xml` and click **Submit**.
7. Repeat this process for all 4 Render URLs.

*Note: The `robots.txt` files are already configured to point Google's crawlers to your sitemaps.*

---

## 6. Keeping Services Awake (UptimeRobot)

Render's free tier spins down Web Services after 15 minutes of inactivity. To prevent the "cold start" delay (which can take 1-2 minutes) for your Node.js apps (`aliantauniversitararomana` and `unilink`), use a free pinging service.

1. Create a free account at [UptimeRobot](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. **Monitor Type**: `HTTP(s)`
4. **Friendly Name**: `AUR Main Ping`
5. **URL**: `https://aur-main.onrender.com`
6. **Monitoring Interval**: 14 minutes (to ping it just before it sleeps).
7. Save the monitor.
8. Create a second monitor for UniLink:
   - **Friendly Name**: `AUR UniLink Ping`
   - **URL**: `https://aur-unilink.onrender.com`
   - **Monitoring Interval**: 14 minutes.

*Note: Static sites (Erasmus and Work & Travel) do not spin down on Render, so you do not need Uptime monitors for them.*
