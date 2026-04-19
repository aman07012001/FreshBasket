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
   Scroll down to the **Environment Variables** section and add all necessary keys exactly as they appear in your backend `.env` file. Common keys include:
   - `PORT` (Render sets this automatically, but you can set it if needed)
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Your secure secret for authentication.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary dashboard.
   - `REDIS_URL`: (If you are using Redis, create a Redis instance on Render and use its Internal URL)
   - *Add any other variables your backend requires.*
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
   Add any environment variables required by your Vite frontend. In Vite, these usually start with `VITE_`.
   - `VITE_API_URL` (or whatever variable you use to point to the backend): Paste the **Backend URL** you copied earlier without the trailing slash (e.g., `https://freshbasket-backend.onrender.com`).
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

## 3. Deploying Background Workers / Redis (Optional)

If your application actively uses BullMQ and Redis for queued tasks (e.g., `emailWorker.js` in your `backend/package.json`):

### Setting up Redis
1. On your Render dashboard, click **New +** > **Redis**.
2. Name it (e.g., `freshbasket-redis`).
3. Once created, copy the **Internal Redis URL** and add it as the `REDIS_URL` environment variable in your Backend Web Service.

### Setting up the Background Worker
1. Click **New +** > **Background Worker**.
2. Connect your repo and set **Root Directory** to `backend`.
3. **Environment**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm run email-worker`
6. Under **Environment Variables**, add the exact same database and Redis connection variables as your backend (especially `REDIS_URL` and email credentials).

---

## Post-Deployment Checklist
- [ ] **Check the Frontend URL**: Visit the live website to verify it loads without errors.
- [ ] **Test API Connections**: Try creating/fetching products or registering a test user to ensure the frontend successfully communicates with the backend, and that the backend connects to MongoDB.
- [ ] **Test External Services**: Validate that images upload properly (Cloudinary) and dummy payments work (PayPal).
- [ ] **CORS**: Ensure your backend CORS configuration permits requests specifically from your Render frontend URL.
