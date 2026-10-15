/* ============================================================
   APPLICATION LOGIC
   ============================================================
   Organized into modules:
   - State        → app-wide data (user, token, section)
   - UI           → helpers (toast, loading, show/hide)
   - APILog       → right-panel request/response logger
   - Nav          → sidebar navigation
   - Auth         → signin / signup / logout
   - Profile      → view / update / change-password
   - Posts        → full CRUD + filter + count
   - Users        → admin panel (list / search / block / delete)
   ============================================================ */

// ── State ────────────────────────────────────────────────────
const state = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  currentSection: "auth",
};

const isAdmin = () => state.user?.role === "admin";
const isLoggedIn = () => !!API.getToken();

// ── UI Helpers ───────────────────────────────────────────────
const UI = {
  // Show one section, hide others
  showSection(name) {
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
    const el = document.getElementById(`section-${name}`);
    if (el) el.classList.add("active");
    state.currentSection = name;

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((a) => a.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-section="${name}"]`);
    if (navItem) navItem.classList.add("active");
  },

  // Show/hide sidebar user card and admin nav
  updateSidebar() {
    const userCard = document.getElementById("user-card");
    const adminNav = document.getElementById("admin-nav");

    if (isLoggedIn() && state.user) {
      userCard.style.display = "flex";
      document.getElementById("user-avatar-text").textContent =
        state.user.email?.[0]?.toUpperCase() || "U";
      document.getElementById("user-email-text").textContent = state.user.email || "";
      document.getElementById("user-role-badge").textContent = state.user.role || "user";
      document.getElementById("user-role-badge").className =
        `role-badge ${state.user.role === "admin" ? "role-admin" : "role-user"}`;

      if (isAdmin()) {
        adminNav.style.display = "block";
      } else {
        adminNav.style.display = "none";
      }
    } else {
      userCard.style.display = "none";
      adminNav.style.display = "none";
    }
  },

  // Toast notification
  toast(message, type = "default") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icons = { success: "✓", error: "✕", warning: "⚠", default: "ℹ" };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("toast-show"), 10);
    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Button loading state
  setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner"></span> Loading...`;
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
      btn.disabled = false;
    }
  },

  // Render a JSON object as formatted code
  renderJSON(data) {
    return `<pre class="json-output">${JSON.stringify(data, null, 2)}</pre>`;
  },

  // Status code color class
  statusClass(status) {
    if (status >= 200 && status < 300) return "status-success";
    if (status >= 400 && status < 500) return "status-warning";
    if (status >= 500) return "status-error";
    return "status-muted";
  },

  // Format date
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  },

  // Modal
  openModal(title, content) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = content;
    document.getElementById("modal-overlay").classList.add("active");
  },

  closeModal() {
    document.getElementById("modal-overlay").classList.remove("active");
    document.getElementById("modal-body").innerHTML = "";
  },
};

