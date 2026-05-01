import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { appConfig, hasSupabaseConfig, supabaseConfig } from "./supabase-config.js?v=1";

const yearElement = document.querySelector("#year");
const themeToggle = document.querySelector("#theme-toggle");
const projectList = document.querySelector("#project-list");

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

function renderProjects(projects) {
  if (!projectList) {
    return;
  }

  projectList.innerHTML = "";

  projects.forEach((project) => {
    const article = document.createElement("article");
    article.className = "card";

    const safeTag = project.tag?.trim() || "PROJECT";
    const safeTitle = project.title?.trim() || "未命名项目";
    const safeDescription = project.description?.trim() || "暂无描述。";
    const safeLink = project.project_url?.trim() || "";

    article.innerHTML = `
      <p class="card-tag">${safeTag}</p>
      <h3>${safeTitle}</h3>
      <p>${safeDescription}</p>
      ${safeLink ? `<a class="card-link" href="${safeLink}" target="_blank" rel="noreferrer">查看项目</a>` : ""}
    `;

    projectList.appendChild(article);
  });
}

async function loadProjects() {
  if (!hasSupabaseConfig()) {
    renderProjects(fallbackProjects);
    return;
  }

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  const { data, error } = await supabase
    .from(appConfig.projectsTable)
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
