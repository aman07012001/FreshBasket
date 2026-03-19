# FreshBasket E‑Commerce Application

**Made by Aman Gusain**

Full‑stack FreshBasket e-commerce application designed to provide a seamless grocery shopping experience.

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT (HTTP‑only cookies), Redis (optional), Nodemailer, Zod, Multer
- **Frontend**: React (Vite), React Router, React Hook Form, Yup, Material‑UI, TailwindCSS, PayPal SDK

Authentication is standardized as **HTTP‑only cookie auth** with an optional Bearer fallback.

---

## 1. Repository Structure

```text
d:\FreshBasket
 ├── backend/       # Node.js + Express API
 └── grocery/       # React + Vite frontend
```

---

## 2. Setup

### 2.1 Prerequisites

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas account)
- Internet connection

### 2.2 Easy Setup Instructions

For detailed setup instructions, please refer to our comprehensive guides:
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Complete setup guide
- [EMAIL_SETUP_INSTRUCTIONS.md](EMAIL_SETUP_INSTRUCTIONS.md) - Email and database specific setup

### 2.3 Backend

```bash
cd backend
npm install
# Create and configure your .env file (see SETUP_INSTRUCTIONS.md)
npm start         # http://localhost:5000
```

### 2.4 Frontend

```bash
cd grocery
npm install
# Create and configure your .env file (see SETUP_INSTRUCTIONS.md)
npm run dev         # http://localhost:5173
```

---

## 3. Backend Overview (`backend/`)

The backend provides a robust and secure RESTful API with the following key endpoints and features:

### 3.1 Entry & Config

- **`server.js`**
  - Loads `.env`
  - Connects to MongoDB (`MONGO_URL`) with tailored connection pooling and timeouts.
  - Starts the Express app imported from `app.js`

- **`app.js`**
  - Sets up CORS with `credentials: true` (origins from `CORS_ORIGIN`), `cookie-parser`, and `express.json()`
  - Mounts all core subsystems:
    - `/api/auth` → Authentication routes (Login, Register, Password Reset, Email Verification, Session Revocation)
    - `/api/orders` → Order routes (Create, View, Cancel, Admin updates)
    - `/api/upload` → File upload routing for handling images using Multer
    - `/api/email` → Email delivery status and diagnostics tracking
    - `/api/reviews` → Product reviews, ratings, and admin moderation
    - `/api/inventory` → Inventory stock tracking, restock, reservation, and alerts
    - `/api/monitoring` → Application performance monitoring, tracking slow requests and DB query times
  - `GET /health` → returns system health `{ status, timestamp, service, email: { ok, error? } }`

- **`config.js`**
  - Uses **Zod** to validate environment configurations including `MONGO_URL`, `JWT_SECRET`, CORS origins, and SMTP settings.

---

## 4. Frontend Overview (`grocery/`)

The frontend provides an intuitive shopping layout with extensive account and ordering capabilities:

- **Entrypoint**: `src/main.jsx` wires up `AuthProvider`, routing, and the PayPal provider.
- **Routing (`src/App.jsx`)**:
  - **Public Pages**: `/home`, `/products`, `/categories`, `/about`, Auth flows (`/login`, `/signup`, `/forgot-password`, `/reset`, `/verify-email`)
  - **Protected Pages**: `/cart`, `/checkout`, `/my-orders`, `/admin/orders`, `/admin/inventory`, `/sessions`, `/user-details`
- **Data Layer (Products & Categories)**: 
  - Currently, product inventory and category mapping are populated via local static mapped arrays (e.g., `store/products.js`), ensuring blazing fast loads.
- **Cart Management**: 
  - The cart relies entirely on efficient frontend state logic, avoiding constant backend pings until checkout.
- **Auth context**: 
  - `AuthContext` + `useAuth` wrap login, logout, password reset, email verification, and session UI safely via HTTP-only cookies without exposing tokens in JavaScript global variables.
- **Admin Capabilities**:
  - Contains robust dashboards for order tracking (`/admin/orders`) and inventory assessment (`/admin/inventory`).

---

## 5. Environment Variables

The app uses environment variables for backend configuration, email, cookies, Redis, and frontend integrations. You must create `.env` files for both `backend/` and `grocery/` before running the app.

### Important Notice About Environment Configuration

**Please follow the detailed setup instructions in [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) to properly configure your environment variables.**

Common issues with the password reset functionality are caused by:
1. Incorrect MongoDB connection configuration
2. Missing or incorrect SMTP configuration
3. Missing JWT secret

### Quick Setup Checklist

Before running the application, ensure you have:

1. Created `.env` files in both `backend/` and `grocery/` directories
2. Configured MongoDB connection (local or MongoDB Atlas)
3. Set up SMTP credentials (Ethereal.email recommended for development)
4. Generated a strong JWT secret (at least 32 characters)
5. Verified CORS and frontend URL settings

For detailed instructions on each of these steps, please refer to [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

---

## 6. Troubleshooting Password Reset Issues

If you're experiencing issues with the password reset functionality:

1. Check that your MongoDB connection is working
2. Verify your SMTP configuration in the backend `.env` file
3. Ensure all required environment variables are set
4. Check the backend console logs for detailed error messages
5. Make sure you're using a valid email address

For step-by-step instructions, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

---

## 7. Summary & Project Completeness

- **Fully Realized Subsystems**:
  - **Authentication**: High security JWT infrastructure over HTTP-only cookies, with complete fallback/revoke capability.
  - **Orders & Inventory**: Robust checkout processes that properly adjust stock levels and enable admin supervision.
  - **Auxiliary Systems**: Complete email notification engines, user reviews, and app monitoring are deployed.
- **Static Design Choices**:
  - Product browsing and cart management prioritize a responsive, frontend-first approach natively mapped in React, reducing unnecessary DB overhead.
- Overall, FreshBasket represents a highly structured, scalable full-stack application leveraging best-in-class React and Node.js practices.