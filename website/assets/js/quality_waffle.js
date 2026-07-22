/* ==========================================================================
   Quality Waffle Chart — Section 5
   Data: country_quality_score.json
   ========================================================================== */

(function () {
  // ─── Color palettes ────────────────────────────────────────────────────────
  // const CONTENT_COLORS = {
  //   "0": { color: "#73A580", label: "Tier 0 — No content" },
  //   "1": { color: "#BDBEA9", label: "Tier 1 — Low" },
  //   "2": { color: "#D98E9B", label: "Tier 2 — Fair" },
  //   "3": { color: "#C1666B", label: "Tier 3 — Good" },
  //   "4": { color: "#7C6A8F", label: "Tier 4 — Excellent" }
  // };

  const CONTENT_COLORS = {
    "0": { color: "#D6DCC5", label: "Tier 0 — No content" },
    "1": { color: "#AFC189", label: "Tier 1 — Low" },
    "2": { color: "#8AA968", label: "Tier 2 — Fair" },
    "3": { color: "#5C7D3C", label: "Tier 3 — Good" },
    "4": { color: "#33471F", label: "Tier 4 — Excellent" }
  };

  // const METADATA_COLORS = {
  //   "0": { color: "#73A580", label: "Tier 0 — No metadata" },
  //   "C": { color: "#D98E9B", label: "Tier C — Low" },
  //   "B": { color: "#C1666B", label: "Tier B — Fair" },
  //   "A": { color: "#7C6A8F", label: "Tier A — Excellent" }
  // };

  const METADATA_COLORS = {
    "0": { color: "#D9D2E0", label: "Tier 0 — No metadata" },
    "A": { color: "#C4B9CE", label: "Tier A — Low" },
    "B": { color: "#9C87AB", label: "Tier B — Fair" },
    "C": { color: "#5A4768", label: "Tier C — Excellent" }
  };

  // Country display labels and button colors (matching map section)
  const COUNTRY_META = {
    "france": { label: "France", color: "#1f7f95" },
    "germany": { label: "Germany", color: "#feda15" },
    "italy": { label: "Italy", color: "#90BE6D" },
    "netherlands": { label: "Netherlands", color: "#a180ad" },
    "portugal": { label: "Portugal", color: "#f4a64e" },
    "spain": { label: "Spain", color: "#bb521f" }
  };

  let qualityData = null;
  let currentCountry = "france";

  // ─── Load data and initialise ───────────────────────────────────────────────
  fetch("../notebook/data/json/country_quality_score.json")
    .then(r => r.json())
    .then(data => {
      qualityData = data;
      renderWaffles(currentCountry);
    })
    .catch(err => console.error("Waffle: failed to load quality data", err));

  // ─── Public API for buttons ────────────────────────────────────────────────
  window.waffleSelectCountry = function (country) {
    if (!qualityData) return;
    currentCountry = country;

    // Update question text
    const display = document.getElementById("waffle-country-display");
    if (display) {
      const meta = COUNTRY_META[country] || { label: country, color: "#1f7f95" };
      display.textContent = meta.label;
      display.style.color = meta.color;
    }

    // Update active button styles
    document.querySelectorAll("[data-wc]").forEach(btn => {
      const isActive = btn.dataset.wc === country;
      const meta = COUNTRY_META[btn.dataset.wc] || { color: "#1a3a5f" };
      if (isActive) {
        btn.style.background = meta.color;
        btn.style.color = "#ffffff";
        btn.style.borderColor = meta.color;
      } else {
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    });

    renderWaffles(country);
  };

  // ─── Render both waffles ───────────────────────────────────────────────────
  function renderWaffles(country) {
    const raw = qualityData[country];
    if (!raw) return;

    // Extract content tier counts (order: 0,1,2,3,4)
    const contentFacet = raw.facets.find(f => f.name === "contentTier");
    const metadataFacet = raw.facets.find(f => f.name === "metadataTier");

    const contentMap = {};
    contentFacet.fields.forEach(f => contentMap[f.label] = f.count);

    const metadataMap = {};
    metadataFacet.fields.forEach(f => metadataMap[f.label] = f.count);

    // Build ordered arrays for rendering
    const contentData = ["0", "1", "2", "3", "4"].map(label => ({
      label, count: contentMap[label] || 0, ...CONTENT_COLORS[label]
    }));

    const metadataData = ["0", "A", "B", "C"].map(label => ({
      label, count: metadataMap[label] || 0, ...METADATA_COLORS[label]
    }));

    drawWaffle("waffle-content", contentData);
    drawLegend("waffle-content-legend", contentData);
    drawWaffle("waffle-metadata", metadataData);
    drawLegend("waffle-metadata-legend", metadataData);
  }

  // ─── Draw a single waffle SVG ──────────────────────────────────────────────
  function drawWaffle(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((s, d) => s + d.count, 0);
    const COLS = 10, ROWS = 10;
    const CELL = 22, GAP = 3;
    const W = COLS * (CELL + GAP) - GAP;
    const H = ROWS * (CELL + GAP) - GAP;

    // Distribute 100 cells proportionally
    let cells = [];
    let allocated = 0;
    data.forEach((d, i) => {
      const exact = d.count / total * 100;
      const n = i === data.length - 1 ? 100 - allocated : Math.round(exact);
      allocated += n;
      for (let j = 0; j < n; j++) cells.push(d);
    });
    // Reverse so the highest tier is at the top, tier 0 at the bottom
    cells.reverse();

    // Build SVG
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.style.display = "block";

    // Tooltip element (shared)
    let tooltip = document.getElementById("waffle-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "waffle-tooltip";
      tooltip.style.cssText = [
        "position:fixed", "background:rgba(11,26,44,0.95)", "color:#fff",
        "padding:6px 12px", "border-radius:8px", "font-size:12px",
        "pointer-events:none", "opacity:0", "transition:opacity 0.15s",
        "z-index:9999", "white-space:nowrap", "font-family:var(--font-sans)"
      ].join(";");
      document.body.appendChild(tooltip);
    }

    cells.forEach((cell, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", col * (CELL + GAP));
      rect.setAttribute("y", row * (CELL + GAP));
      rect.setAttribute("width", CELL);
      rect.setAttribute("height", CELL);
      rect.setAttribute("rx", 3);
      rect.setAttribute("fill", cell.color);
      rect.style.cursor = "default";
      rect.style.transition = "opacity 0.15s";

      const pct = Math.round(cell.count / total * 100);
      rect.addEventListener("mouseenter", e => {
        tooltip.textContent = `${cell.label} — ${pct}%`;
        tooltip.style.opacity = "1";
        rect.style.opacity = "0.65";
      });
      rect.addEventListener("mousemove", e => {
        tooltip.style.left = (e.clientX + 14) + "px";
        tooltip.style.top = (e.clientY - 28) + "px";
      });
      rect.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        rect.style.opacity = "1";
      });

      svg.appendChild(rect);
    });

    // Animate in: fade-replace
    container.style.opacity = "0";
    container.innerHTML = "";
    container.appendChild(svg);
    requestAnimationFrame(() => {
      container.style.transition = "opacity 0.35s";
      container.style.opacity = "1";
    });
  }

  // ─── Draw legend below each waffle ────────────────────────────────────────
  function drawLegend(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((s, d) => s + d.count, 0);
    container.innerHTML = "";

    // Reverse so legend reads best tier (top of waffle) → worst tier (bottom)
    data.filter(d => d.count > 0).slice().reverse().forEach(d => {
      const pct = Math.round(d.count / total * 100);
      const item = document.createElement("div");
      item.className = "waffle-legend-item";

      const swatch = document.createElement("span");
      swatch.className = "waffle-legend-swatch";
      swatch.style.background = d.color;

      const text = document.createElement("span");
      text.textContent = `${d.label} (${pct}%)`;

      item.appendChild(swatch);
      item.appendChild(text);
      container.appendChild(item);
    });
  }
})();
