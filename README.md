# 🎮 SaveSlot

A full-stack game backlog and review platform where users can track what they’re playing, discover games, and share their thoughts.

🔗 **Live Demo:** https://save-slot.vercel.app  

---

## 🚀 Features

- 🔐 **Authentication**
  - Register & login with JWT-based auth
  - Protected routes

- 🎮 **Game Backlog**
  - Add, update, and delete games
  - Track status (e.g. playing, completed)
  - Clean and responsive UI

- 🔍 **Game Search (IGDB Integration)**
  - Search real games via IGDB API
  - Smart ranking (exact match prioritized)
  - Add games directly from search results

- ⭐ **Reviews System**
  - Create and delete reviews
  - Ratings + comments
  - Linked to user accounts

- 🌍 **Public Profiles**
  - Shareable profile pages
  - View any user’s backlog and reviews
  - Read-only for visitors

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- CSS
- Axios
- React Router

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication

### External APIs
- IGDB (via Twitch API)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
