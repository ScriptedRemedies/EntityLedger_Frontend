# The Entity Ledger UI

# 🚀 Launch Day: Moving to Production

When moving **The Entities Ledger** from local development to a live, public URL, follow this exact checklist to ensure your security, database, and APIs route correctly.

## 1. Google Cloud Console (OAuth Updates)
Your Google OAuth client currently only accepts traffic from `localhost`. You must whitelist your live domain.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Click on your `Vite React Frontend` OAuth 2.0 Client ID.
4. Under **Authorized JavaScript origins**, click `+ Add URI` and paste your live frontend URL (e.g., `https://theentitiesledger.com`).
5. Under **Authorized redirect URIs**, click `+ Add URI` and paste the exact same live URL.
6. Click **Save**.
7. *Optional but recommended:* Go to **OAuth consent screen** and click **Publish App** to move it out of "Testing" mode. This allows any user to log in, rather than just the test emails you manually whitelisted.

---

## 2. Frontend Updates (`ledger-ui`)

**Inside `.env.development`:**
```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
