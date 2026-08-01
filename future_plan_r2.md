# Future Plan: Direct R2 Image Architecture (Option B)

This document outlines the steps required to migrate the application's image delivery architecture from the current backend-proxied approach to a direct, edge-cached R2 architecture.

## Why are we doing this?
Currently, the flow for viewing an image is:
`User's Browser ➔ Backend Worker (luvio-platform) ➔ R2 Bucket`

By switching to **Direct R2 Access**, the flow becomes:
`User's Browser ➔ R2 Bucket (via Cloudflare Edge Cache)`

**Benefits:**
- ⚡ **Maximum Performance:** Images are cached at the Cloudflare edge, loading instantly for users without invoking the backend worker.
- 💰 **Cost Savings:** Bypasses the backend entirely for image reads, saving on Worker invocation limits and costs.

---

## Migration Steps

### Phase 1: Cloudflare Dashboard Configuration
1. Log in to the Cloudflare Dashboard.
2. Navigate to **R2** and click on your bucket (`luvio-uploads`).
3. Go to the **Settings** tab.
4. Under **Public Access**, click **Connect Domain**.
5. Enter a subdomain (e.g., `cdn.yourdomain.com` or `images.yourdomain.com`) and follow the steps to connect it. Cloudflare will automatically set up the DNS and SSL.
   *(Alternatively, for testing, you can enable the `r2.dev` subdomain, but a custom domain is highly recommended for production).*

### Phase 2: Codebase Updates (Frontend)
1. Add a new environment variable for the CDN URL:
   - Locally in `.env`: `NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com`
   - In GitHub Secrets: `NEXT_PUBLIC_CDN_URL`
2. Update the Next.js frontend configuration (`next.config.js`) to allow the new CDN domain for the `next/image` component:
   ```javascript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'cdn.yourdomain.com' }
     ],
   }
   ```
3. Find all instances in the frontend where images are rendered (e.g., Avatars, Marketplace listings) and update the `src` paths:
   - **Old:** `src={\`\${process.env.NEXT_PUBLIC_API_URL}/uploads/\${imagePath}\`}`
   - **New:** `src={\`\${process.env.NEXT_PUBLIC_CDN_URL}/\${imagePath}\`}`

### Phase 3: Codebase Updates (Backend)
1. The backend will **still handle uploads** (receiving the file, validating it, checking authentication, and putting it into R2). This ensures security.
2. Update the backend upload endpoints (in `backend/profile/routes.ts`, `backend/marketplace/routes.ts`, etc.) so that they return the new CDN path in the API response after a successful upload, rather than the old `/api/v1/uploads/...` path.
3. **Deprecate the Upload Route:** Once the frontend is fully migrated to use the CDN URLs, you can safely delete the `backend/upload/routes.ts` file, as the backend will no longer need to stream files to users.

### Phase 4: Private/Secure Files (Optional)
If you introduce features that require *private* files (e.g., private chat attachments that only the sender/receiver should see):
- You will need a second R2 bucket (e.g., `luvio-private-uploads`) without public access.
- For that bucket, you will continue using the current architecture (streaming through the backend to verify the user's authentication token before serving the file).
