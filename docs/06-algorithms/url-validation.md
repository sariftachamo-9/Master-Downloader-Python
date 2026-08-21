# URL Validation Algorithm

This document describes the validation rules and regex models used to sanitize and check input URLs submitted to the Multi-Platform Social Media Downloader API.

## 1. Syntax Normalization
Before evaluating syntax patterns, the input string is trimmed and prepended with a scheme if missing:
- **Input:** `instagram.com/p/123/`
- **Output:** `https://instagram.com/p/123/`

## 2. General URL Format Check
A general regex is applied first to ensure it matches standard web URLs:
```regex
/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/i
```
Additionally, the string is passed to Node's `new URL()` constructor to catch malformed structures (e.g. invalid port formats or host names).

## 3. Platform Regex Matching
Each URL must map to one of the active platform rules to be processed:

### TikTok Pattern
```regex
/^(https?:\/\/)?(www\.|vm\.|vt\.|v\.)?tiktok\.com\/[a-zA-Z0-9_@.-]+/i
```

### Instagram Pattern
```regex
/^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[a-zA-Z0-9_.-]+/i
```

### YouTube Pattern
```regex
/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|shorts\/|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})/i
```

### Facebook Pattern
```regex
/^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.watch|fb\.com)\/.+$/i
```

### Twitter / X Pattern
```regex
/^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i
```