// ── API Log Panel ─────────────────────────────────────────────
const APILog = {
  entries: [],
  currentRequest: null,

  init() {
    // Wire callbacks into the API service
    API.onRequest((req) => {
      this.currentRequest = req;
    });

    API.onResponse((res) => {
      const entry = { request: this.currentRequest, response: res };
      this.entries.unshift(entry); // newest first
      if (this.entries.length > 50) this.entries.pop();
      this.render();
    });

    document.getElementById("clear-log-btn").addEventListener("click", () => {
      this.entries = [];
      this.render();
    });

    document.getElementById("toggle-log-btn").addEventListener("click", () => {
      const panel = document.getElementById("api-log-panel");
      panel.classList.toggle("collapsed");
      document.getElementById("toggle-log-btn").textContent =
        panel.classList.contains("collapsed") ? "‹" : "›";
    });
  },

  methodClass(method) {
    const map = { GET: "get", POST: "post", PUT: "put", PATCH: "patch", DELETE: "delete" };
    return `method-${map[method] || "get"}`;
  },

  render() {
    const container = document.getElementById("api-log-entries");
    if (this.entries.length === 0) {
      container.innerHTML = `
        <div class="log-empty">
          <div class="log-empty-icon">📡</div>
          <p>No requests yet</p>
          <small>Make an API call to see<br>request & response details here</small>
        </div>`;
      return;
    }

    container.innerHTML = this.entries.map((entry, i) => {
      const req = entry.request;
      const res = entry.response;
      const time = req?.timestamp
        ? req.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "";

      const statusClass = UI.statusClass(res.status);
      const statusText = res.status === 0 ? "Network Error" : `${res.status}`;

      // Mask password in request body for display
      let displayBody = req?.body ? { ...req.body } : null;
      if (displayBody?.password) displayBody.password = "••••••••";
      if (displayBody?.currentPassword) displayBody.currentPassword = "••••••••";
      if (displayBody?.newPassword) displayBody.newPassword = "••••••••";

      return `
        <div class="log-entry" id="log-${i}">
          <div class="log-entry-header" onclick="APILog.toggle(${i})">
            <div class="log-entry-left">
              <span class="method-badge ${this.methodClass(req?.method)}">${req?.method}</span>
              <span class="log-path">${req?.path}</span>
            </div>
            <div class="log-entry-right">
              <span class="log-status ${statusClass}">${statusText}</span>
              <span class="log-duration">${res.duration}ms</span>
              <span class="log-time">${time}</span>
            </div>
          </div>
          <div class="log-entry-body" id="log-body-${i}" style="display:none">
            ${displayBody ? `
              <div class="log-section">
                <span class="log-section-label">↑ Request Body</span>
                <pre class="log-json">${JSON.stringify(displayBody, null, 2)}</pre>
              </div>` : ""}
            <div class="log-section">
              <span class="log-section-label">↓ Response</span>
              <pre class="log-json">${JSON.stringify(res.data, null, 2)}</pre>
            </div>
          </div>
        </div>`;
    }).join("");
  },

  toggle(i) {
    const body = document.getElementById(`log-body-${i}`);
    if (body) body.style.display = body.style.display === "none" ? "block" : "none";
  },
};

// ── Navigation ───────────────────────────────────────────────
const Nav = {
  init() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (!isLoggedIn() && section !== "auth") {
          UI.toast("Please sign in first", "warning");
          return;
        }
        if (section === "users" && !isAdmin()) {
          UI.toast("Admin access required", "error");
          return;
        }
        UI.showSection(section);
        if (section === "profile") Profile.load();
        if (section === "posts") Posts.load();
        if (section === "users") Users.load();
      });
    });

    // Modal close
    document.getElementById("modal-close").addEventListener("click", UI.closeModal);
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) UI.closeModal();
    });
  },
};

// ── Auth Module ───────────────────────────────────────────────
const Auth = {
  init() {
    // Tabs
    document.querySelectorAll(".auth-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".auth-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
      });
    });

    // Sign In form
    document.getElementById("signin-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const email = document.getElementById("signin-email").value;
      const password = document.getElementById("signin-password").value;
      UI.setLoading(btn, true);
      try {
        const res = await API.users.signin(email, password);
        if (res.ok) {
          API.setToken(res.data.token);
          const profileRes = await API.users.profile();
          if (profileRes.ok) {
            state.user = profileRes.data.user;
            localStorage.setItem("user", JSON.stringify(state.user));
          }
          UI.toast("Signed in successfully!", "success");
          UI.updateSidebar();
          UI.showSection("posts");
          Posts.load();
        } else {
          UI.toast(res.data.message || "Invalid credentials", "error");
        }
      } catch {
        UI.toast("Network error — is the server running?", "error");
      }
      UI.setLoading(btn, false);
    });

    // Sign Up form
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      UI.setLoading(btn, true);
      try {
        const res = await API.users.signup(email, password);
        if (res.ok) {
          UI.toast("Account created! Please sign in.", "success");
          document.querySelector('.auth-tab[data-tab="signin"]').click();
          document.getElementById("signin-email").value = email;
        } else {
          const errors = res.data.errors;
          const msg = errors ? errors.map((e) => e.message).join(", ") : res.data.message;
          UI.toast(msg || "Signup failed", "error");
        }
      } catch {
        UI.toast("Network error — is the server running?", "error");
      }
      UI.setLoading(btn, false);
    });

    // Logout
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await API.users.logout();
      API.clearToken();
      state.user = null;
      localStorage.removeItem("user");
      UI.updateSidebar();
      UI.showSection("auth");
      UI.toast("Logged out", "default");
    });
  },
};

