# FreshBasket 🛒

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-4.0-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-blue)

A modern, full-stack E-Commerce application designed to provide a seamless and highly responsive grocery shopping experience. Built with a robust **Node.js/Express** backend and a lightning-fast **React/Vite** frontend.

## 🌟 Key Features

- **Advanced Authentication**: Highly secure JWT infrastructure over HTTP-Only cookies with session management.
- **Product & Inventory Management**: Dynamic product catalog with category filtering, automated stock tracking, and real-time restock alerts.
- **Shopping Cart & Checkout**: Efficient state-managed cart and seamless PayPal checkout integration.
- **Admin Dashboard**: Comprehensive admin capabilities for order tracking, inventory assessment, and product moderation.
- **Automated Emails**: Redis-backed email queue for order confirmations and password resets (via Nodemailer).
- **Ratings & Reviews**: Built-in customer review and rating system.

---

## 🛠️ Tech Stack

### Frontend (`/grocery`)
- **Framework**: React.js (Vite)
- **Styling**: TailwindCSS & Material-UI
- **Form Handling**: React Hook Form & Yup validation
- **Routing**: React Router DOM
- **Payments**: PayPal SDK

### Backend (`/backend`)
- **Server**: Node.js & Express
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT, HTTP-Only Cookies, Zod validation
- **Services**: Cloudinary (Image Uploads), BullMQ/Redis (Task Queues)

---

## 🔑 Demo Credentials

Want to explore the app without signing up? Use the following test account:

| Field    | Value                      |
|----------|----------------------------|
| Email    | `gusainaman007@gmail.com`  |
| Password | `Amangusain001`            |

> **Note:** This is a shared demo account — please don't change the password.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account (for images)
- A [PayPal Developer](https://developer.paypal.com/) account (for checkout)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/FreshBasket.git
cd FreshBasket
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory. See `SETUP_INSTRUCTIONS.md` for a full list of required variables, or use this quick template:
```env
PORT=4000
MONGO_URL=your_mongodb_uri
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd grocery
npm install
```
Create a `.env` file in the `grocery/` directory:
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```
Start the development server:
```bash
npm run dev
```
Your frontend will now be running on `http://localhost:5173`.

---

## 📂 Project Structure

```text
FreshBasket/
├── backend/                  # Node.js REST API
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Entry point
├── grocery/                  # Vite React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page layouts
│   │   └── context/          # React Context (Auth, Cart, etc.)
├── SETUP_INSTRUCTIONS.md     # Detailed local setup guides
└── deploy.md                 # Deployment instructions
```

---

## 🚢 Deployment

Ready to go live? Check out our comprehensive [Deployment Guide](deploy.md) for step-by-step instructions on deploying the frontend and backend to **Render**.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aman Gusain**