const yearElement = document.querySelector("#year");
const themeToggle = document.querySelector("#theme-toggle");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
}
