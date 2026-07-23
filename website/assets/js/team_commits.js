/* ==========================================================================
   team_commits.js — GitHub commit-time visualization for the Team tab
   ========================================================================== */

const GITHUB_REPO = "hexWitches/LODissea"; // <-- SET THIS to "owner/repo-name"
const COMMIT_CACHE_KEY = `lodissea-commit-hours-${GITHUB_REPO}`;
const COMMIT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // cache for 24h, avoid hammering GitHub's rate limit

async function fetchAllCommits(repo, maxPages = 5) {
  let allCommits = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=100&page=${page}`);
    if (!res.ok) break;
    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) break;
    allCommits = allCommits.concat(commits);
    if (commits.length < 100) break; // last page reached
  }
  return allCommits;
}

function bucketizeByTimeOfDay(commits) {
  const buckets = { "Morning": 0, "Afternoon": 0, "Evening": 0, "Late Night": 0 };
  commits.forEach(c => {
    const dateStr = c.commit?.author?.date;
    if (!dateStr) return;
    const hour = new Date(dateStr).getHours();
    if (hour >= 6 && hour < 12) buckets["Morning"]++;
    else if (hour >= 12 && hour < 18) buckets["Afternoon"]++;
    else if (hour >= 18 && hour < 24) buckets["Evening"]++;
    else buckets["Late Night"]++;
  });
  return buckets;
}

async function initCommitHoursChart() {
  const canvas = document.getElementById("commit-hours-chart");
  if (!canvas || GITHUB_REPO === "your-org/your-repo") return; // guard: won't run until you set the repo

  let buckets;
  const cached = localStorage.getItem(COMMIT_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < COMMIT_CACHE_TTL_MS) buckets = data;
  }

  if (!buckets) {
    try {
      const commits = await fetchAllCommits(GITHUB_REPO);
      buckets = bucketizeByTimeOfDay(commits);
      localStorage.setItem(COMMIT_CACHE_KEY, JSON.stringify({ data: buckets, timestamp: Date.now() }));
    } catch (err) {
      console.warn("Could not fetch GitHub commit data:", err);
      return;
    }
  }

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        data: Object.values(buckets),
        backgroundColor: ["#AACAE0", "#FBF9F5", "#C48A98", "#6D213C"],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0, color: "#7A98B8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.08)" } },
        x: { ticks: { color: "white", font: { size: 11 } }, grid: { display: false } },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", initCommitHoursChart);

function updateScrollHint() {
  const activeTab = document.querySelector(".tab-content.active"); // adjust selector to match your actual "active tab" class
  const fade = document.getElementById("scroll-hint-fade");
  const chevron = document.getElementById("scroll-hint-chevron");
  if (!activeTab || !fade || !chevron) return;

  const hasOverflow = activeTab.scrollHeight > activeTab.clientHeight + 4; // small tolerance
  fade.classList.toggle("visible", hasOverflow);
  chevron.classList.toggle("visible", hasOverflow);

  // hide once the user has scrolled near the bottom
  activeTab.onscroll = () => {
    const nearBottom = activeTab.scrollTop + activeTab.clientHeight >= activeTab.scrollHeight - 10;
    fade.classList.toggle("visible", hasOverflow && !nearBottom);
    chevron.classList.toggle("visible", hasOverflow && !nearBottom);
  };
}

window.addEventListener("resize", updateScrollHint);
// call updateScrollHint() again inside your existing openTab()/switchTab() functions, after the tab becomes visible