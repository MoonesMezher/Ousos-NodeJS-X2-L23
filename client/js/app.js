/* ============================================================
   PULSE — COMMERCIAL APP LOGIC
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ── Global State ────────────────────────────────────────────
  const state = {
    currentUser: null,
    currentView: "feed",
    feed: {
      page: 1,
      limit: 12,
      status: "ALL",
      privacy: "ALL",
      search: "",
      totalPages: 1,
      totalCount: 0
    },
    admin: {
      page: 1,
      limit: 10,
      search: "",
      filter: "all",
      totalPages: 1,
      totalUsers: 0
    }
  };

  // ── DOM References ──────────────────────────────────────────
  const elements = {
    // Nav
    navFeed: document.getElementById("nav-feed"),
    navMyPosts: document.getElementById("nav-my-posts"),
    navAdmin: document.getElementById("nav-admin"),
    navAuthButtons: document.getElementById("nav-auth-buttons"),
    navUserPill: document.getElementById("nav-user-pill"),
    headerAvatar: document.getElementById("header-avatar"),
    headerUserEmail: document.getElementById("header-user-email"),
    headerUserRole: document.getElementById("header-user-role"),
    openSigninBtn: document.getElementById("open-signin-btn"),
    quickCreateBtn: document.getElementById("quick-create-btn"),
    userProfileTrigger: document.getElementById("user-profile-trigger"),
    logoutBtn: document.getElementById("logout-btn"),
    brandLogo: document.getElementById("brand-logo"),

    // Views
    viewFeed: document.getElementById("view-feed"),
    viewMyPosts: document.getElementById("view-my-posts"),
    viewAdmin: document.getElementById("view-admin"),

    // Feed Composer
    feedComposer: document.getElementById("feed-composer"),
    composerAvatar: document.getElementById("composer-avatar"),
    composerForm: document.getElementById("composer-form"),
    composerContent: document.getElementById("composer-content"),
    composerPrivacy: document.getElementById("composer-privacy"),
    composerPrivacyLabel: document.getElementById("composer-privacy-label"),
    charCount: document.getElementById("char-count"),

    // Feed Toolbar & Content
    feedSearch: document.getElementById("feed-search"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    statusFilterPills: document.getElementById("status-filter-pills"),
    privacyFilterPills: document.getElementById("privacy-filter-pills"),
    feedResultsCount: document.getElementById("feed-results-count"),
    feedPerPage: document.getElementById("feed-per-page"),
    postsContainer: document.getElementById("posts-container"),
    feedPagination: document.getElementById("feed-pagination"),
    prevPageBtn: document.getElementById("prev-page-btn"),
    nextPageBtn: document.getElementById("next-page-btn"),
    pageNumbersContainer: document.getElementById("page-numbers-container"),

    // My Posts
    myPostsContainer: document.getElementById("my-posts-container"),
    myPostsCreateBtn: document.getElementById("my-posts-create-btn"),

    // Admin Console
    statTotalUsers: document.getElementById("stat-total-users"),
    statActiveUsers: document.getElementById("stat-active-users"),
    statBlockedUsers: document.getElementById("stat-blocked-users"),
    statTotalPosts: document.getElementById("stat-total-posts"),
    adminUsersSearch: document.getElementById("admin-users-search"),
    adminFilterPills: document.getElementById("admin-filter-pills"),
    adminUsersTbody: document.getElementById("admin-users-tbody"),
    adminUsersInfo: document.getElementById("admin-users-info"),
    adminPagination: document.getElementById("admin-pagination"),
    adminPrevBtn: document.getElementById("admin-prev-btn"),
    adminNextBtn: document.getElementById("admin-next-btn"),
    adminPageIndicator: document.getElementById("admin-page-indicator"),

    // Modals
    authModal: document.getElementById("auth-modal"),
    closeAuthModal: document.getElementById("close-auth-modal"),
    signinForm: document.getElementById("signin-form"),
    signupForm: document.getElementById("signup-form"),
    signinEmail: document.getElementById("signin-email"),
    signinPassword: document.getElementById("signin-password"),
    signupEmail: document.getElementById("signup-email"),
    signupPassword: document.getElementById("signup-password"),
    demoAdminBtn: document.getElementById("demo-admin-btn"),
    demoUserBtn: document.getElementById("demo-user-btn"),

    profileModal: document.getElementById("profile-modal"),
    closeProfileModal: document.getElementById("close-profile-modal"),
    profileModalAvatar: document.getElementById("profile-modal-avatar"),
    profileModalEmail: document.getElementById("profile-modal-email"),
    profileModalRole: document.getElementById("profile-modal-role"),
    profileModalAge: document.getElementById("profile-modal-age"),
    profileModalBirth: document.getElementById("profile-modal-birth"),
    updateAgeForm: document.getElementById("update-age-form"),
    updateAgeInput: document.getElementById("update-age-input"),
    changePasswordForm: document.getElementById("change-password-form"),
    currentPasswordInput: document.getElementById("current-password-input"),
    newPasswordInput: document.getElementById("new-password-input"),

    editPostModal: document.getElementById("edit-post-modal"),
    closeEditModal: document.getElementById("close-edit-modal"),
    cancelEditBtn: document.getElementById("cancel-edit-btn"),
    editPostForm: document.getElementById("edit-post-form"),
    editPostId: document.getElementById("edit-post-id"),
    editPostContent: document.getElementById("edit-post-content"),
    editPostPrivacy: document.getElementById("edit-post-privacy"),
    editPrivacyLabel: document.getElementById("edit-privacy-label"),

    toastContainer: document.getElementById("toast-container")
  };

  // ── Helper: Avatar Colors ───────────────────────────────────
  function getAvatarColor(str) {
    if (!str) return "#6366f1";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 45%)`;
  }

  function getInitials(email) {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // ── Helper: Toasts ──────────────────────────────────────────
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
    toast.innerHTML = `<span style="font-weight:700">${icon}</span> <span>${message}</span>`;

    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px) scale(0.95)";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // ── Navigation & View Switching ─────────────────────────────
  function switchView(viewName) {
    state.currentView = viewName;

    // Nav pills active state
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.view === viewName);
    });

    // View sections
    elements.viewFeed.classList.toggle("active", viewName === "feed");
    elements.viewMyPosts.classList.toggle("active", viewName === "my-posts");
    elements.viewAdmin.classList.toggle("active", viewName === "admin");

    if (viewName === "feed") {
      loadFeed();
    } else if (viewName === "my-posts") {
      loadMyPosts();
    } else if (viewName === "admin") {
      loadAdminView();
    }
  }

  // ── Authentication & Session ────────────────────────────────
  async function initSession() {
    const token = API.getToken();
    if (!token) {
      updateNavForGuest();
      return;
    }

    try {
      const res = await API.users.profile();
      if (res.ok && res.data && res.data.user) {
        state.currentUser = res.data.user;
        updateNavForUser(state.currentUser);
      } else {
        API.clearToken();
        state.currentUser = null;
        updateNavForGuest();
      }
    } catch (_) {
      API.clearToken();
      state.currentUser = null;
      updateNavForGuest();
    }
  }

  function updateNavForGuest() {
    elements.navAuthButtons.style.display = "block";
    elements.navUserPill.style.display = "none";
    elements.navMyPosts.style.display = "none";
    elements.navAdmin.style.display = "none";
    elements.composerAvatar.textContent = "?";
    elements.composerAvatar.style.background = "#27272a";
  }

  function updateNavForUser(user) {
    elements.navAuthButtons.style.display = "none";
    elements.navUserPill.style.display = "flex";
    elements.navMyPosts.style.display = "flex";

    const initials = getInitials(user.email);
    const color = getAvatarColor(user.email);

    elements.headerAvatar.textContent = initials;
    elements.headerAvatar.style.background = color;
    elements.headerUserEmail.textContent = user.email;
    elements.headerUserRole.textContent = user.role;
    elements.headerUserRole.className = `role-badge role-${user.role}`;

    elements.composerAvatar.textContent = initials;
    elements.composerAvatar.style.background = color;

    // Show admin tab only for admins
    if (user.role === "admin") {
      elements.navAdmin.style.display = "flex";
    } else {
      elements.navAdmin.style.display = "none";
    }
  }

  // ── Feed Post Composer ──────────────────────────────────────
  elements.composerContent.addEventListener("input", (e) => {
    const len = e.target.value.length;
    elements.charCount.textContent = len;
    if (len > 280) {
      elements.charCount.style.color = "var(--destructive)";
    } else {
      elements.charCount.style.color = "var(--text-muted)";
    }
  });

  elements.composerPrivacy.addEventListener("change", (e) => {
    elements.composerPrivacyLabel.textContent = e.target.checked ? "🔒 Private Post" : "🌐 Public Post";
  });

  elements.composerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!state.currentUser) {
      showToast("Please sign in to publish a post", "info");
      openAuthModal("signin");
      return;
    }

    const content = elements.composerContent.value.trim();
    if (content.length < 3 || content.length > 280) {
      showToast("Post content must be between 3 and 280 characters", "error");
      return;
    }

    const statusRadio = document.querySelector('input[name="post-status"]:checked');
    const status = statusRadio ? statusRadio.value : "Happy";
    const privacy = elements.composerPrivacy.checked;

    try {
      const res = await API.posts.create(content, status, privacy);
      if (res.ok) {
        showToast("Post published successfully!", "success");
        elements.composerContent.value = "";
        elements.charCount.textContent = "0";
        elements.composerPrivacy.checked = false;
        elements.composerPrivacyLabel.textContent = "🌐 Public Post";
        state.feed.page = 1;
        loadFeed();
      } else {
        const errorMsg = res.data && res.data.message ? res.data.message : "Failed to create post";
        showToast(errorMsg, "error");
      }
    } catch (err) {
      showToast("Network error publishing post", "error");
    }
  });

  // ── Render Post Card ────────────────────────────────────────
  function renderPostCard(post) {
    const isOwner = state.currentUser && post.user && (
      (typeof post.user === "object" && post.user._id === state.currentUser._id) ||
      (typeof post.user === "string" && post.user === state.currentUser._id)
    );
    const isAdmin = state.currentUser && state.currentUser.role === "admin";
    const canManage = isOwner || isAdmin;

    const authorEmail = post.user && typeof post.user === "object" ? post.user.email : "Anonymous";
    const authorRole = post.user && typeof post.user === "object" ? post.user.role : "user";
    const initials = getInitials(authorEmail);
    const color = getAvatarColor(authorEmail);

    const card = document.createElement("article");
    card.className = "post-card";
    card.id = `post-${post._id}`;

    const moodEmoji = post.status === "Happy" ? "😊" : post.status === "Funny" ? "😂" : "😢";

    card.innerHTML = `
      <div class="post-card-header">
        <div class="author-info">
          <div class="avatar avatar-md" style="background:${color}">${initials}</div>
          <div class="author-meta">
            <div class="author-email-row">
              <span class="author-email">${authorEmail}</span>
              ${authorRole === "admin" ? '<span class="role-badge role-admin">Admin</span>' : ''}
            </div>
            <span class="post-timestamp">${formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div class="post-badges">
          <span class="mood-badge ${post.status}">${moodEmoji} ${post.status}</span>
          <span class="visibility-badge ${post.privacy ? 'visibility-private' : 'visibility-public'}">
            ${post.privacy ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>
      </div>

      <div class="post-content">${escapeHTML(post.content)}</div>

      <div class="post-card-footer">
        <span class="post-meta-sub">${post.privacy ? 'Only visible to you' : 'Shared with community'}</span>
        ${canManage ? `
          <div class="post-actions">
            <button class="action-btn toggle-privacy-btn" data-id="${post._id}" title="Toggle Privacy">
              ${post.privacy ? 'Make Public' : 'Make Private'}
            </button>
            <button class="action-btn edit-post-btn" data-id="${post._id}" title="Edit Post">
              ✏️ Edit
            </button>
            <button class="action-btn delete-btn delete-post-btn" data-id="${post._id}" title="Delete Post">
              🗑️ Delete
            </button>
          </div>
        ` : ''}
      </div>
    `;

    return card;
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // ── Load Feed ───────────────────────────────────────────────
  async function loadFeed() {
    elements.postsContainer.innerHTML = `
      <div class="empty-state" style="border:none">
        <p>Loading community posts...</p>
      </div>
    `;

    try {
      const res = await API.posts.getAll({
        page: state.feed.page,
        limit: state.feed.limit,
        status: state.feed.status,
        privacy: state.feed.privacy,
        search: state.feed.search
      });

      if (!res.ok) {
        elements.postsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Unable to load posts</h3>
            <p>${res.data && res.data.message ? res.data.message : 'Please check connection'}</p>
            <button class="btn btn-outline btn-sm" onclick="location.reload()">Retry</button>
          </div>
        `;
        return;
      }

      const items = res.data.items || res.data.posts || [];
      const pagination = res.data.pagination || { total: items.length, pages: 1, page: 1 };

      state.feed.totalPages = pagination.pages;
      state.feed.totalCount = pagination.total;

      // Update summary bar
      const start = items.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
      const end = Math.min(pagination.page * pagination.limit, pagination.total);
      elements.feedResultsCount.textContent = `Showing ${start}–${end} of ${pagination.total} posts`;

      if (items.length === 0) {
        elements.postsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>No posts found</h3>
            <p>Try adjusting your search or mood filter, or be the first to publish a post!</p>
          </div>
        `;
        elements.feedPagination.style.display = "none";
        return;
      }

      elements.postsContainer.innerHTML = "";
      items.forEach(post => {
        elements.postsContainer.appendChild(renderPostCard(post));
      });

      renderFeedPagination(pagination);
      attachPostActionListeners();

    } catch (err) {
      elements.postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to connect to server</h3>
          <p>Please make sure the backend server is running.</p>
        </div>
      `;
    }
  }

  // ── Feed Pagination ─────────────────────────────────────────
  function renderFeedPagination(pagination) {
    if (pagination.pages <= 1) {
      elements.feedPagination.style.display = "none";
      return;
    }

    elements.feedPagination.style.display = "flex";
    elements.prevPageBtn.disabled = !pagination.isPrev;
    elements.nextPageBtn.disabled = !pagination.isNext;

    elements.pageNumbersContainer.innerHTML = "";

    const current = pagination.page;
    const total = pagination.pages;
    const pagesToShow = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pagesToShow.push(i);
    } else {
      pagesToShow.push(1);
      if (current > 3) pagesToShow.push("...");

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pagesToShow.push(i);
      }

      if (current < total - 2) pagesToShow.push("...");
      pagesToShow.push(total);
    }

    pagesToShow.forEach(p => {
      if (p === "...") {
        const span = document.createElement("span");
        span.className = "page-ellipsis";
        span.textContent = "…";
        elements.pageNumbersContainer.appendChild(span);
      } else {
        const btn = document.createElement("button");
        btn.className = `page-btn ${p === current ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener("click", () => {
          if (p !== current) {
            state.feed.page = p;
            loadFeed();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
        elements.pageNumbersContainer.appendChild(btn);
      }
    });
  }

  elements.prevPageBtn.addEventListener("click", () => {
    if (state.feed.page > 1) {
      state.feed.page--;
      loadFeed();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  elements.nextPageBtn.addEventListener("click", () => {
    if (state.feed.page < state.feed.totalPages) {
      state.feed.page++;
      loadFeed();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // ── Post Actions (Toggle, Edit, Delete) ──────────────────────
  function attachPostActionListeners() {
    // Privacy toggle
    document.querySelectorAll(".toggle-privacy-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          const res = await API.posts.togglePrivacy(id);
          if (res.ok) {
            showToast("Post visibility updated", "success");
            if (state.currentView === "my-posts") {
              loadMyPosts();
            } else {
              loadFeed();
            }
          } else {
            showToast(res.data?.message || "Failed to update privacy", "error");
          }
        } catch (_) {
          showToast("Network error", "error");
        }
      });
    });

    // Edit Post
    document.querySelectorAll(".edit-post-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          const res = await API.posts.getById(id);
          if (res.ok && res.data && res.data.post) {
            openEditModal(res.data.post);
          } else {
            showToast("Could not load post details", "error");
          }
        } catch (_) {
          showToast("Network error", "error");
        }
      });
    });

    // Delete Post
    document.querySelectorAll(".delete-post-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
          const res = await API.posts.delete(id);
          if (res.ok) {
            showToast("Post deleted successfully", "success");
            if (state.currentView === "my-posts") {
              loadMyPosts();
            } else {
              loadFeed();
            }
          } else {
            showToast(res.data?.message || "Failed to delete post", "error");
          }
        } catch (_) {
          showToast("Network error", "error");
        }
      });
    });
  }

  // ── Edit Post Modal ─────────────────────────────────────────
  function openEditModal(post) {
    elements.editPostId.value = post._id;
    elements.editPostContent.value = post.content;
    elements.editPostPrivacy.checked = !!post.privacy;
    elements.editPrivacyLabel.textContent = post.privacy ? "🔒 Private Post" : "🌐 Public Post";

    const radio = document.querySelector(`input[name="edit-post-status"][value="${post.status}"]`);
    if (radio) radio.checked = true;

    elements.editPostModal.classList.add("active");
  }

  elements.editPostPrivacy.addEventListener("change", (e) => {
    elements.editPrivacyLabel.textContent = e.target.checked ? "🔒 Private Post" : "🌐 Public Post";
  });

  elements.closeEditModal.addEventListener("click", () => elements.editPostModal.classList.remove("active"));
  elements.cancelEditBtn.addEventListener("click", () => elements.editPostModal.classList.remove("active"));

  elements.editPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = elements.editPostId.value;
    const content = elements.editPostContent.value.trim();
    const statusRadio = document.querySelector('input[name="edit-post-status"]:checked');
    const status = statusRadio ? statusRadio.value : "Happy";
    const privacy = elements.editPostPrivacy.checked;

    if (content.length < 3 || content.length > 280) {
      showToast("Content must be between 3 and 280 characters", "error");
      return;
    }

    try {
      const res = await API.posts.update(id, content, status, privacy);
      if (res.ok) {
        showToast("Post updated successfully", "success");
        elements.editPostModal.classList.remove("active");
        if (state.currentView === "my-posts") {
          loadMyPosts();
        } else {
          loadFeed();
        }
      } else {
        showToast(res.data?.message || "Failed to update post", "error");
      }
    } catch (_) {
      showToast("Network error updating post", "error");
    }
  });

  // ── Feed Filter Handlers ────────────────────────────────────
  elements.statusFilterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    elements.statusFilterPills.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");

    state.feed.status = pill.dataset.filterStatus;
    state.feed.page = 1;
    loadFeed();
  });

  elements.privacyFilterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    elements.privacyFilterPills.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");

    state.feed.privacy = pill.dataset.filterPrivacy;
    state.feed.page = 1;
    loadFeed();
  });

  // Search Debounce
  let searchTimeout = null;
  elements.feedSearch.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    elements.clearSearchBtn.style.display = val ? "block" : "none";

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.feed.search = val;
      state.feed.page = 1;
      loadFeed();
    }, 350);
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    elements.feedSearch.value = "";
    elements.clearSearchBtn.style.display = "none";
    state.feed.search = "";
    state.feed.page = 1;
    loadFeed();
  });

  elements.feedPerPage.addEventListener("change", (e) => {
    state.feed.limit = parseInt(e.target.value, 10);
    state.feed.page = 1;
    loadFeed();
  });

  // ── My Posts View ───────────────────────────────────────────
  async function loadMyPosts() {
    if (!state.currentUser) {
      elements.myPostsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔐</div>
          <h3>Sign in required</h3>
          <p>Please sign in to view and manage your posts.</p>
          <button class="btn btn-primary btn-sm" id="my-posts-signin-prompt">Sign In</button>
        </div>
      `;
      document.getElementById("my-posts-signin-prompt")?.addEventListener("click", () => openAuthModal("signin"));
      return;
    }

    elements.myPostsContainer.innerHTML = `
      <div class="empty-state" style="border:none">
        <p>Loading your posts...</p>
      </div>
    `;

    try {
      const res = await API.posts.getAll({ user: "mine" });
      if (!res.ok) {
        showToast("Failed to load your posts", "error");
        return;
      }

      const posts = res.data.posts || res.data.items || [];
      if (posts.length === 0) {
        elements.myPostsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✍️</div>
            <h3>No posts yet</h3>
            <p>You haven't published any posts yet. Share your thoughts with the community!</p>
            <button class="btn btn-primary btn-sm" id="my-posts-first-create">Create Your First Post</button>
          </div>
        `;
        document.getElementById("my-posts-first-create")?.addEventListener("click", () => {
          switchView("feed");
          elements.composerContent.focus();
        });
        return;
      }

      elements.myPostsContainer.innerHTML = "";
      posts.forEach(post => {
        elements.myPostsContainer.appendChild(renderPostCard(post));
      });
      attachPostActionListeners();

    } catch (_) {
      elements.myPostsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Error loading posts</h3>
          <p>Check connection and try again.</p>
        </div>
      `;
    }
  }

  elements.myPostsCreateBtn.addEventListener("click", () => {
    switchView("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
    elements.composerContent.focus();
  });

  // ── Admin Console ───────────────────────────────────────────
  async function loadAdminView() {
    if (!state.currentUser || state.currentUser.role !== "admin") {
      switchView("feed");
      showToast("Access restricted to administrators", "error");
      return;
    }

    loadAdminStats();
    loadAdminUsers();
  }

  async function loadAdminStats() {
    try {
      const [usersRes, postsRes] = await Promise.all([
        API.users.stats(),
        API.posts.count()
      ]);

      if (usersRes.ok && usersRes.data) {
        elements.statTotalUsers.textContent = usersRes.data.totalUsers || 0;
        elements.statActiveUsers.textContent = usersRes.data.activeUsers || 0;
        elements.statBlockedUsers.textContent = usersRes.data.blockedUsers || 0;
      }

      if (postsRes.ok && postsRes.data) {
        elements.statTotalPosts.textContent = postsRes.data.total || 0;
      }
    } catch (_) {}
  }

  async function loadAdminUsers() {
    elements.adminUsersTbody.innerHTML = `
      <tr>
        <td colspan="7" class="table-empty">Loading directory...</td>
      </tr>
    `;

    const blockedParam = state.admin.filter === "blocked" ? "true" : state.admin.filter === "active" ? "false" : "";

    try {
      const res = await API.users.pagination(
        state.admin.page,
        state.admin.limit,
        state.admin.search,
        blockedParam
      );

      if (!res.ok) {
        elements.adminUsersTbody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty">Failed to load users: ${res.data?.message || 'Error'}</td>
          </tr>
        `;
        return;
      }

      const items = res.data.items || [];
      const pagination = res.data.pagination || { total: items.length, pages: 1, page: 1 };

      state.admin.totalPages = pagination.pages;
      state.admin.totalUsers = pagination.total;

      elements.adminPageIndicator.textContent = `${pagination.page} / ${pagination.pages || 1}`;
      elements.adminPrevBtn.disabled = !pagination.isPrev;
      elements.adminNextBtn.disabled = !pagination.isNext;
      elements.adminUsersInfo.textContent = `Showing ${items.length} of ${pagination.total} registered users`;

      if (items.length === 0) {
        elements.adminUsersTbody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty">No users found matching query</td>
          </tr>
        `;
        return;
      }

      elements.adminUsersTbody.innerHTML = "";
      items.forEach(u => {
        const initials = getInitials(u.email);
        const color = getAvatarColor(u.email);
        const estimatedBirth = u.age ? new Date().getFullYear() - u.age : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="table-user-cell">
              <div class="avatar avatar-sm" style="background:${color}">${initials}</div>
              <span class="table-user-email">${u.email}</span>
            </div>
          </td>
          <td>
            <span class="role-badge role-${u.role}">${u.role}</span>
          </td>
          <td>${u.age || "—"}</td>
          <td>${estimatedBirth}</td>
          <td>${u.blockCount || 0}</td>
          <td>
            <span class="status-badge ${u.block ? 'status-blocked' : 'status-active'}">
              ${u.block ? 'Blocked' : 'Active'}
            </span>
          </td>
          <td style="text-align:right">
            ${u.role !== "admin" ? `
              <button class="action-btn admin-toggle-block-btn" data-id="${u._id}" data-blocked="${u.block}">
                ${u.block ? '🔓 Unblock' : '🔒 Block'}
              </button>
              <button class="action-btn delete-btn admin-delete-user-btn" data-id="${u._id}" data-email="${u.email}">
                🗑️ Delete
              </button>
            ` : '<span style="font-size:0.75rem;color:var(--text-muted)">Superadmin</span>'}
          </td>
        `;

        elements.adminUsersTbody.appendChild(tr);
      });

      attachAdminActionListeners();

    } catch (_) {
      elements.adminUsersTbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty">Network error loading users</td>
        </tr>
      `;
    }
  }

  function attachAdminActionListeners() {
    // Block / Unblock
    document.querySelectorAll(".admin-toggle-block-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const isBlocked = e.currentTarget.dataset.blocked === "true";

        try {
          const res = isBlocked ? await API.users.unblock(id) : await API.users.block(id);
          if (res.ok) {
            showToast(isBlocked ? "User unblocked successfully" : "User blocked successfully", "success");
            loadAdminStats();
            loadAdminUsers();
          } else {
            showToast(res.data?.message || "Action failed", "error");
          }
        } catch (_) {
          showToast("Network error", "error");
        }
      });
    });

    // Delete User
    document.querySelectorAll(".admin-delete-user-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const email = e.currentTarget.dataset.email;

        if (!confirm(`Are you sure you want to delete user ${email}? This action is irreversible.`)) return;

        try {
          const res = await API.users.delete(id);
          if (res.ok) {
            showToast(`User ${email} deleted`, "success");
            loadAdminStats();
            loadAdminUsers();
          } else {
            showToast(res.data?.message || "Failed to delete user", "error");
          }
        } catch (_) {
          showToast("Network error", "error");
        }
      });
    });
  }

  // Admin Pagination & Filters
  elements.adminPrevBtn.addEventListener("click", () => {
    if (state.admin.page > 1) {
      state.admin.page--;
      loadAdminUsers();
    }
  });

  elements.adminNextBtn.addEventListener("click", () => {
    if (state.admin.page < state.admin.totalPages) {
      state.admin.page++;
      loadAdminUsers();
    }
  });

  let adminSearchTimeout = null;
  elements.adminUsersSearch.addEventListener("input", (e) => {
    clearTimeout(adminSearchTimeout);
    adminSearchTimeout = setTimeout(() => {
      state.admin.search = e.target.value.trim();
      state.admin.page = 1;
      loadAdminUsers();
    }, 350);
  });

  elements.adminFilterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    elements.adminFilterPills.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");

    state.admin.filter = pill.dataset.adminFilter;
    state.admin.page = 1;
    loadAdminUsers();
  });

  // ── Auth Modal (Sign In / Sign Up) ──────────────────────────
  function openAuthModal(tab = "signin") {
    switchAuthTab(tab);
    elements.authModal.classList.add("active");
  }

  function closeAuthModal() {
    elements.authModal.classList.remove("active");
  }

  function switchAuthTab(tab) {
    document.querySelectorAll(".auth-tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.authTab === tab);
    });
    elements.signinForm.classList.toggle("active", tab === "signin");
    elements.signupForm.classList.toggle("active", tab === "signup");
  }

  document.querySelectorAll(".auth-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchAuthTab(btn.dataset.authTab));
  });

  elements.openSigninBtn.addEventListener("click", () => openAuthModal("signin"));
  elements.closeAuthModal.addEventListener("click", closeAuthModal);

  // Sign In submit
  elements.signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.signinEmail.value.trim();
    const password = elements.signinPassword.value;

    try {
      const res = await API.users.signin(email, password);
      if (res.ok && res.data && res.data.token) {
        API.setToken(res.data.token);
        showToast("Signed in successfully!", "success");
        closeAuthModal();
        await initSession();
        loadFeed();
      } else {
        showToast(res.data?.message || "Invalid credentials", "error");
      }
    } catch (_) {
      showToast("Network error connecting to backend", "error");
    }
  });

  // Sign Up submit
  elements.signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;

    try {
      const res = await API.users.signup(email, password);
      if (res.ok) {
        showToast("Account created! Signing in...", "success");
        // Auto sign in
        const signinRes = await API.users.signin(email, password);
        if (signinRes.ok && signinRes.data?.token) {
          API.setToken(signinRes.data.token);
          closeAuthModal();
          await initSession();
          loadFeed();
        } else {
          switchAuthTab("signin");
          elements.signinEmail.value = email;
        }
      } else {
        showToast(res.data?.message || "Registration failed", "error");
      }
    } catch (_) {
      showToast("Network error registering account", "error");
    }
  });

  // Demo Buttons
  elements.demoAdminBtn.addEventListener("click", () => {
    elements.signinEmail.value = "admin@admin.com";
    elements.signinPassword.value = "adminADMIN123!";
    elements.signinForm.dispatchEvent(new Event("submit"));
  });

  elements.demoUserBtn.addEventListener("click", () => {
    elements.signinEmail.value = "user1@example.com";
    elements.signinPassword.value = "Password123!";
    elements.signinForm.dispatchEvent(new Event("submit"));
  });

  // Logout
  elements.logoutBtn.addEventListener("click", async () => {
    try {
      await API.users.logout();
    } catch (_) {}
    API.clearToken();
    state.currentUser = null;
    updateNavForGuest();
    showToast("Signed out", "info");
    switchView("feed");
  });

  // ── Profile Modal ───────────────────────────────────────────
  elements.userProfileTrigger.addEventListener("click", () => {
    if (!state.currentUser) return;
    const u = state.currentUser;
    elements.profileModalAvatar.textContent = getInitials(u.email);
    elements.profileModalAvatar.style.background = getAvatarColor(u.email);
    elements.profileModalEmail.textContent = u.email;
    elements.profileModalRole.textContent = u.role;
    elements.profileModalRole.className = `role-badge role-${u.role}`;
    elements.profileModalAge.textContent = u.age || "Not set";
    elements.profileModalBirth.textContent = u.bitrthDate || (u.age ? new Date().getFullYear() - u.age : "—");
    elements.updateAgeInput.value = u.age || "";

    elements.profileModal.classList.add("active");
  });

  elements.closeProfileModal.addEventListener("click", () => elements.profileModal.classList.remove("active"));

  // Update Age
  elements.updateAgeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const age = parseInt(elements.updateAgeInput.value, 10);
    if (!age) return;

    try {
      const res = await API.users.updateProfile(age);
      if (res.ok) {
        showToast("Profile age updated", "success");
        state.currentUser.age = age;
        state.currentUser.bitrthDate = new Date().getFullYear() - age;
        elements.profileModalAge.textContent = age;
        elements.profileModalBirth.textContent = state.currentUser.bitrthDate;
      } else {
        showToast(res.data?.message || "Failed to update age", "error");
      }
    } catch (_) {
      showToast("Network error", "error");
    }
  });

  // Change Password
  elements.changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = elements.currentPasswordInput.value;
    const newPassword = elements.newPasswordInput.value;

    try {
      const res = await API.users.changePassword(currentPassword, newPassword);
      if (res.ok) {
        showToast("Password changed successfully", "success");
        elements.currentPasswordInput.value = "";
        elements.newPasswordInput.value = "";
        elements.profileModal.classList.remove("active");
      } else {
        showToast(res.data?.message || "Failed to change password", "error");
      }
    } catch (_) {
      showToast("Network error", "error");
    }
  });

  // Quick create button from navbar
  elements.quickCreateBtn.addEventListener("click", () => {
    switchView("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
    elements.composerContent.focus();
  });

  elements.brandLogo.addEventListener("click", () => switchView("feed"));
  elements.navFeed.addEventListener("click", () => switchView("feed"));
  elements.navMyPosts.addEventListener("click", () => switchView("my-posts"));
  elements.navAdmin.addEventListener("click", () => switchView("admin"));

  // Close modals on escape key or backdrop click
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    }
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // ── Init App ────────────────────────────────────────────────
  async function init() {
    if (window.location.protocol === "file:") {
      const banner = document.createElement("div");
      banner.style.cssText = "background:linear-gradient(90deg, #dc2626, #b91c1c);color:#fff;padding:14px 24px;text-align:center;font-weight:600;font-size:14px;position:sticky;top:0;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.6);border-bottom:1px solid rgba(255,255,255,0.2);";
      banner.innerHTML = `⚠️ You opened this page directly from file explorer (<code>file://</code>). Web browsers block all API fetch requests on local file URLs. Please open <a href="http://localhost:4000" style="color:#fef08a;text-decoration:underline;font-weight:700;margin:0 4px;">http://localhost:4000</a> in your browser!`;
      document.body.prepend(banner);
      showToast("Open http://localhost:4000 to use the application", "error");
    }

    await initSession();
    loadFeed();
  }

  init();
});
