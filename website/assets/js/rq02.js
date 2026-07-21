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
  "audiovisual/film archive":            "#4D9E97",
  "art/history museum":                  "#6D7EBA",
  "natural history/science institution": "#B074BD",
  "library/archive":                     "#64A3D1",
  "academic/research institution":       "#D6934A",
  "media/broadcast organization":        "#D16E6E",
  "government/administrative body":      "#C27297",
  "other":                               "#A19E9A",
  "unresolved":                          "#75726F",
};

const PROVIDERS_DATA = {
  france: [
    { provider: "National Library of France",                     count: 2999310, category: "library/archive" },
    { provider: "Media Library of Architecture and Heritage",      count: 510877,  category: "library/archive" },
    { provider: "Natural History Museum in Paris",                 count: 502160,  category: "natural history/science institution" },
    { provider: "Ministry of Culture",                             count: 173279,  category: "government/administrative body" },
    { provider: "Historical Monuments: Regional Conservation",     count: 128192,  category: "government/administrative body" },
    { provider: "Min. of Culture — Regional Archaeology Service",  count: 110142,  category: "government/administrative body" },
    { provider: "National Audiovisual Institute France",           count: 54491,   category: "audiovisual/film archive" },
    { provider: "Interuniversity Health Library",                  count: 47992,   category: "library/archive" },
    { provider: "Palais Galliera — Musée de la Mode",              count: 44495,   category: "art/history museum" },
    { provider: "Center for Research in Ethnomusicology",          count: 21446,   category: "audiovisual/film archive" },
  ],
  germany: [
    { provider: "Bavarian State Library",                          count: 2176001, category: "library/archive" },
    { provider: "Deutsche Fotothek",                               count: 1314229, category: "library/archive" },
    { provider: "State Archives of Baden-Württemberg",             count: 827603,  category: "library/archive" },
    { provider: "German Doc. Center for Art History",              count: 320532,  category: "library/archive" },
    { provider: "German National Library",                         count: 304053,  category: "library/archive" },
    { provider: "Library of Friedrich Ebert Foundation",           count: 201518,  category: "library/archive" },
    { provider: "Archives of Social Democracy",                    count: 133032,  category: "library/archive" },
    { provider: "State & University Library Hamburg",              count: 131101,  category: "library/archive" },
    { provider: "Teßmann Library",                                 count: 115179,  category: "library/archive" },
    { provider: "Berlin State Library",                            count: 110000,  category: "library/archive" },
  ],
  italy: [
    { provider: "Cinecittà – Luce",                                count: 442536,  category: "audiovisual/film archive" },
    { provider: "Historical Archive of the Presidency",            count: 212160,  category: "library/archive" },
    { provider: "National Central Library of Rome",                count: 200231,  category: "library/archive" },
    { provider: "Internet Culturale",                              count: 109101,  category: "library/archive" },
    { provider: "Dept. of Life Sciences, Univ. of Trieste",        count: 101323,  category: "academic/research institution" },
    { provider: "Epigraphic Database Roma",                        count: 86827,   category: "academic/research institution" },
    { provider: "Central Inst. for Italian Libraries Catalogue",   count: 66672,   category: "library/archive" },
    { provider: "Central Museum of the Risorgimento",              count: 53211,   category: "art/history museum" },
    { provider: "Rossimoda Shoe Museum",                           count: 13489,   category: "art/history museum" },
    { provider: "National Archaeological Museum of Naples",        count: 10000,   category: "art/history museum" },
  ],
  netherlands: [
    { provider: "Naturalis Biodiversity Center",                   count: 4601504, category: "natural history/science institution" },
    { provider: "KB, National Library of the Netherlands",         count: 987234,  category: "library/archive" },
    { provider: "Cultural Heritage Agency of the Netherlands",     count: 526228,  category: "government/administrative body" },
    { provider: "Rijksmuseum",                                     count: 341407,  category: "art/history museum" },
    { provider: "National Archives of the Netherlands",            count: 283470,  category: "library/archive" },
    { provider: "Meertens Institute",                              count: 120000,  category: "academic/research institution" },
    { provider: "EYE Film Museum",                                 count: 98000,   category: "audiovisual/film archive" },
    { provider: "Amsterdam City Archives",                         count: 85000,   category: "library/archive" },
    { provider: "Gelderland Archives",                             count: 72000,   category: "library/archive" },
    { provider: "IMSLP/Petrucci Music Library",                    count: 61552,   category: "audiovisual/film archive" },
  ],
  portugal: [
    { provider: "Institute for Tropical Scientific Research",      count: 65666,   category: "natural history/science institution" },
    { provider: "National Library of Portugal",                    count: 35785,   category: "library/archive" },
    { provider: "Portuguese Army Library",                         count: 13120,   category: "library/archive" },
    { provider: "Azores Regional Directorate for Culture",         count: 5913,    category: "government/administrative body" },
    { provider: "University of Porto",                             count: 5111,    category: "academic/research institution" },
    { provider: "Museu do Oriente",                                count: 4200,    category: "art/history museum" },
    { provider: "Arquivo Distrital de Évora",                      count: 3100,    category: "library/archive" },
    { provider: "Biblioteca Municipal de Lagos",                   count: 1800,    category: "library/archive" },
    { provider: "Centro de Arte Moderna",                          count: 1500,    category: "art/history museum" },
    { provider: "Arquivo Histórico Ultramarino",                   count: 1400,    category: "library/archive" },
  ],
  spain: [
    { provider: "Virtual Library of Historical Press",             count: 1735320, category: "library/archive" },
    { provider: "National Library of Spain",                       count: 664410,  category: "library/archive" },
    { provider: "Galiciana: Digital Library of Galicia",           count: 336061,  category: "library/archive" },
    { provider: "Digital Memory of Catalonia",                     count: 286512,  category: "library/archive" },
    { provider: "Galiciana. Arquivo Dixital de Galicia",           count: 234326,  category: "library/archive" },
    { provider: "Digital Library of Andalusia",                    count: 145620,  category: "library/archive" },
    { provider: "Maresía: Prensa digitalizada",                    count: 141919,  category: "library/archive" },
    { provider: "Canary Islands Historical Photography Archive",   count: 121890,  category: "library/archive" },
    { provider: "Centro de Estudios de Castilla – La Mancha",      count: 94223,   category: "library/archive" },
    { provider: "Virtual Library Miguel de Cervantes",             count: 70971,   category: "library/archive" },
  ],
};