// ── Profile Module ────────────────────────────────────────────
const Profile = {
  async load() {
    const display = document.getElementById("profile-display");
    display.innerHTML = `<div class="skeleton-block"></div>`;
    const res = await API.users.profile();
    if (res.ok) {
      state.user = res.data.user;
      localStorage.setItem("user", JSON.stringify(state.user));
      UI.updateSidebar();
      const u = state.user;
      display.innerHTML = `
        <div class="profile-card-inner">
          <div class="profile-avatar">${u.email[0].toUpperCase()}</div>
          <div class="profile-details">
            <div class="profile-row"><span class="profile-label">Email</span><span>${u.email}</span></div>
            <div class="profile-row"><span class="profile-label">Role</span>
              <span class="role-badge ${u.role === "admin" ? "role-admin" : "role-user"}">${u.role}</span>
            </div>
            <div class="profile-row"><span class="profile-label">Age</span><span>${u.age ?? "—"}</span></div>
            <div class="profile-row"><span class="profile-label">Block Count</span><span>${u.blockCount}</span></div>
            <div class="profile-row"><span class="profile-label">Status</span>
              <span class="${u.block ? "badge-destructive" : "badge-success"}">${u.block ? "Blocked" : "Active"}</span>
            </div>
            <div class="profile-row"><span class="profile-label">Member Since</span><span>${UI.formatDate(u.createdAt)}</span></div>
          </div>
        </div>`;
      if (u.age) document.getElementById("profile-age").value = u.age;
    } else {
      display.innerHTML = `<div class="error-text">${res.data.message}</div>`;
    }
  },

  init() {
    document.getElementById("update-profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const age = parseInt(document.getElementById("profile-age").value);
      UI.setLoading(btn, true);
      const res = await API.users.updateProfile(age);
      UI.setLoading(btn, false);
      if (res.ok) {
        UI.toast("Profile updated!", "success");
        Profile.load();
      } else {
        UI.toast(res.data.message || "Update failed", "error");
      }
    });

    document.getElementById("change-password-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const cur = document.getElementById("current-password").value;
      const nw = document.getElementById("new-password").value;
      UI.setLoading(btn, true);
      const res = await API.users.changePassword(cur, nw);
      UI.setLoading(btn, false);
      if (res.ok) {
        UI.toast("Password changed!", "success");
        e.target.reset();
      } else {
        UI.toast(res.data.message || "Failed", "error");
      }
    });
  },
};

