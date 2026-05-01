const yearElement = document.querySelector("#year");
const themeToggle = document.querySelector("#theme-toggle");
const projectList = document.querySelector("#project-list");

const supabaseGlobal = window.supabase;
const supabaseProjectConfig = window.__SUPABASE_CONFIG__ || {};

const fallbackProjects = [
  {
    tag: "COMING SOON",
    title: "未来项目会展示在这里",
    description: "后台配置完成后，我会在管理面板里持续更新项目内容。",
    project_url: "https://github.com/ansonccx"
  },
  {
    tag: "LEARNING NOTE",
    title: "AI 学习记录",
    description: "例如提示词实践、工具工作流、模型理解过程，或自己整理的方法论。",
    project_url: "https://github.com/ansonccx"
  },
  {
    tag: "NEXT STEP",
    title: "持续补充内容",
    description: "这个主页会逐步补充为更完整的个人作品与学习展示空间。",
    project_url: "https://github.com/ansonccx"
  }
];

function hasSupabaseConfig() {
  return Boolean(supabaseGlobal && supabaseProjectConfig.url && supabaseProjectConfig.anonKey);
}

function renderProjects(projects) {
  if (!projectList) {
    return;
  }

  projectList.innerHTML = "";

  projects.forEach((project, index) => {
    const article = document.createElement("article");
    article.className = "card";

    const safeTag = project.tag?.trim() || "PROJECT";
    const safeTitle = project.title?.trim() || "未命名项目";
    const safeDescription = project.description?.trim() || "暂无描述。";
    const safeLink = project.project_url?.trim() || "";
    const displayIndex = String(index + 1).padStart(2, "0");

    article.innerHTML = `
      <div class="card-header">
        <p class="card-tag">${safeTag}</p>
        <span class="card-index">${displayIndex}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${safeTitle}</h3>
        <p class="card-description">${safeDescription}</p>
      </div>
      <div class="card-footer">
        <span class="card-status">Project Published</span>
        ${safeLink ? `<a class="card-link" href="${safeLink}" target="_blank" rel="noreferrer">查看项目</a>` : `<span class="card-link">项目整理中</span>`}
      </div>
    `;

    projectList.appendChild(article);
  });
}

async function loadProjects() {
  if (!hasSupabaseConfig()) {
    renderProjects(fallbackProjects);
    return;
  }

  const client = supabaseGlobal.createClient(
    supabaseProjectConfig.url,
    supabaseProjectConfig.anonKey
  );

  const { data, error } = await client
    .from(supabaseProjectConfig.projectsTable)
    .select("tag, title, description, project_url")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    renderProjects(fallbackProjects);
    return;
  }

  renderProjects(data);
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
}

loadProjects();
