<div align="center">

# Reshow 🎬🍿🎥

*Seamless Movie Discovery. Effortless Ticket Booking Experience.*

![Last Commit](https://img.shields.io/badge/last%20commit-today-brightgreen)
![JavaScript](https://img.shields.io/badge/javascript-98.8%25-yellow)
![Languages](https://img.shields.io/badge/languages-3-blue)

**Built with the tools and technologies:**

![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Inngest](https://img.shields.io/badge/Inngest-000000?style=for-the-badge&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)

---

## Overview

**Reshow** is a modern, full-stack movie ticket booking application built with the MERN stack. It provides users with a seamless experience to discover movies, browse show schedules, select seats, and book tickets — while giving administrators a powerful dashboard to manage shows, bookings, and movie listings.

Authentication is powered by **Clerk**, payments by **Stripe**, background jobs by **Inngest**, and movie data from **TMDB**.

---

## Features

### 👤 User Features
- **Authentication** — Secure sign-up, sign-in, and session management via Clerk
- **Movie Browsing** — Browse and search through extensive movie catalogs powered by TMDB
- **Movie Details** — View comprehensive movie information including trailers, cast, genres, and runtime
- **Show Schedules** — View available showtimes by date
- **Seat Selection** — Interactive theater seat map with real-time availability
- **Ticket Booking** — Book seats and complete payment securely via Stripe
- **Booking Management** — View and track all personal bookings
- **Favorites** — Save and access favorite movies quickly

### 🛠️ Admin Features
- **Dashboard Analytics** — Real-time stats on total bookings, revenue, active shows, and users
- **Show Management** — Add new shows with movie, date/time, and pricing
- **Show Listings** — View and manage all upcoming shows
- **Booking Overview** — Monitor all user bookings across the platform

### ⚙️ Technical Features
- **Background Jobs** — Inngest-powered event scheduling for:
  - Booking confirmation emails
  - Show reminder notifications (8 hours before show)
  - New show announcement emails
  - Automatic booking cleanup for unpaid sessions
- **Email Notifications** — Transactional emails via Nodemailer (Brevo SMTP)
- **Stripe Webhooks** — Real-time payment confirmation handling
- **Clerk Webhooks** — Automatic user sync on sign-up and deletion
- **Responsive Design** — Mobile-first with Tailwind CSS v4
- **IST Timezone** — Emails display Indian Standard Time (Asia/Kolkata)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose) |
| **Auth** | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| **Payments** | Stripe |
| **Background Jobs** | Inngest |
| **Email** | Nodemailer + Brevo SMTP |
| **Movie Data** | TMDB API |
| **Media Storage** | Cloudinary |
| **Deployment** | Vercel (client + server) |

---

## Project Structure

```
ReShow/
├── client/                        # Frontend React application
│   ├── public/
│   │   ├── backgroundImage.png    # Hero section background
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/                # SVG logos, images, dummy data
│   │   ├── components/
│   │   │   ├── admin/             # AdminNavbar, AdminSidebar, Title
│   │   │   ├── BlurCircle.jsx
│   │   │   ├── DateSelect.jsx
│   │   │   ├── FeaturedSection.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── TrailersSection.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx     # Global state + axios config
│   │   ├── lib/                   # Date, time, currency utilities
│   │   ├── pages/
│   │   │   ├── admin/             # Dashboard, AddShows, ListShows, ListBookings
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── SeatLayout.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── Favorite.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                       # Frontend environment variables
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Backend Express application
│   ├── configs/
│   │   ├── db.js                  # MongoDB connection
│   │   └── nodeMailer.js          # Nodemailer / Brevo SMTP setup
│   ├── controllers/
│   │   ├── adminController.js     # Admin dashboard, shows, bookings
│   │   ├── bookingController.js   # Create booking, occupied seats
│   │   ├── showController.js      # TMDB fetch, add/get shows
│   │   ├── stripeWebhooks.js      # Stripe webhook handler
│   │   └── userController.js      # Favorites, user bookings
│   ├── inngest/
│   │   └── index.js               # All Inngest functions
│   ├── middleware/
│   │   └── auth.js                # Clerk admin protection middleware
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Movie.js
│   │   ├── Show.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── showRoutes.js
│   │   └── userRoutes.js
│   ├── .env                       # Backend environment variables
│   ├── .env.example
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v20.9.0 or higher
- **npm** v9+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Accounts on: [Clerk](https://clerk.com), [Stripe](https://stripe.com), [Inngest](https://app.inngest.com), [TMDB](https://www.themoviedb.org), [Brevo](https://brevo.com) (for email)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/ReShow.git
   cd ReShow
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

---

### Environment Variables

#### Server — `server/.env`

```env
# 🌐 Server Port
PORT=3000

# 🌐 Database Connection
MONGODB_URI=mongodb://localhost:27017

# 🔐 Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 👤 Admin & Localization
ADMIN_EMAIL=your@email.com
TIMEZONE=Asia/Kolkata
CLIENT_URL=http://localhost:5173

# 🎬 TMDB API (Bearer Token)
TMDB_API_KEY=your_tmdb_api_key

# 💳 Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ⚙️ Inngest Event Scheduling
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=signkey-prod-...

# 📧 Email Notifications (Brevo SMTP)
SENDER_EMAIL=your@email.com
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

#### Client — `client/.env`

```env
# 🔐 Clerk Authentication (Publishable Key)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# 🌐 Backend Base API URL
VITE_BASE_URL=http://localhost:3000

# 💱 Currency Symbol
VITE_CURRENCY=$

# 🎞️ TMDB Image Base URL
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```

> Copy `.env.example` in both directories and fill in your values.

---

### Running the App

**Terminal 1 — Start the backend server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

All API routes are prefixed with `/api`.

### Shows

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/show/now-playing` | Admin | Fetch now-playing movies from TMDB |
| `POST` | `/api/show/add` | Admin | Add a new show |
| `GET` | `/api/show/all` | Public | Get all upcoming shows |
| `GET` | `/api/show/:movieId` | Public | Get shows for a specific movie |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/booking/create` | User | Create a booking + Stripe session |
| `GET` | `/api/booking/seats/:showId` | Public | Get occupied seats for a show |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/bookings` | User | Get current user's bookings |
| `POST` | `/api/user/update-favorite` | User | Toggle a movie as favourite |
| `GET` | `/api/user/favorites` | User | Get current user's favourites |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/is-admin` | Admin | Check if user is an admin |
| `GET` | `/api/admin/dashboard` | Admin | Get dashboard stats |
| `GET` | `/api/admin/all-shows` | Admin | Get all shows |
| `GET` | `/api/admin/all-bookings` | Admin | Get all bookings |

### Stripe Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/stripe` | Handles `payment_intent.succeeded` events |

### Inngest Events (Background Jobs)

| Event | Function | Description |
|-------|----------|-------------|
| `clerk/user.created` | `syncUserCreation` | Saves new Clerk user to MongoDB |
| `clerk/user.deleted` | `syncUserDeletion` | Removes user from MongoDB |
| `app/show.booked` | `sendBookingConfirmation` | Sends booking confirmation email |
| `app/checkpayment` | (scheduler) | Cancels unpaid bookings after 10 min |
| `app/show.added` | `sendNewShowNotifications` | Notifies all users of new shows |
| cron `0 */8 * * *` | `sendShowReminders` | Sends reminders 8 hours before show |

---

## Deployment

Both client and server include a `vercel.json` for easy deployment to Vercel.

### Deploy Server
```bash
cd server
vercel --prod
```

### Deploy Client
```bash
cd client
vercel --prod
```

> Make sure to set all environment variables in your Vercel project settings before deploying. For Stripe, register your production webhook endpoint in the Stripe Dashboard pointing to `https://your-server-url.vercel.app/api/stripe`.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any questions or support, please contact:

- **Ram Sharma**
- **Email**: ram9998sharma@gmail.com

---

<div align="center">

**Made with ❤️ by Ram Sharma**

[⬆ Back to Top](#table-of-contents)

</div>
