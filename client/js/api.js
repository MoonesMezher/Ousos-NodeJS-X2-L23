/* ============================================================
   COMMERCIAL API SERVICE LAYER
   ============================================================ */
const BASE_URL = (typeof window !== "undefined" && (window.location.protocol === "http:" || window.location.protocol === "https:") && window.location.port === "4000")
  ? "/api/v1"
  : "http://localhost:4000/api/v1";

const API = {
  // ── Token helpers ──────────────────────────────────────────
  getToken: () => localStorage.getItem("token"),
  setToken: (t) => localStorage.setItem("token", t),
  clearToken: () => localStorage.removeItem("token"),

  // ── Core request ───────────────────────────────────────────
  request: async (method, path, body = null) => {
    const url = `${BASE_URL}${path}`;
    const token = API.getToken();

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { status: response.status, data, ok: response.ok };
    } catch (err) {
      console.error(`API Error [${method} ${path}]:`, err);
      throw err;
    }
  },

  // ── Users Endpoints ─────────────────────────────────────────
  users: {
    signup: (email, password) =>
      API.request("POST", "/users/signup", { email, password }),

    signin: (email, password) =>
      API.request("POST", "/users/signin", { email, password }),

    logout: () =>
      API.request("POST", "/users/logout"),

    profile: () =>
      API.request("GET", "/users/profile"),

    updateProfile: (age) =>
      API.request("PATCH", "/users/profile", { age }),

    changePassword: (currentPassword, newPassword) =>
      API.request("PATCH", "/users/change-password", { currentPassword, newPassword }),

    pagination: (page = 1, limit = 10, search = "", blocked = "") => {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append("search", search);
      if (blocked !== "") params.append("blocked", blocked);
      return API.request("GET", `/users/pagination?${params.toString()}`);
    },

    stats: () =>
      API.request("GET", "/users/stats"),

    getAll: () =>
      API.request("GET", "/users"),

    getBlocked: () =>
      API.request("GET", "/users/blocked"),

    search: (email) =>
      API.request("GET", `/users/search?email=${encodeURIComponent(email)}`),

    getById: (id) =>
      API.request("GET", `/users/${id}`),

    block: (id) =>
      API.request("PUT", `/users/block/${id}`),

    unblock: (id) =>
      API.request("PATCH", `/users/${id}/unblock`),

    delete: (id) =>
      API.request("DELETE", `/users/${id}`),
  },

  // ── Posts Endpoints ─────────────────────────────────────────
  posts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);
      if (params.status && params.status !== "ALL") query.append("status", params.status);
      if (params.privacy !== undefined && params.privacy !== "ALL") query.append("privacy", params.privacy);
      if (params.search) query.append("search", params.search);
      if (params.user) query.append("user", params.user);

      const qs = query.toString();
      return API.request("GET", `/posts${qs ? `?${qs}` : ""}`);
    },

    count: () =>
      API.request("GET", "/posts/count"),

    getById: (id) =>
      API.request("GET", `/posts/${id}`),

    create: (content, status = "Happy", privacy = false) =>
      API.request("POST", "/posts", { content, status, privacy }),

    update: (id, content, status, privacy) =>
      API.request("PUT", `/posts/${id}`, { content, status, privacy }),

    togglePrivacy: (id) =>
      API.request("PATCH", `/posts/${id}/privacy`),

    delete: (id) =>
      API.request("DELETE", `/posts/${id}`),
  },
};
