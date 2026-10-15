/* ============================================================
   API SERVICE LAYER
   ============================================================
   This is the single source of truth for all API calls.
   The app never calls fetch() directly — it always goes
   through this service. This is a common real-world pattern.
   ============================================================ */

const BASE_URL = "http://localhost:4000/api/v1";

// Internal: will be set by app.js to log requests to the UI panel
let _onRequest = null;
let _onResponse = null;

const API = {
  // ── Token helpers ──────────────────────────────────────────
  getToken: () => localStorage.getItem("token"),
  setToken: (t) => localStorage.setItem("token", t),
  clearToken: () => localStorage.removeItem("token"),

  // ── Callback registration ──────────────────────────────────
  onRequest: (fn) => { _onRequest = fn; },
  onResponse: (fn) => { _onResponse = fn; },

  // ── Core request ───────────────────────────────────────────
  // Every single API call goes through here.
  // This is where: headers are built, token is attached,
  // requests are logged, and responses are parsed.
  request: async (method, path, body = null) => {
    const url = `${BASE_URL}${path}`;
    const token = API.getToken();

    // Build headers — always JSON, include token if available
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const startTime = Date.now();

    // Notify UI of outgoing request
    if (_onRequest) _onRequest({ method, path, body, timestamp: new Date() });

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      // Notify UI of response
      if (_onResponse) _onResponse({ status: response.status, data, duration });

      return { status: response.status, data, ok: response.ok };
    } catch (err) {
      const duration = Date.now() - startTime;
      if (_onResponse) _onResponse({ status: 0, data: { message: err.message }, duration });
      throw err;
    }
  },

  // ============================================================
  //  USERS ENDPOINTS
  // ============================================================

  users: {
    // POST /users/signup — create account (no auth required)
    signup: (email, password) =>
      API.request("POST", "/users/signup", { email, password }),

    // POST /users/signin — get JWT token
    signin: (email, password) =>
      API.request("POST", "/users/signin", { email, password }),

    // POST /users/logout — invalidate session (client-side)
    logout: () =>
      API.request("POST", "/users/logout"),

    // GET /users/profile — own profile from JWT
    profile: () =>
      API.request("GET", "/users/profile"),

    // PATCH /users/profile — update own age
    updateProfile: (age) =>
      API.request("PATCH", "/users/profile", { age }),

    // PATCH /users/change-password — verify old, set new
    changePassword: (currentPassword, newPassword) =>
      API.request("PATCH", "/users/change-password", { currentPassword, newPassword }),

    // GET /users — all users (admin only)
    getAll: () =>
      API.request("GET", "/users"),

    // GET /users/blocked — all blocked users (admin only)
    getBlocked: () =>
      API.request("GET", "/users/blocked"),

    // GET /users/search?email= — regex search (admin only)
    search: (email) =>
      API.request("GET", `/users/search?email=${encodeURIComponent(email)}`),

    // GET /users/:id — single user (admin only)
    getById: (id) =>
      API.request("GET", `/users/${id}`),

    // PUT /users/block/:id — block a user (admin only)
    block: (id) =>
      API.request("PUT", `/users/block/${id}`),

    // PATCH /users/:id/unblock — unblock + reset count (admin only)
    unblock: (id) =>
      API.request("PATCH", `/users/${id}/unblock`),

    // DELETE /users/:id — delete user (admin only)
    delete: (id) =>
      API.request("DELETE", `/users/${id}`),
  },

  // ============================================================
  //  POSTS ENDPOINTS
  // ============================================================

  posts: {
    // GET /posts — all posts (public)
    getAll: () =>
      API.request("GET", "/posts"),

    // GET /posts/count — total count (public)
    count: () =>
      API.request("GET", "/posts/count"),

    // GET /posts/filter?status=&privacy= — filter (public)
    filter: (params) =>
      API.request("GET", `/posts/filter?${new URLSearchParams(params)}`),

    // GET /posts/:id — single post by id
    getById: (id) =>
      API.request("GET", `/posts/${id}`),

    // POST /posts — create post
    create: (content, status) =>
      API.request("POST", "/posts", { content, status }),

    // PUT /posts/:id — full update
    update: (id, content, status) =>
      API.request("PUT", `/posts/${id}`, { content, status }),

    // PATCH /posts/:id/privacy — toggle privacy boolean
    togglePrivacy: (id) =>
      API.request("PATCH", `/posts/${id}/privacy`),

    // DELETE /posts/:id — delete post
    delete: (id) =>
      API.request("DELETE", `/posts/${id}`),
  },
};
