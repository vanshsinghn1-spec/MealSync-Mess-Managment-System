# MealSync - Hostel Mess Management System

**Live Application**: [https://mealsync-mu.vercel.app](https://mealsync-mu.vercel.app)

MealSync is a full-stack mess management platform designed for IIITDM Kancheepuram hostel residents, mess officials, and administration. It features a modern, responsive web portal to view daily menus, select dynamic dining halls, rate dishes, manage mess reallocations, and track leftover food waste.

---

## Technical Stack

### Frontend (Client)
* **Framework**: Next.js (using Turbopack)
* **Styling**: TailwindCSS with CSS custom variables for dynamic theme support
* **State & Authentication**: NextAuth.js (Credentials Provider)
* **Animations**: Framer Motion
* **Charts**: Recharts (for administrative analytics)
* **HTTP Client**: Axios with interceptors for token synchronization

### Backend (Server)
* **Runtime**: Node.js & Express
* **Database**: MongoDB Atlas via Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs
* **Logging & Middleware**: Morgan, CORS, express-rate-limit

---

## Core Features

1. **Dynamic Menu Viewer**: Displays standard vegetarian menu items alongside special paid extras. It dynamically selects the initial active meal (Breakfast, Lunch, Snacks, or Dinner) based on the user's local time.
2. **Meal Rating & Feedback System**: Allows students to submit reviews for individual served items, including star ratings and written reviews.
3. **Live Polls**: Real-time evaluation (delicious vs. disappointing) of today's served meals directly from the dashboard.
4. **Mess Switching**: Digital request portal allowing students to submit dining reallocation requests.
5. **Administrative Controls**: Tools for mess officials to log leftover food waste weight (in kg) and upload daily extras.
6. **System Announcements**: Target-audience restricted announcement banners posted by administrators.
7. **Analytics**: Rich charts mapping out rating trends, food waste log frequency, and poll distribution (likes vs. dislikes).
8. **Universal Theme Support**: Warm off-white light mode theme (default) alongside dark mode toggling.

---

## Installation and Local Setup

### Prerequisites
* Node.js (version 18 or above recommended)
* MongoDB (Atlas cluster or a running local MongoDB instance)

### Backend Configuration
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and define the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   NEXTAUTH_SECRET=your_nextauth_secret_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

### Frontend Configuration
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key
   ```

---

## Database Seeding

To populate initial data (messes, menus, admin, official, and student accounts), run the seeding script in the server directory:
```bash
cd server
npm run seed
```

### Seeding Accounts
After seeding, you can log in with the following credentials:
* **Admin**: `admin@iiitdm.ac.in` / `password123`
* **Mess Sai Official**: `mess1@iiitdm.ac.in` / `password123`
* **Mess Sheila Official**: `mess2@iiitdm.ac.in` / `password123`
* **Student**: `cs23i1028@iiitdm.ac.in` / `password123`

---

## Running the Application Locally

Start the backend API server:
```bash
cd server
npm run dev
```

Start the frontend Next.js development server:
```bash
cd client
npm run dev
```

The frontend application will be accessible at `http://localhost:3000`. The backend API runs on `http://localhost:5000`.
