/* ============================================================
   Feishu shell - topbar + statusbar + tabbar + nav router
   ============================================================ */

const FS = {
  user: null,
  currentPage: "messages",
  aiContext: null
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const r = await fetch("app/mock-user.json");
    FS.user = (await r.json()).user;
  } catch (e) {
    FS.user = { name: "访客", title: "—", level: "—" };
  }
  renderProfile();
  startClock();
});

function startClock() {
  const tick = () => {
    const el = document.querySelector(".statusbar-time");
    if (!el) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    el.textContent = `${hh}:${mm}`;
  };
  tick();
  setInterval(tick, 30000);
}

function renderProfile() {
  const u = FS.user;
  document.querySelectorAll("[data-profile-name]").forEach(el => el.textContent = u.name);
  document.querySelectorAll("[data-profile-title]").forEach(el => el.textContent = u.title);
  document.querySelectorAll("[data-profile-level]").forEach(el => el.textContent = u.level);
  document.querySelectorAll("[data-profile-region]").forEach(el => el.textContent = u.region);
  document.querySelectorAll("[data-profile-manager]").forEach(el => el.textContent = u.manager);
  document.querySelectorAll("[data-profile-stores]").forEach(el => el.textContent = u.stores_count);
  document.querySelectorAll("[data-profile-dept]").forEach(el => el.textContent = u.department);
}

function navigate(tab) {
  document.querySelectorAll(".tabbar-item").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".page, .xd-home, .placeholder-page").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".xd-chat").forEach(el => el.classList.remove("active"));

  const tabBtn = document.querySelector(`.tabbar-item[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.classList.add("active");

  if (tab === "messages") {
    document.getElementById("page-messages").classList.add("active");
  } else if (tab === "apps") {
    document.getElementById("page-apps").classList.add("active");
  } else if (tab === "xuedao") {
    document.getElementById("page-xuedao").classList.add("active");
  } else if (tab === "retaillink") {
    document.getElementById("page-retaillink").classList.add("active");
  } else if (tab === "me") {
    document.getElementById("page-me").classList.add("active");
  } else if (tab === "training") {
    document.getElementById("page-training").classList.add("active");
  } else if (tab === "live") {
    document.getElementById("page-live").classList.add("active");
  }

  FS.currentPage = tab;
  history.replaceState(null, "", `#${tab}`);
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-tab], [data-nav], [data-app]");
  if (!t) return;

  if (t.dataset.tab) {
    e.preventDefault();
    navigate(t.dataset.tab);
  } else if (t.dataset.app === "xuedao") {
    e.preventDefault();
    navigate("xuedao");
  } else if (t.dataset.app === "retaillink") {
    e.preventDefault();
    navigate("retaillink");
  } else if (t.dataset.nav) {
    e.preventDefault();
    navigate(t.dataset.nav);
  }
});

window.addEventListener("hashchange", () => {
  const h = (location.hash || "#messages").slice(1);
  if (["messages", "apps", "xuedao", "retaillink", "me", "training", "live"].includes(h)) {
    navigate(h);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const h = (location.hash || "#messages").slice(1);
  navigate(["messages", "apps", "xuedao", "retaillink", "me", "training", "live"].includes(h) ? h : "messages");
});