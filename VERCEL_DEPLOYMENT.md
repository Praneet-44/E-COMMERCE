# Deploying FashionHub to Vercel 🚀

This repository is configured for seamless deployment to **Vercel** as a full-stack monorepo featuring a Next.js frontend and Express Node.js backend.

---

## ⚙️ Solution for "No Next.js Version Detected" Error

If Vercel gives the error `No Next.js version detected` during build, follow these steps:

### Option A: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** -> **General**.
3. Locate **Root Directory** and click **Edit**.
4. Type `frontend` as the Root Directory.
5. Click **Save**.
6. Go to **Deployments**, click the `...` menu on your latest deployment, and select **Redeploy** (uncheck *Use existing build cache*).

---

### Option B: Deploy Monorepo from Repository Root

If you leave Root Directory as `./` (Root):
1. The repository root contains an updated [package.json](file:///e:/PROJECTS/PKSS_COTHING/package.json) containing `next`, `react`, and `react-dom` as dependencies.
2. The root [vercel.json](file:///e:/PROJECTS/PKSS_COTHING/vercel.json) uses the modern build pipeline:
   ```json
   {
     "buildCommand": "cd frontend && npm install && npm run build",
     "outputDirectory": "frontend/.next",
     "functions": {
       "backend/api/index.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     },
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/backend/api/index.js"
       }
     ]
   }
   ```

---

## 🔒 Required Environment Variables

In Vercel **Settings** -> **Environment Variables**, add:

| Key | Value / Example | Description |
| --- | --- | --- |
| `JWT_SECRET` | `fashionhub-super-secret-key` | Auth JWT Secret |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/fashionhub` | MongoDB Database Connection |
| `NEXT_PUBLIC_API_URL` | `/api` | Base API URL |
