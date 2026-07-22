/* ==========================================================================
   rq01.js — Combined Chart Initializer
   Includes logic for both RSQ01 (Stacked Bar) and RSQ03 (Bubble Chart)
   ========================================================================== */

const CDN_BASE = "https://cdn.amcharts.com/lib/5";

function loadScript(src, cb) {
  if (document.querySelector(`script[src="${src}"]`)) { cb(); return; }
  const s = document.createElement("script");
  s.src = src; s.onload = cb;
  document.head.appendChild(s);
}

/* ── State for RsQ03 ── */
const PT_ORIGINAL_X  = 7.22;
const PT_CORRECTED_X = parseFloat(((40 / 3395) * 100).toFixed(3)); /* ≈ 1.178 */
const MAX_OBJ = 9204845; /* NL — largest bubble */
const MIN_R   = 8;
const MAX_R   = 52;

function calcRadius(objects) {
  return Math.round(MIN_R + (MAX_R - MIN_R) * Math.sqrt(objects / MAX_OBJ));
}

let _rq03Series  = null;
let _rq03Data    = null;
let _ptCorrected = false;
let _am5ref      = null;

window.togglePTCorrection = function () {
  if (!_rq03Series || !_rq03Data || !_am5ref) return;

  _ptCorrected = !_ptCorrected;
  const ptIdx  = _rq03Data.findIndex(d => d.iso === "PT");
  const newX   = _ptCorrected ? PT_CORRECTED_X : PT_ORIGINAL_X;

  _rq03Series.data.setIndex(ptIdx, { ..._rq03Data[ptIdx], x: newX });
  _rq03Data[ptIdx].x = newX;

  const btn = document.getElementById("pt-correct-btn");
  if (btn) {
    btn.innerHTML = _ptCorrected ? 'Reset to Wikidata' : 'Correct Portugal\'s data';
    btn.classList.toggle("corrected", _ptCorrected);
  }
};

function initCharts() {
  const c1 = document.getElementById("rsq01-chart-div");
  const c3 = document.getElementById("rsq03-chart-div");

  if (!c1 && !c3) return;
  if (c1 && c1.dataset.am5built === "1") return;
  if (c3 && c3.dataset.am5built === "1") return;

  if (c1) c1.dataset.am5built = "1";
  if (c3) c3.dataset.am5built = "1";

  loadScript(`${CDN_BASE}/index.js`, () =>
    loadScript(`${CDN_BASE}/xy.js`, () =>
      loadScript(`${CDN_BASE}/themes/Animated.js`, () => {
        
        const am5 = window.am5;
        const am5xy = window.am5xy;
        const am5themes_Animated = window.am5themes_Animated;
        if (!am5 || !am5xy) {
            setTimeout(initCharts, 300);
            return;
        }

        fetch('./assets/data/rq01.json')
          .then(res => res.json())
          .then(data => {
            if (c1) buildRQ01Chart(c1.id, data, am5, am5xy, am5themes_Animated);
            if (c3) buildRQ03Chart(c3.id, data, am5, am5xy, am5themes_Animated);
          })
          .catch(err => console.error("Error loading RQ01/03 data:", err));
      })
    )
  );
}

