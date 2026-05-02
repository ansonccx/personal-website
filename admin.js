const supabaseLibrary = window.supabase;
const supabaseProjectConfig = window.__SUPABASE_CONFIG__ || {};
const AUTH_STORAGE_KEY = "anson-admin-auth";

const configWarning = document.querySelector("#config-warning");
const loginCard = document.querySelector("#login-card");
const editorCard = document.querySelector("#editor-card");
const listCard = document.querySelector("#list-card");
const logoutButton = document.querySelector("#logout-button");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const rememberLoginInput = document.querySelector("#remember-login");
const projectForm = document.querySelector("#project-form");
const projectMessage = document.querySelector("#project-message");
const projectAdminList = document.querySelector("#project-admin-list");
const editorTitle = document.querySelector("#editor-title");
const cancelEditButton = document.querySelector("#cancel-edit-button");

let supabaseClient = null;
let editingProjectId = null;

function hasSupabaseConfig() {
  return Boolean(
    supabaseLibrary &&
      supabaseProjectConfig.url &&
      supabaseProjectConfig.anonKey &&
      supabaseProjectConfig.projectsTable
  );
}

function createStorageAdapter(storage) {
  return {
    getItem(key) {
      return storage.getItem(key);
    },
    setItem(key, value) {
      storage.setItem(key, value);
    },
    removeItem(key) {
      storage.removeItem(key);
    }
  };
}

function buildSupabaseClient(rememberSession) {
  const storage = rememberSession ? window.localStorage : window.sessionStorage;

  return supabaseLibrary.createClient(supabaseProjectConfig.url, supabaseProjectConfig.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: createStorageAdapter(storage),
      storageKey: AUTH_STORAGE_KEY
    }
  });
}

function clearStoredAuthState() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

async function configureClient(rememberSession) {
  supabaseClient = buildSupabaseClient(rememberSession);

  if (rememberLoginInput) {
    rememberLoginInput.checked = rememberSession;
  }

  return supabaseClient;
}

async function restoreExistingSession() {
  const rememberedClient = buildSupabaseClient(true);
  const rememberedSessionResult = await rememberedClient.auth.getSession();

  if (rememberedSessionResult.data.session) {
    supabaseClient = rememberedClient;

    if (rememberLoginInput) {
      rememberLoginInput.checked = true;
    }

    return rememberedSessionResult.data.session;
  }

  const sessionClient = buildSupabaseClient(false);
  const sessionResult = await sessionClient.auth.getSession();

  supabaseClient = sessionClient;

  if (rememberLoginInput) {
    rememberLoginInput.checked = false;
  }

  return sessionResult.data.session;
}

function setMessage(element, message, isError = false) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.style.color = isError ? "#ff8f8f" : "";
}

function showLoggedInUI() {
  loginCard?.classList.add("hidden");
  configWarning?.classList.add("hidden");
  editorCard?.classList.remove("hidden");
  listCard?.classList.remove("hidden");
  logoutButton?.classList.remove("hidden");
}

function showLoggedOutUI() {
  loginCard?.classList.remove("hidden");
  editorCard?.classList.add("hidden");
  listCard?.classList.add("hidden");
  logoutButton?.classList.add("hidden");
}

function resetEditor() {
  editingProjectId = null;
  projectForm?.reset();

  const orderInput = document.querySelector("#project-order");
  const publishedInput = document.querySelector("#project-published");

  if (orderInput) {
    orderInput.value = "0";
  }

  if (publishedInput) {
    publishedInput.checked = true;
  }

  if (editorTitle) {
    editorTitle.textContent = "新增项目";
  }

  cancelEditButton?.classList.add("hidden");
  setMessage(projectMessage, "");
}