// ── Posts Module ──────────────────────────────────────────────
const Posts = {
  list: [],

  async load() {
    const grid = document.getElementById("posts-grid");
    grid.innerHTML = `<div class="loading-state"><span class="spinner-lg"></span><p>Loading posts...</p></div>`;
    const [postsRes, countRes] = await Promise.all([API.posts.getAll(), API.posts.count()]);
    if (postsRes.ok) {
      this.list = postsRes.data.posts;
      document.getElementById("posts-count-badge").textContent =
        `${countRes.ok ? countRes.data.total : this.list.length} posts`;
      this.render(this.list);
    } else {
      grid.innerHTML = `<div class="error-state">${postsRes.data.message}</div>`;
    }
  },

  render(posts) {
    const grid = document.getElementById("posts-grid");
    if (!posts.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No posts found</p>
          <small>Create the first post!</small>
        </div>`;
      return;
    }

    const statusMap = { Happy: "status-happy", Sad: "status-sad", Funny: "status-funny" };

    grid.innerHTML = posts.map((p) => `
      <div class="post-card" data-id="${p._id}">
        <div class="post-card-header">
          <span class="post-status-badge ${statusMap[p.status] || ""}">${p.status || "—"}</span>
          <span class="post-privacy" title="${p.privacy ? "Private" : "Public"}">
            ${p.privacy ? "🔒" : "🌐"}
          </span>
        </div>
        <div class="post-content">${p.content}</div>
        <div class="post-card-footer">
          <span class="post-date">${UI.formatDate(p.createdAt)}</span>
          <div class="post-actions">
            <button class="btn btn-ghost btn-xs" onclick="Posts.openEdit('${p._id}', '${p.content.replace(/'/g, "\\'")}', '${p.status}')">Edit</button>
            <button class="btn btn-ghost btn-xs" onclick="Posts.togglePrivacy('${p._id}')">
              ${p.privacy ? "Make Public" : "Make Private"}
            </button>
            <button class="btn btn-destructive-ghost btn-xs" onclick="Posts.remove('${p._id}')">Delete</button>
          </div>
        </div>
      </div>`).join("");
  },

  async filter() {
    const status = document.getElementById("filter-status").value;
    const privacy = document.getElementById("filter-privacy").value;
    const params = {};
    if (status) params.status = status;
    if (privacy !== "") params.privacy = privacy;
    const res = await API.posts.filter(params);
    if (res.ok) {
      this.render(res.data.posts);
      document.getElementById("posts-count-badge").textContent = `${res.data.count} posts`;
    } else {
      UI.toast(res.data.message || "Filter failed", "error");
    }
  },

  openCreate() {
    UI.openModal("Create Post", `
      <form id="create-post-form">
        <div class="form-group">
          <label class="label">Content <span class="hint-inline">(5–20 chars)</span></label>
          <textarea class="input textarea" id="modal-content" rows="3" maxlength="20" placeholder="Write something..." required></textarea>
        </div>
        <div class="form-group">
          <label class="label">Status</label>
          <select class="input select" id="modal-status" required>
            <option value="">Select status</option>
            <option value="Happy">😊 Happy</option>
            <option value="Sad">😢 Sad</option>
            <option value="Funny">😂 Funny</option>
          </select>
        </div>
        <div class="modal-footer-btns">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Post</button>
        </div>
      </form>`);

    document.getElementById("create-post-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      const content = document.getElementById("modal-content").value;
      const status = document.getElementById("modal-status").value;
      UI.setLoading(btn, true);
      const res = await API.posts.create(content, status);
      UI.setLoading(btn, false);
      if (res.ok) {
        UI.closeModal();
        UI.toast("Post created!", "success");
        Posts.load();
      } else {
        const errors = res.data.errors;
        const msg = errors ? errors.map((e) => e.message).join(", ") : res.data.message;
        UI.toast(msg || "Failed", "error");
      }
    });
  },

  openEdit(id, content, status) {
    UI.openModal("Edit Post", `
      <form id="edit-post-form">
        <div class="form-group">
          <label class="label">Content <span class="hint-inline">(5–20 chars)</span></label>
          <textarea class="input textarea" id="edit-content" rows="3" maxlength="20" required>${content}</textarea>
        </div>
        <div class="form-group">
          <label class="label">Status</label>
          <select class="input select" id="edit-status" required>
            <option value="Happy" ${status === "Happy" ? "selected" : ""}>😊 Happy</option>
            <option value="Sad" ${status === "Sad" ? "selected" : ""}>😢 Sad</option>
            <option value="Funny" ${status === "Funny" ? "selected" : ""}>😂 Funny</option>
          </select>
        </div>
        <div class="modal-footer-btns">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>`);

    document.getElementById("edit-post-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      const newContent = document.getElementById("edit-content").value;
      const newStatus = document.getElementById("edit-status").value;
      UI.setLoading(btn, true);
      const res = await API.posts.update(id, newContent, newStatus);
      UI.setLoading(btn, false);
      if (res.ok) {
        UI.closeModal();
        UI.toast("Post updated!", "success");
        Posts.load();
      } else {
        const errors = res.data.errors;
        const msg = errors ? errors.map((e) => e.message).join(", ") : res.data.message;
        UI.toast(msg || "Failed", "error");
      }
    });
  },

  async togglePrivacy(id) {
    const res = await API.posts.togglePrivacy(id);
    if (res.ok) {
      UI.toast(`Privacy set to ${res.data.post.privacy ? "Private 🔒" : "Public 🌐"}`, "success");
      Posts.load();
    } else {
      UI.toast(res.data.message || "Failed", "error");
    }
  },

  async remove(id) {
    if (!confirm("Delete this post?")) return;
    const res = await API.posts.delete(id);
    if (res.ok) {
      UI.toast("Post deleted", "success");
      Posts.load();
    } else {
      UI.toast(res.data.message || "Failed", "error");
    }
  },

  init() {
    document.getElementById("create-post-btn").addEventListener("click", () => Posts.openCreate());
    document.getElementById("load-posts-btn").addEventListener("click", () => Posts.load());
    document.getElementById("filter-btn").addEventListener("click", () => Posts.filter());
    document.getElementById("reset-filter-btn").addEventListener("click", () => {
      document.getElementById("filter-status").value = "";
      document.getElementById("filter-privacy").value = "";
      Posts.load();
    });
  },
};

// ── Users Module (Admin) ──────────────────────────────────────
const Users = {
  async load() {
    document.getElementById("users-search-input").value = "";
    const res = await API.users.getAll();
    if (res.ok) {
      this.render(res.data.users);
      document.getElementById("users-count-badge").textContent = `${res.data.users.length} users`;
    } else {
      UI.toast(res.data.message || "Failed to load users", "error");
    }
  },

  async loadBlocked() {
    const res = await API.users.getBlocked();
    if (res.ok) {
      this.render(res.data.users);
      document.getElementById("users-count-badge").textContent = `${res.data.count} blocked`;
    }
  },

  async search() {
    const email = document.getElementById("users-search-input").value.trim();
    if (!email) { this.load(); return; }
    const res = await API.users.search(email);
    if (res.ok) {
      this.render(res.data.users);
      document.getElementById("users-count-badge").textContent = `${res.data.count} found`;
    }
  },

  render(users) {
    const table = document.getElementById("users-table-body");
    if (!users.length) {
      table.innerHTML = `<tr><td colspan="6" class="table-empty">No users found</td></tr>`;
      return;
    }
    table.innerHTML = users.map((u) => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar-sm">${u.email[0].toUpperCase()}</div>
            <span>${u.email}</span>
          </div>
        </td>
        <td><span class="role-badge ${u.role === "admin" ? "role-admin" : "role-user"}">${u.role}</span></td>
        <td>${u.age ?? "—"}</td>
        <td>${u.blockCount}</td>
        <td>
          <span class="${u.block ? "badge-destructive" : "badge-success"}">
            ${u.block ? "Blocked" : "Active"}
          </span>
        </td>
        <td>
          <div class="table-actions">
            ${u.block
              ? `<button class="btn btn-outline btn-xs" onclick="Users.unblock('${u._id}')">Unblock</button>`
              : `<button class="btn btn-outline btn-xs" onclick="Users.block('${u._id}')">Block</button>`
            }
            <button class="btn btn-destructive-ghost btn-xs" onclick="Users.remove('${u._id}')">Delete</button>
          </div>
        </td>
      </tr>`).join("");
  },

  async block(id) {
    if (!confirm("Block this user?")) return;
    const res = await API.users.block(id);
    if (res.ok) { UI.toast("User blocked", "success"); Users.load(); }
    else UI.toast(res.data.message || "Failed", "error");
  },

  async unblock(id) {
    const res = await API.users.unblock(id);
    if (res.ok) { UI.toast("User unblocked", "success"); Users.load(); }
    else UI.toast(res.data.message || "Failed", "error");
  },

  async remove(id) {
    if (!confirm("Delete this user permanently?")) return;
    const res = await API.users.delete(id);
    if (res.ok) { UI.toast("User deleted", "success"); Users.load(); }
    else UI.toast(res.data.message || "Failed", "error");
  },

  init() {
    document.getElementById("load-users-btn").addEventListener("click", () => Users.load());
    document.getElementById("blocked-users-btn").addEventListener("click", () => Users.loadBlocked());
    document.getElementById("search-users-btn").addEventListener("click", () => Users.search());
    document.getElementById("users-search-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") Users.search();
    });
  },
};

// ── App Initialization ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  APILog.init();
  Nav.init();
  Auth.init();
  Profile.init();
  Posts.init();
  Users.init();
  UI.updateSidebar();

  // Go to posts if already signed in, else auth
  if (isLoggedIn() && state.user) {
    UI.showSection("posts");
    Posts.load();
  } else {
    UI.showSection("auth");
  }
});
