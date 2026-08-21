# Deployment Guide

This guide describes how to deploy the Multi-Platform Social Media Downloader system to Render and Supabase.

## 1. Supabase PostgreSQL Configuration
1. Log into [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** panel.
4. Paste and execute the contents of `database/schema.sql` to initialize the database tables.
5. (Optional) Run `database/seed.sql` to populate sample data.
6. Retrieve your **Project URL** and **API Anon Key** from project settings.

## 2. Deploying Express Backend on Render
1. Log into [Render Dashboard](https://render.com).
2. Create a **New Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Go to **Environment Variables** and add:
   - `PORT` = `10000`
   - `SUPABASE_URL` = *(your Supabase URL)*
   - `SUPABASE_ANON_KEY` = *(your Supabase Anon Key)*
6. Copy the compiled public URL (e.g. `https://social-video-api.onrender.com`).

## 3. Deploying React Frontend on Render
1. Create a **New Static Site** in Render.
2. Connect your GitHub repository.
3. Configure the site:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under Environment Variables:
   - `VITE_API_URL` = *(your Render backend URL from Step 2)*
5. Trigger build. Once online, access the URL (e.g. `https://social-video-downloader.onrender.com`).
