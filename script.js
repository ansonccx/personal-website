const yearElement = document.querySelector("#year");
const themeToggle = document.querySelector("#theme-toggle");
const projectList = document.querySelector("#project-list");
const projectForm = document.querySelector("#project-form");
const clearProjectsButton = document.querySelector("#clear-projects");

const storageKey = "anson-projects";

const defaultProjects = [
  {
    tag: "COMING SOON",
    title: "未来项目会展示在这里",
    description:
      "你后续可以把学习中的作品、练习页面、案例整理或任何你想公开展示的内容加到这里。",
    link: ""
  },
  {
    tag: "LEARNING PATH",
    title: "AI 学习记录",
    description:
      "比如你可以添加自己在提示词、数据标注、模型理解、工具使用方面的学习成果。",
    link: ""
  },
  {
    tag: "NEXT STEP",
    title: "持续补充内容",
    description:
      "现在先把网站搭起来，后面有了项目之后再逐步补充，会比等“准备好了再开始”更轻松。",
    link: ""
  }
];

function readProjects() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return defaultProjects;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

function saveProjects(projects) {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "card";

  const safeTag = project.tag?.trim() || "PROJECT";
  const safeTitle = project.title?.trim() || "未命名项目";
  const safeDescription = project.description?.trim() || "暂无描述。";
  const safeLink = project.link?.trim() || "";

  article.innerHTML = `
    <p class="card-tag">${safeTag}</p>
    <h3>${safeTitle}</h3>
    <p>${safeDescription}</p>
    ${safeLink ? `<a class="card-link" href="${safeLink}" target="_blank" rel="noreferrer">查看链接</a>` : ""}
  `;

  return article;
}

function renderProjects() {
  if (!projectList) {
    return;
  }

  const projects = readProjects();
  projectList.innerHTML = "";

  projects.forEach((project) => {
    projectList.appendChild(createProjectCard(project));
  });
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
}

if (projectForm) {
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(projectForm);
    const newProject = {
      title: String(formData.get("title") || ""),
      tag: String(formData.get("tag") || "PROJECT"),
      description: String(formData.get("description") || ""),
      link: String(formData.get("link") || "")
    };

    const projects = readProjects();
    projects.unshift(newProject);
    saveProjects(projects);
    renderProjects();
    projectForm.reset();
  });
}

if (clearProjectsButton) {
  clearProjectsButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderProjects();
  });
}

renderProjects();
