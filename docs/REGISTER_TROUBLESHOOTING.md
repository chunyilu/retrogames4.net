# Why the `/register` Endpoint May Not Be Working

The `retrogames4.net` frontend connects to the dedicated backend service **`retrogames-service`** (default: `https://retrogames-service.onrender.com`).

If you encounter issues registering or logging in, check the common causes and solutions below:

---

## 1. Backend Service Cold Start (Render Free Tier)

The production backend is hosted on Render. When idle, the free tier service goes to sleep:
- The initial request to `/register` or `/login` can experience a **30–60 second delay** while the server spins up.
- If the request times out in the browser, wait a few moments and try submitting the registration again.

---

## 2. Pointing to the Wrong Backend (`API_BASE_URL`)

The frontend scripts determine the backend address via:
```javascript
const API_BASE_URL = window.API_BASE_URL || 'https://retrogames-service.onrender.com';
```

- **For production:** Defaults automatically to `https://retrogames-service.onrender.com`.
- **For local backend development:** Run your local instance of `retrogames-service` (e.g., on port 3000 or 5000) and define `window.API_BASE_URL = 'http://localhost:3000'` before loading `main.js`.

---

## 3. CORS Configuration on the Backend

When `retrogames-service` is hosted on a separate domain from the frontend (e.g., GitHub Pages `https://<username>.github.io` or local server `http://127.0.0.1:5500`), browser `fetch` calls require CORS headers.

Ensure `retrogames-service` enables CORS middleware:
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 4. Duplicate Registration (`400 Email already exists`)

If an account has already been registered with that email address, the backend rejects duplicate registrations:

```json
HTTP/1.1 400 Bad Request
{"error": "Email already exists."}
```

### Fix:
Use a different email address or log in using the existing account credentials.

---

## Quick Verification Checklist

You can verify the backend status and endpoints directly with `curl`:

1. **Check Service Health / Endpoints:**
   ```bash
   curl -I https://retrogames-service.onrender.com/
   ```

2. **Test Registration:**
   ```bash
   curl -X POST https://retrogames-service.onrender.com/register \
     -H 'Content-Type: application/json' \
     -d '{"email":"test_user@example.com","password":"securePassword123"}'
   ```
   *Expected Response (201 Created):*
   ```json
   {"message":"User registered successfully!","userId":...}
   ```

3. **Test Login:**
   ```bash
   curl -X POST https://retrogames-service.onrender.com/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"test_user@example.com","password":"securePassword123"}'
   ```
   *Expected Response (200 OK):*
   ```json
   {"message":"Login successful!","user":{"id":...,"email":"test_user@example.com"}}
   ```