function fillEditor(project) {
  editingProjectId = project.id;

  document.querySelector("#project-tag").value = project.tag ?? "";
  document.querySelector("#project-title").value = project.title ?? "";
  document.querySelector("#project-description").value = project.description ?? "";
  document.querySelector("#project-url").value = project.project_url ?? "";
  document.querySelector("#project-order").value = String(project.display_order ?? 0);
  document.querySelector("#project-published").checked = Boolean(project.is_published);

  if (editorTitle) {
    editorTitle.textContent = "编辑项目";
  }

  cancelEditButton?.classList.remove("hidden");
  setMessage(projectMessage, "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProjects(projects) {
  if (!projectAdminList) {
    return;
  }

  projectAdminList.innerHTML = "";

  if (projects.length === 0) {
    const empty = document.createElement("div");
    empty.className = "admin-list-item";
    empty.innerHTML = `
      <p class="section-label">EMPTY</p>
      <h3>还没有项目</h3>
      <p class="admin-list-meta">你可以先在左侧填写一个项目并保存。</p>
    `;
    projectAdminList.appendChild(empty);
    return;
  }

  projects.forEach((project) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="admin-list-head">
        <div>
          <p class="card-tag">${project.tag ?? "PROJECT"}</p>
          <h3>${project.title ?? "未命名项目"}</h3>
          <p class="admin-list-meta">
            排序：${project.display_order ?? 0} · ${project.is_published ? "首页可见" : "未公开"}
          </p>
        </div>
        <div class="admin-list-actions">
          <button class="button ghost edit-project" type="button">编辑</button>
          <button class="button ghost delete-project" type="button">删除</button>
        </div>
      </div>
      <p>${project.description ?? ""}</p>
    `;

    item.querySelector(".edit-project")?.addEventListener("click", () => {
      fillEditor(project);
    });

    item.querySelector(".delete-project")?.addEventListener("click", async () => {
      const ok = window.confirm(`确定删除项目“${project.title}”吗？`);

      if (!ok) {
        return;
      }

      const { error } = await supabaseClient
        .from(supabaseProjectConfig.projectsTable)
        .delete()
        .eq("id", project.id);

      if (error) {
        setMessage(projectMessage, error.message, true);
        return;
      }

      if (editingProjectId === project.id) {
        resetEditor();
      }

      setMessage(projectMessage, "项目已删除。");
      await loadProjects();
    });

    projectAdminList.appendChild(item);
  });
}

async function loadProjects() {
  const { data, error } = await supabaseClient
    .from(supabaseProjectConfig.projectsTable)
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    setMessage(projectMessage, error.message, true);
    return;
  }

  renderProjects(data ?? []);
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector("#login-email").value.trim();
  const password = document.querySelector("#login-password").value;
  const rememberSession = rememberLoginInput?.checked ?? false;

  clearStoredAuthState();
  await configureClient(rememberSession);

  setMessage(loginMessage, "正在登录...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    clearStoredAuthState();
    await configureClient(false);
    setMessage(loginMessage, error.message, true);
    return;
  }

  setMessage(loginMessage, "");
  showLoggedInUI();
  resetEditor();
  await loadProjects();
}

async function handleSaveProject(event) {
  event.preventDefault();

  const payload = {
    tag: document.querySelector("#project-tag").value.trim(),
    title: document.querySelector("#project-title").value.trim(),
    description: document.querySelector("#project-description").value.trim(),
    project_url: document.querySelector("#project-url").value.trim() || null,
    display_order: Number(document.querySelector("#project-order").value || 0),
    is_published: document.querySelector("#project-published").checked
  };

  setMessage(projectMessage, "正在保存...");

  let result;

  if (editingProjectId) {
    result = await supabaseClient
      .from(supabaseProjectConfig.projectsTable)
      .update(payload)
      .eq("id", editingProjectId);
  } else {
    result = await supabaseClient.from(supabaseProjectConfig.projectsTable).insert(payload);
  }

  if (result.error) {
    setMessage(projectMessage, result.error.message, true);
    return;
  }

  setMessage(projectMessage, editingProjectId ? "项目已更新。" : "项目已新增。");
  resetEditor();
  await loadProjects();
}

async function handleLogout() {
  try {
    await supabaseClient?.auth.signOut();
  } finally {
    clearStoredAuthState();
    await configureClient(false);
    resetEditor();
    showLoggedOutUI();
    setMessage(loginMessage, "");
  }
}

async function init() {
  if (!hasSupabaseConfig()) {
    configWarning?.classList.remove("hidden");
    showLoggedOutUI();
    loginCard?.classList.add("hidden");
    return;
  }

  configWarning?.classList.add("hidden");
  loginCard?.classList.remove("hidden");

  const session = await restoreExistingSession();

  if (session) {
    showLoggedInUI();
    await loadProjects();
  } else {
    showLoggedOutUI();
  }

  loginForm?.addEventListener("submit", handleLogin);
  projectForm?.addEventListener("submit", handleSaveProject);
  cancelEditButton?.addEventListener("click", resetEditor);
  logoutButton?.addEventListener("click", handleLogout);
}

init();
