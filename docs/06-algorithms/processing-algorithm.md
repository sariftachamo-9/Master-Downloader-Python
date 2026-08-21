# Media Processing Algorithm

This document outlines the end-to-end request processing flow for downloading authorized social media media.

## 1. Sequence Diagram
```
Client                 API Server               Supabase DB           Media Provider
  │                         │                        │                      │
  │── POST /api/download ──►│                        │                      │
  │                         │── Check URL Syntax ───►│                      │
  │                         │── Detect Platform ────►│                      │
  │                         │                        │                      │
  │                         │── Insert request ─────►│                      │
  │                         │   (status: 'pending')  │                      │
  │                         │                        │                      │
  │                         │── Update request ─────►│                      │
  │                         │  (status: 'processing')│                      │
  │                         │                        │                      │
  │                         │────────────────────────┼─────────────────────►│
  │                         │                        │   Fetch public video │
  │                         │◄───────────────────────┼──────────────────────│
  │                         │   Return Direct Link   │                      │
  │                         │                        │                      │
  │                         │── Update request ─────►│                      │
  │                         │   (status: 'completed')│                      │
  │                         │                        │                      │
  │                         │── Insert history ─────►│                      │
  │                         │                        │                      │
  │◄── Return media link ───│                        │                      │
  │    (Direct Sample MP4)  │                        │                      │
```

## 2. Ethical and Zero-Storage Policy Details
1. **Compliance Boundaries:** The system refuses private-content requests (which fail during provider fetching or URL validation checks).
2. **Zero Permanent Storage:** The backend API generates direct download targets and stream links, bypassing any local caching or writing tasks. Render's local drive storage remains clean.
3. **Failure Logging:** In case extraction fails (e.g. rate limit hit, restricted age gating), the database request is marked as `failed` with the corresponding `error_message`, and the frontend reports a clean warning block.
