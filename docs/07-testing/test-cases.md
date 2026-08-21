# Test Cases

This document describes specific test scenarios to execute and verify the system's compliance.

| Case ID | Feature | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | URL Parser | Valid TikTok URL | Recognized, highlights TikTok badge |
| **TC-02** | URL Parser | Valid Instagram Reel URL | Recognized, highlights Instagram badge |
| **TC-03** | URL Parser | Malformed string `not-a-url` | Rejected by syntax middleware, displays 422 error |
| **TC-04** | URL Parser | Unsupported platform URL `https://github.com` | Syntax valid, but platform unknown. Returns 400 error |
| **TC-05** | Rate Limit | Send 10+ requests in 1 second | Returns 429 status code, rate limit warning |
| **TC-06** | Database Fallback | Server starts with empty `.env` variables | Logs fallback warning, runs successfully with in-memory store |
| **TC-07** | Media Resolver | Click Fetch on valid YouTube link | Simulates steps 0-100%, returns stream link and plays video player |
| **TC-08** | History Log | Click Refresh on History page | Fetches current list from database and renders table |
