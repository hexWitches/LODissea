/* ==========================================================================
   rq02.js — RQ02 Visualizations (RSQ01 & RSQ03)
   Uses amCharts 5. Do NOT modify app.js.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 0. INLINE DATA
// ---------------------------------------------------------------------------

const COUNTRY_COLORS_RQ2 = {
  france:      "#1f7f95",
  germany:     "#E8B71D",
  italy:       "#90BE6D",
  netherlands: "#a180ad",
  portugal:    "#f4a64e",
  spain:       "#bb521f",
};

const CATEGORY_COLORS_RQ2 = {
  "library/archive":                     "#7C6A8F",
  "natural history/science institution": "#6B8E4E",
  "art/history museum":                  "#D4A24C",
  "audiovisual/film archive":            "#2C5F6F",
  "academic/research institution":       "#C1666B",
  "government/administrative body":      "#D98E9B",
  "media/broadcast organization":        "#E0703A",
  "other":                               "#C9C2B4",
};

let PROVIDERS_DATA = {};
let CATEGORY_BY_COUNTRY = [];
let CATEGORIES_ORDER = [];
let PROVIDER_SHORT_NAMES = {};

// ---------------------------------------------------------------------------
// 1. HELPERS
// ---------------------------------------------------------------------------

function rq2Capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// 2. RSQ01 — PROVIDERS HORIZONTAL BAR CHART
// ---------------------------------------------------------------------------

let rsq01Root = null;

function initRsq01Chart(country) {
  if (rsq01Root) { rsq01Root.dispose(); rsq01Root = null; }

  const container = document.getElementById("rsq01-chart");
  if (!container) return;

  // Build dataset
  let rawData = [];
  let totalCount = 0;
  if (country === "all") {
    for (const [c, providers] of Object.entries(PROVIDERS_DATA)) {
      providers.forEach(p => {
        rawData.push({ ...p, country: c });
      });
    }
    rawData.sort((a, b) => b.count - a.count);
    rawData = rawData.slice(0, 10);
    rawData.forEach(d => totalCount += d.count);
  } else {
    rawData = PROVIDERS_DATA[country].slice(0, 10).map(p => ({ ...p, country }));
    rawData.forEach(d => totalCount += d.count);
  }

  const chartData = rawData.map(d => {
    const isoCodes = {
      france: "FR", germany: "DE", italy: "IT",
      netherlands: "NL", portugal: "PT", spain: "ES"
    };
    const suffix = country === "all" ? ` (${isoCodes[d.country]})` : "";
    const maxLength = 36 - suffix.length;
    let providerDisplayName = PROVIDER_SHORT_NAMES[d.provider] || d.provider;
    const providerStr = providerDisplayName.length > maxLength ? providerDisplayName.slice(0, maxLength - 1) + "\u2026" : providerDisplayName;

    return {
      provider:     providerStr + suffix,
      fullProvider: providerDisplayName + suffix,
      count:        d.count,
      percentage:   totalCount > 0 ? (d.count / totalCount * 100).toFixed(1) + "%" : "0%",
      // Pre-format: amCharts bullet sprites don't support {field.formatNumber()} syntax
      countLabel:   d.count >= 1_000_000
                      ? (d.count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
                      : d.count >= 1_000
                        ? (d.count / 1_000).toFixed(0) + "K"
                        : d.count.toString(),
      category:     d.category,
      country:      d.country,
      catColor:     CATEGORY_COLORS_RQ2[d.category] || "#AACAE0",
    };
  }).reverse();

  const root = am5.Root.new("rsq01-chart");
  rsq01Root = root;
  root.setThemes([am5themes_Animated.new(root)]);
  root._logo.dispose();  // hide amCharts watermark

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false, panY: false,
      wheelX: "none", wheelY: "none",
      layout: root.verticalLayout,
      paddingRight: 55,   // room for end-of-bar bullet labels
    })
  );



  // Y axis — provider names
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 8 });
  yRenderer.labels.template.setAll({
    fontSize: 11, fontFamily: "'Inter', sans-serif",
    fill: am5.color("#1A1A1A"),
    maxWidth: 200, oversizedBehavior: "truncate", ellipsis: "…",
    centerX: am5.p100, paddingRight: 8,
  });
  yRenderer.grid.template.setAll({ visible: false });

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, { categoryField: "provider", renderer: yRenderer })
  );
  yAxis.data.setAll(chartData);

  // X axis — item count
  const xRenderer = am5xy.AxisRendererX.new(root, {});
  xRenderer.labels.template.setAll({
    fontSize: 10, fontFamily: "'Inter', sans-serif", fill: am5.color("#5A5A5A"),
  });
  xRenderer.grid.template.setAll({ stroke: am5.color("#1A3A5F"), strokeOpacity: 0.07 });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      extraMax: 0.15, // extra room for the largest bar's label
      renderer: xRenderer,
      numberFormat: "#a",   // abbreviated: 1000→1K, 1000000→1M
    })
  );

  // X-axis title — shown below the axis tick labels
  chart.children.push(
    am5.Label.new(root, {
      text: "Number of items",
      fontSize: 11,
      fontFamily: "'Inter', sans-serif",
      fill: am5.color("#5A5A5A"),
      x: am5.p50,
      centerX: am5.p50,
      paddingTop: 12,
    })
  );

  // Series
  const LIGHT_BG_CATS = new Set(["media/broadcast organization", "other", "library/archive"]);

  const seriesTip = am5.Tooltip.new(root, { getFillFromSprite: false });
  seriesTip.get("background").setAll({
    fillOpacity: 0.95,
    cornerRadiusTopLeft: 6, cornerRadiusTopRight: 6,
    cornerRadiusBottomRight: 6, cornerRadiusBottomLeft: 6,
  });
  seriesTip.label.setAll({ fontSize: 12, fontFamily: "'Inter', sans-serif" });

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Items in Europeana",
      xAxis: xAxis, yAxis: yAxis,
      valueXField: "count", categoryYField: "provider",
      tooltip: seriesTip,
    })
  );

  const defaultBarColor = country === "all" ? "#1A3A5F" : "#AACAE0";

  series.columns.template.setAll({
    height: am5.percent(65),
    cornerRadiusTL: 8, cornerRadiusBL: 8,
    cornerRadiusBR: 8, cornerRadiusTR: 8,
    tooltipText: "[bold]{fullProvider}[/]\n{percentage} contribution ({countLabel} items)",
    tooltipY: am5.percent(50),
    fill: am5.color(defaultBarColor),
    stroke: am5.color(defaultBarColor)
  });

  if (country !== "all") {
    series.columns.template.adapters.add("fill", (fill, col) => {
      const d = col.dataItem?.dataContext;
      return d && COUNTRY_COLORS_RQ2[d.country] ? am5.color(COUNTRY_COLORS_RQ2[d.country]) : fill;
    });

    series.columns.template.adapters.add("stroke", (stroke, col) => {
      const d = col.dataItem?.dataContext;
      return d && COUNTRY_COLORS_RQ2[d.country] ? am5.color(COUNTRY_COLORS_RQ2[d.country]) : stroke;
    });
  }

  // Update shared tooltip colors to match the hovered bar
  series.columns.template.events.on("pointerover", (ev) => {
    const d = ev.target.dataItem?.dataContext;
    if (!d) return;

    let bgColor = defaultBarColor;
    let isLightColor = false;

    if (country !== "all") {
      bgColor = COUNTRY_COLORS_RQ2[d.country] || "#AACAE0";
      isLightColor = (d.country === "germany" || d.country === "portugal");
    }

    seriesTip.get("background").set("fill", am5.color(bgColor));
    seriesTip.label.set("fill", am5.color(isLightColor ? "#1A1A1A" : "#FBF9F5"));
  });

  // Bullet label — populateText:true is the key flag that makes {field} bindings work
  series.bullets.push(() => {
    const label = am5.Label.new(root, {
      text: "{countLabel}",
      fill: am5.color("#1A3A5F"),
      fontSize: 10,
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
      centerY: am5.p50,
      dx: 6,
      populateText: true,   // ← required: forces amCharts to resolve {field} bindings
    });
    return am5.Bullet.new(root, { locationX: 1, sprite: label });
  });

  series.data.setAll(chartData);
  series.appear(1000);
  chart.appear(1000, 100);
}

function filterRsq01(country) {
  document.querySelectorAll(".rsq01-filter-btn").forEach(btn => {
    const btnCountry = btn.dataset.country;
    const isActive = btnCountry === country;
    btn.classList.toggle("rsq01-active", isActive);

    // Reset inline styles
    btn.style.backgroundColor = "";
    btn.style.borderColor = "";
    btn.style.color = "";

    // Add colored background to active country buttons
    if (btnCountry !== "all" && isActive) {
      const col = COUNTRY_COLORS_RQ2[btnCountry];
      if (col) {
        btn.style.borderColor = col;
        btn.style.backgroundColor = col;
        btn.style.color = "#FBF9F5";
      }
    }
  });
  initRsq01Chart(country);
}

// ---------------------------------------------------------------------------
// 3. RSQ03 — STACKED HORIZONTAL BAR CHART
// ---------------------------------------------------------------------------

let rsq03BarRoot = null;

function initRsq03BarChart() {
  if (rsq03BarRoot) { rsq03BarRoot.dispose(); rsq03BarRoot = null; }

  const container = document.getElementById("rsq03-bar-chart");
  if (!container) return;

  const root = am5.Root.new("rsq03-bar-chart");
  rsq03BarRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);
  root._logo.dispose();  // hide amCharts watermark

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false, panY: false,
      wheelX: "none", wheelY: "none",
      layout: root.verticalLayout,
    })
  );



  // Normalization and sorting
  let chartData = CATEGORY_BY_COUNTRY.map(item => {
    let total = 0;
    CATEGORIES_ORDER.forEach(cat => total += item[cat] || 0);
    const newItem = { country: item.country };
    let topCat = null;
    let bottomCat = null;
    CATEGORIES_ORDER.forEach(cat => {
      let val = ((item[cat] || 0) / total) * 100;
      newItem[cat] = val;
      if (val > 0) {
        if (!bottomCat) bottomCat = cat;
        topCat = cat;
      }
    });
    newItem.topCategory = topCat;
    newItem.bottomCategory = bottomCat;
    return newItem;
  });

  // Put Netherlands last
  const nlIndex = chartData.findIndex(d => d.country === "Netherlands");
  if (nlIndex !== -1) {
    const nl = chartData.splice(nlIndex, 1)[0];
    chartData.push(nl);
  }

  // Legend on the right
  const legend = chart.rightAxesContainer.children.push(
    am5.Legend.new(root, {
      layout: root.verticalLayout,
      centerY: am5.p50,
      y: am5.p50,
      marginLeft: 15,
      width: 170
    })
  );
  legend.labels.template.setAll({ 
    fontSize: 10, 
    fontFamily: "'Inter', sans-serif", 
    fill: am5.color("#1A1A1A"),
    oversizedBehavior: "wrap",
    maxWidth: 140
  });
  legend.markers.template.setAll({ width: 12, height: 12 });

  // X axis (Countries)
  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 20 });
  xRenderer.labels.template.setAll({ fontSize: 12, fontFamily: "'Inter', sans-serif", fill: am5.color("#1A1A1A") });
  xRenderer.grid.template.setAll({ visible: false });

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, { categoryField: "country", renderer: xRenderer })
  );
  xAxis.data.setAll(chartData);

  // Y axis (Percentages)
  const yRenderer = am5xy.AxisRendererY.new(root, {});
  yRenderer.labels.template.setAll({ fontSize: 10, fontFamily: "'Inter', sans-serif", fill: am5.color("#5A5A5A") });
  yRenderer.grid.template.setAll({ stroke: am5.color("#1A3A5F"), strokeOpacity: 0.07 });

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, { min: 0, max: 100, strictMinMax: true, renderer: yRenderer, numberFormat: "#'%'" })
  );

  // Y-axis title
  chart.leftAxesContainer.children.unshift(
    am5.Label.new(root, {
      text: "Percentage of category (%)",
      fontSize: 11,
      fontFamily: "'Inter', sans-serif",
      fill: am5.color("#5A5A5A"),
      rotation: -90,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50,
    })
  );

  CATEGORIES_ORDER.forEach((cat, index) => {
    const color = CATEGORY_COLORS_RQ2[cat] || "#AACAE0";
    const isFirst = index === 0;
    const isLast = index === CATEGORIES_ORDER.length - 1;

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: cat,
        xAxis, yAxis,
        valueYField: cat,
        categoryXField: "country",
        stacked: true,
      })
    );

    series.columns.template.setAll({
      width: am5.percent(60),
      fill: am5.color(color),
      stroke: am5.color(color),
      tooltipText: "[bold]{categoryX}[/]\n" + cat + "\n{valueY.formatNumber('#.0')}%",
      tooltipY: am5.percent(50),
    });

    series.columns.template.adapters.add("cornerRadiusTL", (radius, target) => {
      return target.dataItem?.dataContext?.topCategory === cat ? 8 : 0;
    });
    series.columns.template.adapters.add("cornerRadiusTR", (radius, target) => {
      return target.dataItem?.dataContext?.topCategory === cat ? 8 : 0;
    });
    series.columns.template.adapters.add("cornerRadiusBL", (radius, target) => {
      return target.dataItem?.dataContext?.bottomCategory === cat ? 8 : 0;
    });
    series.columns.template.adapters.add("cornerRadiusBR", (radius, target) => {
      return target.dataItem?.dataContext?.bottomCategory === cat ? 8 : 0;
    });

    // Style the tooltip itself (background color matches category)
    const isLightColor = (cat === "media/broadcast organization" || cat === "other" || cat === "library/archive");
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
    });

    tooltip.get("background").setAll({
      fill: am5.color(color),
      fillOpacity: 0.95,
      cornerRadiusTopLeft: 6, cornerRadiusTopRight: 6,
      cornerRadiusBottomRight: 6, cornerRadiusBottomLeft: 6,
    });

    tooltip.label.setAll({
      fill: am5.color(isLightColor ? "#1A1A1A" : "#FBF9F5"),
      fontSize: 12,
      fontFamily: "'Inter', sans-serif"
    });

    series.set("tooltip", tooltip);

    series.data.setAll(chartData);
    series.appear(1000);
    legend.data.unshift(series);
  });

  chart.appear(1000, 100);
}

// ---------------------------------------------------------------------------
// 4. RSQ03 — SUNBURST CHART
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 6. INTERSECTION OBSERVER — lazy init
// ---------------------------------------------------------------------------

function rq2ObserveSection(sectionId, initFn) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { initFn(); obs.disconnect(); }
  }, { threshold: 0.15 });
  obs.observe(el);
}

// ---------------------------------------------------------------------------
// 7. BOOT
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("assets/data/rq02.json").then(res => res.json()),
    fetch("assets/data/provider_short_names.json").then(res => res.json())
  ])
    .then(([rq02Data, shortNamesData]) => {
      PROVIDERS_DATA = rq02Data.PROVIDERS_DATA;
      CATEGORY_BY_COUNTRY = rq02Data.CATEGORY_BY_COUNTRY;
      CATEGORIES_ORDER = rq02Data.CATEGORIES_ORDER;
      PROVIDER_SHORT_NAMES = shortNamesData;
      
      rq2ObserveSection("analysis-2", () => { initRsq01Chart("all"); });
      rq2ObserveSection("analysis-3", () => { initRsq03BarChart(); });
    })
    .catch(error => console.error("Error loading RQ02 data:", error));
});