# MealSync — Smart Campus Mess Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mealsync--mu.vercel.app-173b2a?style=for-the-badge&logo=vercel)](https://mealsync-mu.vercel.app)
[![API Status](https://img.shields.io/badge/Backend%20API-onrender.com-579169?style=for-the-badge&logo=render)](https://mealsync-mess-managment-system.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

> **Live Application**: [https://mealsync-mu.vercel.app](https://mealsync-mu.vercel.app)  
> **Backend API**: [https://mealsync-mess-managment-system.onrender.com](https://mealsync-mess-managment-system.onrender.com)

**MealSync** is a production-grade campus dining and feedback ecosystem engineered for **IIITDM Kancheepuram** hostel residents, mess caterers, and administration. It transforms static bi-weekly PDF schedules into a real-time, time-aware web application supporting dynamic dining halls, dish ratings, live sentiment polls, food waste logging, and digital mess reallocation requests.

---

## 🍽️ Campus Meal Schedule (IST)

MealSync features a server-authoritative time-aware scheduling engine with minute precision:

| Meal | Service Window (IST) | Status Trigger |
| :--- | :--- | :--- |
| **Breakfast** | **7:00 AM – 9:30 AM** | 07:00 – 09:30 |
| **Lunch** | **12:00 PM – 2:30 PM** | 12:00 – 14:30 |
| **Snacks** | **4:45 PM – 6:00 PM** | 16:45 – 18:00 |
| **Dinner** | **7:00 PM – 9:30 PM** | 19:00 – 21:30 |

*Outside of active meal hours, the dashboard automatically predicts and highlights the next upcoming meal (after 9:30 PM, it seamlessly transitions to the next morning's breakfast).*

---

## ⚡ Key Features

1. **Minute-Precision Time Engine**: Server-authoritative IST detection automatically highlights the live serving meal, drives the active tab, and powers pulsing live-status pills.
2. **Instant Tab Switching (Single-Query Menu API)**: The `/api/menu/today/all` endpoint aggregates all 4 daily meals across vegetarian items and special non-veg add-ons in a single database roundtrip, paired with client-side SWR caching for zero-latency tab navigation.
3. **Dish-Level Ratings & Reviews**: Residents can submit 1–5 star ratings and written reviews for individual dishes, providing mess contractors and wardens with empirical quality metrics.
4. **Daily Satisfaction Polls**: 1-tap sentiment polling (*Delicious* vs. *Disappointing*) for the active meal, displaying live community sentiment.
5. **Food Waste Analytics**: Dedicated contractor tools for logging post-service leftover food waste (in kg), mapped directly to Recharts visual trend graphs for administrators.
6. **Digital Mess Reallocation**: Self-service student request portal for dining hall transfers (Mess Sai vs. Mess Sheila) with 1-click administrative review and approval.
7. **Role-Based Access Control (RBAC)**: Secure multi-tier authorization for **Students**, **Mess Officials**, and **Chief Warden / SAC Administrators**.
8. **Modern Responsive Design**: Bespoke design system built on Deep Forest Green (`#173b2a`), Electric Lime (`#d9f36b`), warm neutral cream, Framer Motion micro-animations, and persistent dark/light theme switching.
9. **Zero Cold Starts**: Continuous GitHub Actions cron workflow pings the Render backend every 5 minutes 24/7, keeping cloud containers awake and in-memory caches warm around the clock.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Client)
* **Framework**: Next.js (App Router) + TypeScript + React 19
* **Styling**: TailwindCSS with CSS custom properties for dual light/dark modes
* **State & Authentication**: NextAuth.js (JWT Credentials Provider) + SWR
* **Animations**: Framer Motion
* **Visualizations**: Recharts (Waste logs, ratings distribution, sentiment trends)
* **Icons**: Lucide React + custom SVG / multi-resolution `.ico` brand favicon

### Backend (Server)
* **Runtime**: Node.js & Express.js REST API
* **Database**: MongoDB Atlas via Mongoose ODM (11 structured schemas)
* **Authentication**: Stateless JSON Web Tokens (JWT) + bcryptjs
* **Caching**: Multi-tier caching layer (in-memory LRU with Redis fallback wrapper)
* **Security & Middleware**: CORS, Morgan, Helmet, express-rate-limit

### DevOps & Infrastructure
* **Frontend Hosting**: Vercel
* **Backend Hosting**: Render
* **Keep-Alive Automation**: GitHub Actions ([keep-alive.yml](.github/workflows/keep-alive.yml)) running 24/7 every 5 minutes

---

## 🚀 One-Click Demo Access

You can explore the live deployment immediately without needing college credentials:

1. Open [https://mealsync-mu.vercel.app/login](https://mealsync-mu.vercel.app/login)
2. Click the **"Use Student Demo Account"** button to auto-fill testing credentials, or log in manually:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `cs23i1028@iiitdm.ac.in` | `password123` | View menus, rate dishes, vote in polls, submit switch requests |
| **Admin / Warden** | `admin@iiitdm.ac.in` | `password123` | Waste trends, rating analytics, manage switch requests, announcements |
| **Mess Sai Official** | `mess1@iiitdm.ac.in` | `password123` | Log waste records, manage extras for Dining Hall A |
| **Mess Sheila Official** | `mess2@iiitdm.ac.in` | `password123` | Log waste records, manage extras for Dining Hall B |

---

## 💻 Local Development Setup

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB (Atlas URI or local MongoDB instance)

### 1. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Seed the database with default menus, users, and mess halls:
```bash
npm run seed
```

Start the API server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
```

Create a `.env.local` file in `client/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

Start the Next.js dev server:
```bash
npm run dev
```

The application will be live at `http://localhost:3000` connected to the API on `http://localhost:5000`.

---

## 📄 License
This project is licensed under the MIT License. Designed and built with ❤️ for IIITDM Kancheepuram.
