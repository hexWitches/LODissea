/* ==========================================================================
   rq02.js — Provider & Concentration Visualizations
   Sections:
     2. RSQ01 — Providers horizontal bar chart      (analysis-2)
     3. RSQ03 — Provider-type bar chart             (analysis-4)
     8. France Concentration — Force-directed bubbles (bridge section)
     9. Provider Map — amCharts MapChart with geo points (analysis-3)
   Uses amCharts 5. Do NOT modify app.js.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 0. INLINE DATA
// ---------------------------------------------------------------------------

const COUNTRY_COLORS_RQ2 = {
  france: "#1f7f95",
  germany: "#E8B71D",
  italy: "#90BE6D",
  netherlands: "#a180ad",
  portugal: "#f4a64e",
  spain: "#bb521f",
};

const CATEGORY_COLORS_RQ2 = {
  "library/archive": "#7C6A8F",
  "natural history/science institution": "#6B8E4E",
  "art/history museum": "#D4A24C",
  "audiovisual/film archive": "#2C5F6F",
  "academic/research institution": "#C1666B",
  "government/administrative body": "#D98E9B",
  "media/broadcast organization": "#E0703A",
  "other": "#C9C2B4",
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
      provider: providerStr + suffix,
      fullProvider: providerDisplayName + suffix,
      count: d.count,
      percentage: totalCount > 0 ? (d.count / totalCount * 100).toFixed(1) + "%" : "0%",
      // Pre-format: amCharts bullet sprites don't support {field.formatNumber()} syntax
      countLabel: d.count >= 1_000_000
        ? (d.count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
        : d.count >= 1_000
          ? (d.count / 1_000).toFixed(0) + "K"
          : d.count.toString(),
      category: d.category,
      country: d.country,
      catColor: CATEGORY_COLORS_RQ2[d.category] || "#AACAE0",
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


// ===========================================================================
// 8. FRANCE CONCENTRATION — Force-directed bubble chart (bridge section)
//    Trigger: scroll into .bridge-section
//    Requires: am5hierarchy (loaded via CDN in index.html)
// ===========================================================================

document.addEventListener("DOMContentLoaded", function () {
  am5.ready(function () {
    // Create root element
    var root = am5.Root.new("france-concentration-chart");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);



    // Create wrapper container
    var container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    // Create force-directed tree series
    var series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        singleBranchOnly: false,
        downDepth: 1,
        initialDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        centerStrength: 0.8,
        minRadius: 30,
        maxRadius: am5.percent(15)
      })
    );

    fetch("assets/data/rq02.json")
      .then(res => res.json())
      .then(jsonData => {
        var frData = jsonData.CONCENTRATION_DATA.find(d => d.country === "France");
        var top1 = frData ? frData.pct_top1_provider : 63.5;
        var top2_5 = frData ? Math.round((frData.pct_top5_providers - top1) * 10) / 10 : 27.8;
        var others = frData ? Math.round((100 - frData.pct_top5_providers) * 10) / 10 : 8.7;
        var numOthers = frData ? (frData.num_providers - 5) : 45;
        var topName = (frData && frData.top_provider !== "National Library of France") ? frData.top_provider : "BnF";
        var topTooltip = frData ? frData.top_provider : "National Library of France";

        var data = {
          name: "France",
          nodeSettings: { fill: am5.color(0x1f7f95) },
          children: [
            {
              name: topName,
              value: top1,
              customTooltip: topTooltip + "\nConcentration: " + top1 + "%",
              nodeSettings: { fill: am5.color(0x203464) }
            },
            {
              name: "Top 5",
              value: top2_5,
              customTooltip: "The next 4 top providers\naccount for " + top2_5 + "%",
              nodeSettings: { fill: am5.color(0x4b74a0) }
            },
            {
              name: "Others",
              value: others,
              customTooltip: "The remaining " + numOthers + " providers\nmake up only " + others + "%",
              nodeSettings: { fill: am5.color(0x679e91) }
            }
          ]
        };

        var tooltip = series.set("tooltip", am5.Tooltip.new(root, {}));

        // Style the tooltip background
        tooltip.get("background").setAll({
          fill: am5.color(0x111111),
          fillOpacity: 0.9,
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          cornerRadius: 8
        });

        // Style the tooltip text
        tooltip.label.setAll({
          fill: am5.color(0xffffff),
          fontSize: 14
        });

        // Format nodes
        series.nodes.template.setAll({
          tooltipText: "{customTooltip}",
          cursorOverStyle: "pointer"
        });

        // Apply color settings to the bubbles
        series.circles.template.setAll({
          templateField: "nodeSettings"
        });

        // Format labels
        series.labels.template.setAll({
          text: "{name}\n[bold]{value}%[/]",
          fill: am5.color(0xffffff),
          fontSize: 14,
          oversizedBehavior: "fit",
          textAlign: "center"
        });

        // Remove percentage specifically from the France bubble
        series.labels.template.adapters.add("text", function (text, target) {
          if (target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext.name === "France") {
            return "France";
          }
          return text;
        });

        // Hide tooltip for the center node
        series.nodes.template.adapters.add("tooltipText", function (text, target) {
          if (target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext.name === "France") {
            return "";
          }
          return text;
        });

        // Wait for the falling bubble animation to complete before drawing the chart
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
          var dataSet = false;

          function triggerChart() {
            if (dataSet) return;
            dataSet = true;
            series.data.setAll([data]);
            // Note: For ForceDirected, setting data triggers the layout animation automatically.
          }

          ScrollTrigger.create({
            trigger: ".bridge-section",
            start: "top 85%",
            once: true,
            onEnter: function () {
              var rightCol = document.querySelector(".france-concentration-right");
              var chartContainerEl = document.getElementById("france-concentration-chart");
              var bubble = document.getElementById("falling-france-bubble");

              if (rightCol && chartContainerEl && bubble) {
                var rightColRect = rightCol.getBoundingClientRect();
                var chartRect = chartContainerEl.getBoundingClientRect();
                // targetTop is the offset from the top of rightCol (the positioned parent) to the chart centre
                var targetTop = chartRect.top - rightColRect.top + (chartRect.height / 2) - 60;

                gsap.fromTo(bubble,
                  {
                    top: -300,
                    x: 0,
                    opacity: 0,
                    rotation: -15
                  },
                  {
                    top: targetTop,
                    x: 0,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.8,
                    ease: "power2.inOut",
                    onComplete: function () {
                      gsap.to(bubble, { opacity: 0, duration: 0.3 });
                      triggerChart();
                    }
                  }
                );

                // Failsafe: if animation gets killed or interrupted and onComplete doesn't fire,
                // force the chart to render after 2.5s anyway so it's never left empty.
                setTimeout(triggerChart, 2500);

              } else {
                triggerChart();
              }
            }
          });
        } else {
          series.data.setAll([data]);
        }
      })
      .catch(err => console.error("Error loading concentration data:", err));
  });
});


// ===========================================================================
// 9. PROVIDER MAP — amCharts 5 MapChart with geo points (Section 3)
//    Data: ../notebook/data/json/provider_geo.json
//    Requires: am5map + am5geodata_worldLow (loaded dynamically below)
// ===========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const containerId = "provider-map";
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.dataset.am5built === "1") return;
  container.dataset.am5built = "1";

  const CDN_BASE = "https://cdn.amcharts.com/lib/5";

  function loadScript(src, cb) {
    if (document.querySelector(`script[src="${src}"]`)) {
      if (cb) cb();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadScript(`${CDN_BASE}/index.js`, () =>
    loadScript(`${CDN_BASE}/map.js`, () =>
      loadScript(`${CDN_BASE}/themes/Animated.js`, () =>
        loadScript(`${CDN_BASE}/geodata/worldLow.js`, () =>
          buildMap()
        )
      )
    )
  );

  // Colors per country, reused from your earlier Plotly map for consistency
  const COUNTRY_COLORS_MAP = {
    "Italy": 0x90BE6D,
    "Germany": 0xfeda15,
    "France": 0x1f7f95,
    "Spain": 0xbb521f,
    "Portugal": 0xf4a64e,
    "Netherlands": 0xa180ad
  };

  function buildMap() {
    am5.ready(function () {
      var root = am5.Root.new(containerId);
      root.setThemes([am5themes_Animated.new(root)]);



      var chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "translateX",
          panY: "translateY",
          projection: am5map.geoMercator(),
          homeGeoPoint: { longitude: 7, latitude: 46 },
          homeZoomLevel: 6.5
        })
      );

      // Add zoom control buttons (+ / -)
      chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

      // Force the chart to apply homeZoomLevel + homeGeoPoint on startup
      chart.appear(1000, 100);
      setTimeout(function () { chart.goHome(); }, 300);

      // Predefined zoom targets for each country
      var COUNTRY_VIEWS = {
        "all": { longitude: 7, latitude: 46, zoom: 6.5 },
        "France": { longitude: 2.5, latitude: 46.5, zoom: 20 },
        "Germany": { longitude: 10, latitude: 51, zoom: 20 },
        "Italy": { longitude: 12.5, latitude: 42, zoom: 20 },
        "Netherlands": { longitude: 5.3, latitude: 52.3, zoom: 25 },
        "Portugal": { longitude: -12.2, latitude: 39.5, zoom: 15 },
        "Spain": { longitude: -3.5, latitude: 36, zoom: 15 }
      };

      // Global function called by the toggle buttons in the HTML
      window.mapZoomToCountry = function (country) {
        var view = COUNTRY_VIEWS[country] || COUNTRY_VIEWS["all"];

        // Map country names to CSS hex colors
        var BUTTON_COLORS = {
          "all": "#1a3a5f",
          "France": "#1f7f95",
          "Germany": "#feda15",
          "Italy": "#90BE6D",
          "Netherlands": "#a180ad",
          "Portugal": "#f4a64e",
          "Spain": "#bb521f"
        };

        // Update button styles: reset all, then highlight the active one
        document.querySelectorAll(".map-country-btn").forEach(function (btn) {
          if (btn.dataset.country === country) {
            var bgColor = BUTTON_COLORS[country] || "#1a3a5f";
            btn.style.background = bgColor;
            btn.style.color = "#ffffff";
            btn.style.borderColor = bgColor;
          } else {
            btn.style.background = "";
            btn.style.color = "";
            btn.style.borderColor = "";
          }
        });

        // Animate to target
        chart.zoomToGeoPoint({ longitude: view.longitude, latitude: view.latitude }, view.zoom, true, 800);
      };

      var polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_worldLow
        })
      );

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        fill: am5.color(0x1a2e4c),
        stroke: am5.color(0x0b1a2c),
        strokeWidth: 1
      });

      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x2a446c)
      });

      var pointSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {})
      );

      fetch("assets/data/rq02.json")
        .then(res => res.json())
        .then(jsonData => {
          let data = jsonData.GEO_DATA;
          data = data.filter(d => d.latitude && d.longitude);

          let maxCount = Math.max(...data.map(d => d.count));

          data.forEach(d => {
            d.geometry = { type: "Point", coordinates: [d.longitude, d.latitude] };
            // Pin head radius scaled by sqrt(count) — matches Plotly size_mapped logic
            d.headRadius = 4 + (Math.sqrt(d.count) / Math.sqrt(maxCount)) * 22;
          });

          pointSeries.bullets.push(function (root, series, dataItem) {
            var d = dataItem.dataContext;

            // Normalize country string (e.g. 'italy' -> 'Italy') to match COUNTRY_COLORS_MAP
            var normalizedCountry = d.country
              ? (d.country.charAt(0).toUpperCase() + d.country.slice(1).toLowerCase())
              : "";
            var color = am5.color(COUNTRY_COLORS_MAP[normalizedCountry] || 0x1f7f95);

            var headRadius = d.headRadius || 8;

            var circle = am5.Circle.new(root, {
              radius: headRadius,
              fill: color,
              fillOpacity: 0.7,
              stroke: am5.color(0xffffff),
              strokeWidth: 1,
              tooltipText: "[bold]{provider}[/]\n{city}\n[bold]{count}[/] items",
              cursorOverStyle: "pointer"
            });

            // Optional hover state to make them pop
            circle.states.create("hover", {
              fillOpacity: 1,
              strokeWidth: 2
            });

            return am5.Bullet.new(root, { sprite: circle });
          });

          pointSeries.data.setAll(data);
        })
        .catch(err => console.error("Error loading map data:", err));
    });
  }
});