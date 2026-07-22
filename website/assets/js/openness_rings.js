/* ==========================================================================
   Openness Rings — Section 6
   Data: openness.json  |  pct_open, pct_restricted, pct_permission
   ========================================================================== */

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

  fetch("../notebook/data/json/openness.json")
    .then(res => res.json())
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
        if (root._logo) root._logo.dispose();

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
