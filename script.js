const body = document.body;
const themeToggle = document.querySelector("#theme-toggle");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-menu a"));
const reveals = document.querySelectorAll(".reveal");
const titleReveals = document.querySelectorAll(".section-heading h2");
const sections = Array.from(document.querySelectorAll("main section[id]"));
let activeSectionId = "";

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme || "light";
applyTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((item) => revealObserver.observe(item));

  const titleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-title-visible");
          titleObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  titleReveals.forEach((item) => titleObserver.observe(item));
} else {
  reveals.forEach((item) => item.classList.add("is-visible"));
  titleReveals.forEach((item) => item.classList.add("is-title-visible"));
}

function applyTheme(theme) {
  body.dataset.theme = theme;
  if (themeToggle) {
    const label = theme === "dark" ? "Dark" : "Light";
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.querySelector(".theme-toggle-text").textContent = label;
  }
}

if (!body.dataset.section) {
  body.dataset.section = "home";
}

const initialSection = sections.find((section) => section.id === body.dataset.section) || sections[0];
if (initialSection) {
  setCurrentSection(initialSection);
}

function setCurrentSection(section) {
  if (!section || activeSectionId === section.id) {
    return;
  }

  activeSectionId = section.id;
  const current = `#${section.id}`;
  body.dataset.section = section.dataset.tone || section.id;
  sections.forEach((item) => {
    item.classList.toggle("is-current", item === section);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === current);
  });
}

function getHeaderOffset() {
  const header = document.querySelector(".site-header");
  return header ? header.getBoundingClientRect().height : 0;
}

function findActiveSection() {
  const headerOffset = getHeaderOffset();
  const targetLine = headerOffset + window.innerHeight * 0.28;

  let activeSection = sections[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const containsTarget = sectionTop <= targetLine && sectionBottom >= targetLine;

    if (containsTarget) {
      activeSection = section;
      bestDistance = -1;
      return;
    }

    if (bestDistance !== -1) {
      const distance = Math.abs(sectionTop - targetLine);
      if (distance < bestDistance) {
        bestDistance = distance;
        activeSection = section;
      }
    }
  });

  setCurrentSection(activeSection);
}

let scrollTicking = false;

function updateActiveSectionOnScroll() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    findActiveSection();
    scrollTicking = false;
  });
}

window.addEventListener("scroll", updateActiveSectionOnScroll, { passive: true });
window.addEventListener("resize", updateActiveSectionOnScroll);
window.addEventListener("load", findActiveSection);
