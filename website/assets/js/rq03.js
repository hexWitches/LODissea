/* ==========================================================================
   RQ03 — Quality & Openness
   Combines:
     • Quality Waffle Chart  (Section 5) — country_quality_score.json
     • Openness Rings        (Section 6) — openness.json
   ========================================================================== */

/* --------------------------------------------------------------------------
   PART 1 — Quality Waffle Chart
   -------------------------------------------------------------------------- */
(function () {
  // ─── Color palettes ────────────────────────────────────────────────────────

  const CONTENT_COLORS = {
    "0": { color: "#D6DCC5", label: "Tier 0" },
    "1": { color: "#AFC189", label: "Tier 1" },
    "2": { color: "#8AA968", label: "Tier 2" },
    "3": { color: "#5C7D3C", label: "Tier 3" },
    "4": { color: "#33471F", label: "Tier 4" }
  };

  const METADATA_COLORS = {
    "0": { color: "#D9D2E0", label: "Tier 0" },
    "A": { color: "#C4B9CE", label: "Tier A" },
    "B": { color: "#9C87AB", label: "Tier B" },
    "C": { color: "#5A4768", label: "Tier C" }
  };

  // Country display labels and button colors (matching map section)
  const COUNTRY_META = {
    "France": { label: "France", color: "#1f7f95" },
    "Germany": { label: "Germany", color: "#feda15" },
    "Italy": { label: "Italy", color: "#90BE6D" },
    "Netherlands": { label: "Netherlands", color: "#a180ad" },
    "Portugal": { label: "Portugal", color: "#f4a64e" },
    "Spain": { label: "Spain", color: "#bb521f" }
  };

  let qualityData = null;
  let currentCountry = "France";

  // ─── Load data and initialise ───────────────────────────────────────────────
  window.rq03DataPromise = fetch("assets/data/rq03.json").then(r => r.json());
  window.rq03DataPromise
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
    if (!qualityData || !qualityData.TIER_BREAKDOWN || !qualityData.METADATA_BREAKDOWN) return;

    const tierRow = qualityData.TIER_BREAKDOWN.find(d => d.country === country);
    const metaRow = qualityData.METADATA_BREAKDOWN.find(d => d.country === country);
    if (!tierRow || !metaRow) return;

    // Build ordered arrays for rendering
    const contentData = ["0", "1", "2", "3", "4"].map(label => ({
      label, count: tierRow[`pct_tier_${label}`] || 0, ...CONTENT_COLORS[label]
    }));

    const metadataData = ["0", "A", "B", "C"].map(label => ({
      label, count: metaRow[`pct_metadataTier_${label}`] || 0, ...METADATA_COLORS[label]
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


/* --------------------------------------------------------------------------
   PART 2 — Openness Rings
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.getElementById("openness-rings");
  if (!wrapper) return;

  const CDN_BASE = "https://cdn.amcharts.com/lib/5";

  // Single accent color — matches #6B8E4E already used in the metadata waffle chart
  const OPEN_COLOR = "#6B8E4E";
  const REMAINDER_COLOR = "#e0dbd2"; // Warm off-white track matches site bg (#FBF9F5)

  function loadScript(src, cb) {
    if (document.querySelector(`script[src="${src}"]`)) { if (cb) cb(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  (window.rq03DataPromise || fetch("assets/data/rq03.json").then(r => r.json()))
    .then(d => d.OPENNESS)
    .then(data => {
      // Sort descending: best (most open) → worst
      data.sort((a, b) => b.pct_open - a.pct_open);

      // Load amCharts then build all rings
      loadScript(`${CDN_BASE}/index.js`, () =>
        loadScript(`${CDN_BASE}/percent.js`, () =>
          loadScript(`${CDN_BASE}/themes/Animated.js`, () =>
            buildRings(data)
          )
        )
      );
    })
    .catch(err => console.error("Openness rings: failed to load data", err));

  function buildRings(data) {
    data.forEach(function (d, i) {
      const ringId = `openness-ring-${i}`;
      const countryLabel = d.country.charAt(0).toUpperCase() + d.country.slice(1);
      const ringColor = OPEN_COLOR;

      // Create wrapper card per country
      const card = document.createElement("div");
      card.className = "openness-ring-card";
      card.innerHTML = `
        <div id="${ringId}" class="openness-ring-chart"></div>
        <div class="openness-ring-label">${countryLabel}</div>
      `;
      wrapper.appendChild(card);

      am5.ready(function () {
        var root = am5.Root.new(ringId);
        root.setThemes([am5themes_Animated.new(root)]);


        var chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(72)
          })
        );

        var series = chart.series.push(
          am5percent.PieSeries.new(root, {
            valueField: "value",
            categoryField: "category",
            alignLabels: false
          })
        );

        // Hide default labels and ticks — ring only
        series.labels.template.set("visible", false);
        series.ticks.template.set("visible", false);
        series.slices.template.setAll({
          strokeWidth: 0,
          cornerRadius: 5
        });

        // Disable hover tooltip
        series.slices.template.set("tooltipText", "");

        // Override theme ColorSet so the Animated theme cannot override our colors
        series.set("colors", am5.ColorSet.new(root, {
          colors: [am5.color(ringColor), am5.color(REMAINDER_COLOR)]
        }));

        series.data.setAll([
          { category: "Open", value: d.pct_open },
          { category: "Remainder", value: 100 - d.pct_open }
        ]);

        // Center label: percentage — always use dark navy for readability
        chart.seriesContainer.children.push(
          am5.Label.new(root, {
            text: Math.round(d.pct_open) + "%",
            fontSize: 20,
            fontWeight: "700",
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
            centerX: am5.p50,
            centerY: am5.p50,
            fill: am5.color(0x1A3A5F)
          })
        );

        series.appear(800, i * 80); // Stagger each ring's animation
      });
    });
  }
});