function buildRQ01Chart(containerId, data, am5, am5xy, am5themes_Animated) {
    const root = am5.Root.new(containerId);
    root._logo && root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const TEXT_DARK     = am5.color(0x1a2030);
    const WATER_OFFLINE = am5.color(0xc6e8f4);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingTop: 22,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 24,
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 20,
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
    });
    xRenderer.labels.template.setAll({
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      fill: TEXT_DARK,
      fontWeight: "600",
      oversizedBehavior: "truncate",
      maxWidth: 80,
    });
    xRenderer.grid.template.setAll({ visible: false });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "iso",
        renderer: xRenderer,
      })
    );

    xAxis.children.push(am5.Label.new(root, {
      text: "Country",
      x: am5.percent(50),
      centerX: am5.percent(50),
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fill: TEXT_DARK,
      opacity: 0.55,
      marginTop: 6,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fill: TEXT_DARK,
      opacity: 0.55,
    });
    yRenderer.grid.template.setAll({
      stroke: TEXT_DARK,
      strokeOpacity: 0.08,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: yRenderer,
        numberFormat: "#'%'",
      })
    );

    yAxis.children.unshift(am5.Label.new(root, {
      text: "Share of Physical GLAMs",
      rotation: -90,
      y: am5.percent(50),
      centerX: am5.percent(50),
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fill: TEXT_DARK,
      opacity: 0.55,
    }));

    function makeSeries(name, valueField, isActive) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: valueField,
          categoryXField: "iso",
          stacked: true,
          tooltip: am5.Tooltip.new(root, {
            labelHTML: isActive
              ? "<b>{country}</b><br/>Europeana providers: {providers}<br/>Participation: {rate}%"
              : "<b>{country}</b><br/>Wikidata GLAM total: {wikidata}<br/>Offline: {offline}%",
          }),
        })
      );

      if (isActive) {
        series.setAll({
          fill: am5.color(0x1a3a5f),
          stroke: am5.color(0x1a3a5f)
        });

        series.columns.template.setAll({
          width: am5.percent(72),
          cornerRadiusBL: 8,
          cornerRadiusBR: 8
        });

        series.bullets.push((_root, _series, dataItem) => {
          const val = dataItem.get("valueY") ?? 0;
          return am5.Bullet.new(root, {
            locationY: 1,
            sprite: am5.Label.new(root, {
              text: val.toFixed(1) + "%",
              fill: TEXT_DARK,
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: "700",
              centerX: am5.percent(50),
              centerY: am5.percent(100),
              dy: -4,
              populateText: true,
            }),
          });
        });
      } else {
        const bgColorHex = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || "#e8f0f6";
        series.setAll({
          fill: am5.color(bgColorHex),
          stroke: am5.color(bgColorHex)
        });

        series.columns.template.setAll({
          width: am5.percent(72),
          cornerRadiusTL: 8,
          cornerRadiusTR: 8
        });
      }

      return series;
    }

    const activeSeries  = makeSeries("Active on Europeana", "rate",    true);
    const offlineSeries = makeSeries("Offline GLAMs",        "offline", false);

    const legend = chart.bottomAxesContainer.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        layout: root.horizontalLayout,
      })
    );
    legend.labels.template.setAll({
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      fill: TEXT_DARK,
    });
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 3,
      cornerRadiusTR: 3,
      cornerRadiusBL: 3,
      cornerRadiusBR: 3,
    });
    legend.data.setAll(chart.series.values);

    const chartData = data
      .slice()
      .sort((a, b) => b.rate - a.rate)
      .map((d) => ({
        country:   d.country,
        iso:       d.iso,
        rate:      parseFloat(d.rate.toFixed(2)),
        offline:   parseFloat((100 - d.rate).toFixed(2)),
        providers: d.providers,
        wikidata:  d.wikidata,
      }));

    xAxis.data.setAll(chartData);
    activeSeries.data.setAll(chartData);
    offlineSeries.data.setAll(chartData);

    activeSeries.appear(1000);
    offlineSeries.appear(1000);
    chart.appear(1000, 100);
}

