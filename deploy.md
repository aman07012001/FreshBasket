# Deploying FreshBasket to Render

This guide provides step-by-step instructions on how to deploy both the **Backend** (Node.js/Express) and the **Frontend** (React/Vite) of the FreshBasket project to [Render](https://render.com).

## Prerequisites
- A GitHub/GitLab account where this repository is hosted.
- A Render account (you can sign in using GitHub/GitLab).
- Your MongoDB URI (e.g., MongoDB Atlas).
- Cloudinary credentials (for image uploads).
- PayPal credentials (for payments).
- Any other required environment variables.

---

## 1. Deploying the Backend (Web Service)

We will deploy the backend as a **Web Service** on Render.

1. Log in to your Render Dashboard.
2. Click the **New +** button and select **Web Service**.
3. Connect your repository (e.g., `FreshBasket`).
4. Fill in the following details for the Web Service:
   - **Name**: `freshbasket-backend` (or any preferred name)
   - **Region**: Select the region closest to your users.
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `backend` *(⚠️ Important: This tells Render to look in the backend folder)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   Scroll down to the **Environment Variables** section and add all necessary keys from your backend `.env` file:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Your secure secret for authentication.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.
   - `EMAIL_QUEUE_ENABLED`: Set to `false` *(see Section 3 — keeps email working for free, no Redis needed)*
   - *Add any other variables your backend requires (SMTP credentials, PayPal, etc.).*
6. Click **Create Web Service**. Render will start building and deploying your backend.
7. Once deployed, copy the **live Backend URL** (e.g., `https://freshbasket-backend.onrender.com`). You will need this for the frontend.

---

## 2. Deploying the Frontend (Static Site)

We will deploy the frontend as a **Static Site** on Render. Note: Vite builds are best served as static applications.

1. Go back to your Render Dashboard.
2. Click the **New +** button and select **Static Site**.
3. Connect the same repository.
4. Fill in the following details for the Static Site:
   - **Name**: `freshbasket-frontend`
   - **Branch**: `main`
   - **Root Directory**: `grocery` *(⚠️ Important: This is your frontend Vite folder)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `grocery/dist` *(Vite outputs the production build to the `dist` folder)*
5. **Environment Variables**:
   Add any environment variables required by your Vite frontend. In Vite, these must start with `VITE_`.
   - `VITE_API_URL`: Paste the **Backend URL** you copied earlier without a trailing slash (e.g., `https://freshbasket-backend.onrender.com`).
   - `VITE_PAYPAL_CLIENT_ID`: Your PayPal client ID.
6. **Routing Configuration (Important for React/Vite SPAs)**:
   Since this is a Single Page Application (SPA) using React Router, you need to rewrite all requests to `index.html` to avoid 404s on page refresh:
   - Once the site is created, go to the **Redirects/Rewrites** settings section.
   - Add a new rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
7. Click **Create Static Site**. Render will build and deploy your React app.

---

## 3. Email Delivery — No Background Worker Needed 🎉

### Why You Don't Need a Paid Background Worker

Render's **Background Worker** is a paid service (~$7/month). **FreshBasket does not require it.**

The email system already has a **built-in automatic fallback**: when `REDIS_URL` is not configured (or `EMAIL_QUEUE_ENABLED=false`), all emails (order confirmations, password resets, etc.) are sent **inline** — directly inside the main Web Service process. No separate worker, no Redis, zero extra cost.

### ✅ Free Setup (Recommended for Render Free Tier)

Just set this one environment variable in your backend Web Service and **do not add** `REDIS_URL`:

```
EMAIL_QUEUE_ENABLED=false
```

That's it. The app will send emails synchronously as part of each request. This works perfectly for a portfolio or low-to-medium traffic application.

---

### Optional: Free Redis Queue via Upstash

If you later want queue-based email delivery (automatic retries on failure, job prioritization) **without paying Render**, use **[Upstash Redis](https://upstash.com)** — it has a generous **free tier** (10,000 commands/day).

> 💡 **Key insight:** The BullMQ Worker process runs *inside* your existing Web Service. You do **not** need a separate Render Background Worker service — that's an optional deployment choice, not a requirement.

**Steps:**

1. Go to [upstash.com](https://upstash.com) → create a free account.
2. Click **Create Database** → pick a region close to your Render backend → click **Create**.
3. After creation, open the database → go to the **Details** tab → copy the **Redis connection URL**  
   (format: `rediss://default:<password>@<host>:<port>`).
4. In your Render backend Web Service, add/update these environment variables:
   - `REDIS_URL` = the connection URL from step 3
   - `EMAIL_QUEUE_ENABLED` = `true`

This enables the BullMQ queue **inside your existing free Web Service** — no extra Render service or cost required.

---

## Post-Deployment Checklist
- [ ] **Check the Frontend URL**: Visit the live website to verify it loads without errors.
- [ ] **Test API Connections**: Try registering a user or fetching products to confirm the frontend talks to the backend and the backend connects to MongoDB.
- [ ] **Test External Services**: Validate that images upload properly (Cloudinary) and dummy payments work (PayPal).
- [ ] **Test Email Delivery**: Trigger a password reset to confirm emails are sent and received.
- [ ] **CORS**: Ensure your backend CORS configuration allows requests specifically from your Render frontend URL.