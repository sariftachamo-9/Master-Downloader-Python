# Troubleshooting Guide

Solutions to common issues encountered during testing or deployment.

## 1. Render Backend Cold Starts
* **Symptom:** The first request takes 50-70 seconds to respond, or the API status badge in the navbar shows `offline` for the first minute.
* **Reason:** Render's free tier spins down services after 15 minutes of inactivity.
* **Solution:** Wait 60 seconds and refresh the browser. The service will boot up and turn `online`.

## 2. CORS Block Errors
* **Symptom:** Browser console prints `Access to fetch at ... blocked by CORS policy`.
* **Reason:** The backend origin whitelist doesn't allow your static site URL.
* **Solution:** Verify the backend whitelists origin domains in `server.js` or set `cors` parameter to allow all origins (`*`) during test runs.

## 3. Database Warnings
* **Symptom:** Node console prints `WARNING: Supabase URL and/or Anon Key not configured`.
* **Reason:** Environment variables are missing or incorrectly read.
* **Solution:** Verify your `.env` contains exact keys (without spaces). If deployed on Render, double check the environment secret variable inputs.
