Vercel deployment notes

Important: Vercel project-level protection (Single Sign-On / Password Protect / Protect Deployments) will intercept HTTP requests and return an HTML login page before they reach Django. This appears in the browser as a network/CORS error and prevents cookies from being set.

Steps to make the backend work with the frontend on Vercel:

1. In Vercel, open the project `aarohan-git-main-01-tanishas-projects` → Settings.
2. Under Security / Protection, disable "Protect Deployments" / require Vercel SSO for this project, or add an exception so anonymous requests reach the API.
3. Redeploy the backend after changing the protection setting.
4. Verify with curl from a separate terminal:

   curl -i -H "Origin: https://<your-frontend>.vercel.app" https://<your-backend>.vercel.app/api/me/

   You should receive a JSON response (401 if not logged in) and NOT an HTML page from Vercel.

Environment variables required on Vercel (set in Project > Settings > Environment Variables):
- SECRET_KEY: production secret
- DEBUG: False
- EMAIL_HOST_USER and EMAIL_HOST_PASSWORD (if using email features)
- DEFAULT_FROM_EMAIL
- FRONTEND_BASE_URL: https://<your-frontend>.vercel.app

Notes about cookies/CORS:
- The Django settings already set `SESSION_COOKIE_SAMESITE = "None"` and `SESSION_COOKIE_SECURE = True`.
- Keep `CORS_ALLOW_CREDENTIALS = True` and ensure the frontend origin is present in `CORS_ALLOWED_ORIGINS`.
- Frontend must send credentials: `fetch(..., { credentials: 'include' })` or axios `withCredentials: true`.

If you want, I can continue: update settings to read allowed origins from env and run additional checks.
