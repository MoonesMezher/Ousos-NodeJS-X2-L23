# API Explorer — Node.js L27

An interactive frontend client for learning how REST APIs work, built alongside the Node.js L27 lecture backend.

> Every button you click in the UI makes a real HTTP request. The **API Log panel** on the right shows the exact method, URL, request body, response status, and response body — so you can see exactly how the frontend talks to the backend.

---

## 🗂 Project Structure

```
L27/
├── src/                        # Backend (Node.js + Express)
│   ├── app.js                  # Entry point
│   ├── controllers/
│   │   ├── users.controller.js
│   │   └── posts.controller.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── users.routes.js
│   │   └── posts.routes.js
│   ├── middlewares/
│   │   ├── auth.js             # JWT verification
│   │   ├── role.js             # Role-based access
│   │   ├── id.js               # MongoDB ID param validation
│   │   ├── validation.js       # express-validator error formatter
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── notFound.js         # 404 handler
│   ├── helpers/
│   │   └── blockHandler.js     # Block/unblock logic (check/fail/success)
│   ├── utils/
│   │   ├── asyncHandler.js     # Wraps async controllers
│   │   ├── connectDb.js        # MongoDB + server start
│   │   ├── hashService.js      # bcryptjs wrapper
│   │   └── jwtService.js       # JWT sign/verify
│   ├── validation/
│   │   ├── user.validate.js
│   │   └── post.validate.js
│   └── scripts/
│       └── createAdmin.js      # One-time admin seed script
│
├── client/                     # Frontend (HTML + CSS + JS)
│   ├── index.html              # Single-page app
│   ├── css/
│   │   └── styles.css          # shadcn-inspired design system
│   └── js/
│       ├── api.js              # API service layer (all fetch() calls)
│       └── app.js              # UI logic & modules
│
├── .env                        # Environment variables (not committed)
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (or a MongoDB Atlas URI)
- A code editor (VS Code recommended)
- A browser with Live Server (VS Code extension) **or** any static file server

---

## 🚀 Setup & Installation

### 1. Clone / open the project

```bash
cd "path/to/L27"
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root (or edit the existing one):

```env
PORT=4000
MONGODB_URL=mongodb://localhost:27017/ousos-nodejs-x2-l23
JWT_SECRET_KEY="your-secret-key-here"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="adminADMIN123!"
```

### 4. Seed the admin user (first time only)

```bash
npm run create:admin
```

This creates the admin account defined in `.env`. Run it **once** — running it again will throw a duplicate email error.

### 5. Start the backend server

```bash
npm run watch
```

You should see:
```
Connected To DB Successfully
Server is Running on: http://localhost:4000
```

### 6. Open the frontend

You can access the UI in either of two ways:

- **Option A (Direct)**: Once the backend is running, simply open **[http://localhost:4000](http://localhost:4000)** in your browser. Express serves the `client/` static files automatically!
- **Option B (Live Server)**: Right-click `client/index.html` and choose **Open with Live Server**. Because CORS is enabled on the backend, cross-origin requests will work smoothly.

> ⚠️ **Do NOT open `index.html` directly as a `file://` URL** (double-clicking the HTML file in file explorer), as browsers block `fetch()` calls from `file://`. Always use Option A or B above.

---

## 🖥 Using the Frontend

| Section | Description |
|---|---|
| **Authentication** | Sign up a new account or sign in. The token is stored in `localStorage` automatically. |
| **Profile** | View your profile data, update your age, or change your password. |
| **Posts** | Create, view, edit, toggle privacy, and delete posts. Filter by status or privacy. |
| **Users** | *(Admin only)* View all users, search by email, view blocked users, block/unblock, delete. |

### 📡 API Log Panel (right side)

Every API call you make is logged here with:
- HTTP **method** and **URL**
- **Request body** (passwords are masked)
- **Response status code**
- **Response body** (formatted JSON)
- **Duration** in milliseconds

Click any log entry to expand/collapse the details.

---

## 🛣 API Reference

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/signup` | ❌ | — | Register new account |
| `POST` | `/signin` | ❌ | — | Get JWT token |
| `POST` | `/logout` | ✅ | — | Logout (client-side) |
| `GET` | `/profile` | ✅ | any | Get own profile |
| `PATCH` | `/profile` | ✅ | any | Update age |
| `PATCH` | `/change-password` | ✅ | any | Change password |
| `GET` | `/` | ✅ | admin | All users |
| `GET` | `/blocked` | ✅ | admin | All blocked users |
| `GET` | `/search?email=` | ✅ | admin | Search by email (regex) |
| `GET` | `/:id` | ✅ | admin | Get user by ID |
| `PUT` | `/block/:id` | ✅ | admin | Block user |
| `PATCH` | `/:id/unblock` | ✅ | admin | Unblock + reset count |
| `DELETE` | `/:id` | ✅ | admin | Delete user |

### Posts — `/api/v1/posts`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | All posts |
| `GET` | `/count` | Total post count |
| `GET` | `/filter?status=&privacy=` | Filtered posts |
| `GET` | `/:id` | Single post |
| `POST` | `/` | Create post |
| `PUT` | `/:id` | Full update |
| `PATCH` | `/:id/privacy` | Toggle privacy |
| `DELETE` | `/:id` | Delete post |

---

## 🔐 Block Mechanism

The `blockHandler` helper manages login attempt tracking:

1. Every **wrong password** increments `blockCount`
2. When `blockCount >= 5` → user is **blocked for 1 hour** (`blockedUntil`)
3. When `blockedUntil` has passed → block **expires automatically** on next login attempt
4. On **successful login** → `blockCount` resets to 0

---

## 💡 Key Concepts Demonstrated

| Concept | Where to look |
|---|---|
| JWT Authentication | `src/middlewares/auth.js` + `src/utils/jwtService.js` |
| Password hashing | `src/utils/hashService.js` |
| Role-based access | `src/middlewares/role.js` |
| Input validation | `src/validation/` + `src/middlewares/validation.js` |
| Async error handling | `src/utils/asyncHandler.js` |
| Block mechanism | `src/helpers/blockHandler.js` |
| API service layer | `client/js/api.js` |
| Token storage | `localStorage` in `client/js/app.js` |
| Regex search | `users.controller.js → search()` |

---

## 📦 Dependencies

```json
{
  "bcryptjs":          "Password hashing",
  "cors":              "Cross-origin resource sharing",
  "dotenv":            "Environment variables",
  "express":           "Web framework",
  "express-validator": "Input validation",
  "jsonwebtoken":      "JWT creation & verification",
  "mongoose":          "MongoDB ODM",
  "morgan":            "HTTP request logger",
  "nodemon":           "Auto-restart on file change (dev)"
}
```