function buildRQ03Chart(containerId, data, am5, am5xy, am5themes_Animated) {
    _am5ref = am5;
    const root = am5.Root.new(containerId);
    root._logo && root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const TEXT_DARK = am5.color(0x1a2030);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false, panY: false,
        wheelX: "none", wheelY: "none",
        layout: root.verticalLayout,
        paddingTop: 22, paddingBottom: 16,
        paddingLeft: 20, paddingRight: 24,
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 80 });
    xRenderer.labels.template.setAll({
      fontFamily: "Inter, sans-serif",
      fontSize: 11, fill: TEXT_DARK, opacity: 0.6,
    });
    xRenderer.grid.template.setAll({
      stroke: am5.color(0x1a3a5f), strokeOpacity: 0.15,
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -0.5, max: 11.2,
        strictMinMax: true,
        renderer: xRenderer,
        numberFormat: "#'%'",
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.children.push(am5.Label.new(root, {
      text: "GLAM Participation Rate",
      x: am5.percent(50),
      centerX: am5.percent(50),
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fill: TEXT_DARK,
      opacity: 0.55,
      marginTop: 6,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fontFamily: "Inter, sans-serif",
      fontSize: 11, fill: TEXT_DARK, opacity: 0.6,
    });
    yRenderer.grid.template.setAll({
      stroke: am5.color(0x1a3a5f), strokeOpacity: 0.15,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0.75, max: 1.56,
        strictMinMax: true,
        renderer: yRenderer,
        numberFormat: "#.0'%'",
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    yRenderer.labels.template.adapters.add("visible", (visible, target) => {
      const val = target.dataItem?.get("value");
      if (val !== undefined && (val <= 0.8 || val >= 1.5)) return false;
      return visible;
    });
    yRenderer.grid.template.adapters.add("visible", (visible, target) => {
      const val = target.dataItem?.get("value");
      if (val !== undefined && (val <= 0.8 || val >= 1.5)) return false;
      return visible;
    });

    yAxis.children.unshift(am5.Label.new(root, {
      text: "Public Funding in Culture (% GDP)",
      rotation: -90,
      y: am5.percent(50),
      centerX: am5.percent(50),
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fill: TEXT_DARK,
      opacity: 0.55,
    }));

    const colorMap = {
      "IT": 0x90be6d,
      "FR": 0x1f7f95,
      "DE": 0xfeda15,
      "NL": 0xa180ad,
      "PT": 0xf4a64e,
      "ES": 0xbb521f
    };

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        calculateAggregates: true,
        xAxis,
        yAxis,
        valueXField: "x",
        valueYField: "y",
        seriesTooltipTarget: "bullet",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "[bold]{country}[/]\nMobilisation rate: {valueX.formatNumber('#.00')}%\nCulture expenditure: {valueY.formatNumber('#.0')}% GDP\nEuropeana objects: {objects.formatNumber('#,###')}",
        }),
      })
    );

    series.strokes.template.setAll({ visible: false });

    series.bullets.push(function (root, series, dataItem) {
      const ctx    = dataItem.dataContext;
      const radius = ctx.radius || 20;
      const fill   = am5.color(ctx.color || 0x888888);

      const container = am5.Container.new(root, { interactive: true });

      const ring = am5.Circle.new(root, {
        radius: radius + 4,
        fill: fill,
        fillOpacity: 0.18,
        stroke: fill,
        strokeOpacity: 0,
      });

      const circle = am5.Circle.new(root, {
        radius,
        fill,
        fillOpacity: 0.6,
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
        cursorOverStyle: "pointer",
        tooltipText: "[bold]{country}[/]\nGLAM Participation Rate: {valueX.formatNumber('#.0')}%\nPublic Funding in Culture (% of GDP): {valueY.formatNumber('#.0')}%\nTotal objects in Europeana: {objects.formatNumber('#,###')}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
        }),
      });

      circle.get("tooltip").label.setAll({
        fontSize: 11,
        fontFamily: "Inter, sans-serif",
      });

      const label = am5.Label.new(root, {
        text: ctx.iso || "",
        fill: TEXT_DARK,
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        fontWeight: "700",
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        dy: -(radius + 10),
      });

      container.children.push(ring);
      container.children.push(circle);
      container.children.push(label);

      circle.events.on("pointerover", () => {
        ring.animate({ key: "fillOpacity", to: 0.32, duration: 200 });
        ring.animate({ key: "strokeOpacity", to: 0.6,  duration: 200 });
        circle.animate({ key: "fillOpacity", to: 1,    duration: 200 });
      });
      circle.events.on("pointerout", () => {
        ring.animate({ key: "fillOpacity", to: 0.18, duration: 200 });
        ring.animate({ key: "strokeOpacity", to: 0,   duration: 200 });
        circle.animate({ key: "fillOpacity", to: 0.6, duration: 200 });
      });

      return am5.Bullet.new(root, { sprite: container, dynamic: true });
    });

    const chartData = data.map(d => ({
      ...d,
      color: colorMap[d.iso],
      radius: calcRadius(d.objects)
    }));

    series.data.setAll(chartData);

    _rq03Series = series;
    _rq03Data   = chartData;

    series.appear(1000);
    chart.appear(1000, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCharts);
} else {
  initCharts();
}
