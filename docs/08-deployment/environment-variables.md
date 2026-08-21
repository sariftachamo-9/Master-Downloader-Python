# Environment Variables

Description of config keys used across environments.

## Backend variables (`backend/.env`)

### `PORT`
- **Purpose:** Port number Express binds to.
- **Default:** `10000` (standard on Render).

### `SUPABASE_URL`
- **Purpose:** Your Supabase project URL endpoint.
- **Example:** `https://zxywvt.supabase.co`

### `SUPABASE_ANON_KEY`
- **Purpose:** Public anonymity key for database table manipulation.

### `RATE_LIMIT_WINDOW`
- **Purpose:** Window size (in minutes) for request limiting.
- **Default:** `15`

### `RATE_LIMIT_MAX_REQUESTS`
- **Purpose:** Max number of requests allowed in the rate limit window.
- **Default:** `100`

---

## Frontend variables (`frontend/.env`)

### `VITE_API_URL`
- **Purpose:** Fully qualified URL to the Express backend service.
- **Default:** `http://localhost:10000` (local development)
- **Production:** `https://social-video-api.onrender.com`