const CATEGORY_BY_COUNTRY = [
  { country: "France",      "library/archive": 76.6, "natural history/science institution": 10.6, "government/administrative body": 8.8,  "art/history museum": 1.8,  "audiovisual/film archive": 1.9,  "academic/research institution": 0.4, "media/broadcast organization": 0.0, "other": 0.0 },
  { country: "Germany",     "library/archive": 76.0, "natural history/science institution": 4.0,  "government/administrative body": 0.0,  "art/history museum": 13.7, "audiovisual/film archive": 0.9,  "academic/research institution": 2.3, "media/broadcast organization": 0.6, "other": 0.1 },
  { country: "Italy",       "library/archive": 46.2, "natural history/science institution": 0.1,  "government/administrative body": 0.1,  "art/history museum": 7.1,  "audiovisual/film archive": 31.6, "academic/research institution": 13.4,"media/broadcast organization": 0.0, "other": 1.3 },
  { country: "Netherlands", "library/archive": 26.9, "natural history/science institution": 51.0, "government/administrative body": 6.6,  "art/history museum": 9.0,  "audiovisual/film archive": 1.8,  "academic/research institution": 2.8, "media/broadcast organization": 0.0, "other": 1.8 },
  { country: "Portugal",    "library/archive": 37.5, "natural history/science institution": 47.0, "government/administrative body": 4.5,  "art/history museum": 4.7,  "audiovisual/film archive": 0.5,  "academic/research institution": 5.3, "media/broadcast organization": 0.4, "other": 0.1 },
  { country: "Spain",       "library/archive": 78.3, "natural history/science institution": 1.4,  "government/administrative body": 5.3,  "art/history museum": 5.0,  "audiovisual/film archive": 0.0,  "academic/research institution": 7.0, "media/broadcast organization": 1.4, "other": 0.0 },
];


const CATEGORIES_ORDER = [
  "library/archive",
  "natural history/science institution",
  "art/history museum",
  "audiovisual/film archive",
  "academic/research institution",
  "government/administrative body",
  "media/broadcast organization",
  "other",
];

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
    const providerStr = d.provider.length > maxLength ? d.provider.slice(0, maxLength - 1) + "\u2026" : d.provider;

    return {
      provider:     providerStr + suffix,
      fullProvider: d.provider + suffix,
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
    cornerRadiusBR: 4, cornerRadiusTR: 4,
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

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false, panY: false,
      wheelX: "none", wheelY: "none",
      layout: root.verticalLayout,
    })
  );

  // Legend at top
  const legend = chart.children.unshift(
    am5.Legend.new(root, {
      centerX: am5.p50, x: am5.p50,
      marginBottom: 12,
    })
  );
  legend.labels.template.setAll({ fontSize: 10, fontFamily: "'Inter', sans-serif", fill: am5.color("#1A1A1A") });
  legend.markers.template.setAll({ width: 12, height: 12 });

  // Y axis
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });
  yRenderer.labels.template.setAll({ fontSize: 12, fontFamily: "'Inter', sans-serif", fill: am5.color("#1A1A1A") });
  yRenderer.grid.template.setAll({ visible: false });

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, { categoryField: "country", renderer: yRenderer })
  );
  yAxis.data.setAll([...CATEGORY_BY_COUNTRY].reverse());

  // X axis
  const xRenderer = am5xy.AxisRendererX.new(root, {});
  xRenderer.labels.template.setAll({ fontSize: 10, fontFamily: "'Inter', sans-serif", fill: am5.color("#5A5A5A") });
  xRenderer.grid.template.setAll({ stroke: am5.color("#1A3A5F"), strokeOpacity: 0.07 });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, { min: 0, max: 100, strictMinMax: true, renderer: xRenderer, numberFormat: "#'%'" })
  );

  CATEGORIES_ORDER.forEach(cat => {
    const color = CATEGORY_COLORS_RQ2[cat] || "#AACAE0";
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: cat,
        xAxis, yAxis,
        valueXField: cat,
        categoryYField: "country",
        stacked: true,
      })
    );

    series.columns.template.setAll({
      height: am5.percent(60),
      fill: am5.color(color),
      stroke: am5.color(color),
      // tooltipText on the column template reads the raw valueXField value reliably
      // (series-level tooltip object can misread stacked cumulative in amCharts 5)
      tooltipText: "[bold]{categoryY}[/]\n" + cat + "\n{valueX.formatNumber('#.0')}%",
      tooltipY: am5.percent(50),
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

    series.data.setAll([...CATEGORY_BY_COUNTRY].reverse());
    series.appear(1000);
    legend.data.push(series);
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
  rq2ObserveSection("analysis-2", () => { initRsq01Chart("all"); });
  rq2ObserveSection("analysis-3", () => { initRsq03BarChart(); });
});
