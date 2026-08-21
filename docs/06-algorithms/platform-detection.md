# Platform Detection Algorithm

This document defines how the platform service identifies matching targets.

## 1. Execution Flow
The platform detection is triggered directly after syntax checks:
```
           Cleaned URL Link
                  │
                  ▼
         Matches TikTok regex? ───► Yes ───► Return 'tiktok'
                  │ No
                  ▼
       Matches Instagram regex? ───► Yes ───► Return 'instagram'
                  │ No
                  ▼
        Matches YouTube regex? ───► Yes ───► Return 'youtube'
                  │ No
                  ▼
       Matches Facebook regex? ───► Yes ───► Return 'facebook'
                  │ No
                  ▼
        Matches Twitter regex? ───► Yes ───► Return 'twitter'
                  │ No
                  ▼
           Return 'unknown'
```

## 2. Platform Identifier Outputs
The resolved platform is recorded in the Supabase requests log (`platform` column) and guides media parsing and frontend badge illumination.
- **tiktok:** TikTok mobile & web posts
- **instagram:** Instagram Reels, posts, and IGTV clips
- **youtube:** YouTube standard videos, shorts, and embeds
- **facebook:** Facebook clips and Watch URLs
- **twitter:** Twitter / X statuses
- **unknown:** Triggers failure response (400 Bad Request)
