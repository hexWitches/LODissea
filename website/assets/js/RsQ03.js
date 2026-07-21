/* ==========================================================================
   RsQ03 Chart — amCharts 5  |  Bubble / Scatter Chart
   X: GLAM Participation Rate (%)
   Y: Public Cultural Expenditure (% GDP)
   Bubble area ∝ total Europeana objects
   Interactive: Portugal bias correction animation
   ========================================================================== */

const PT_ORIGINAL_X  = 7.22;
const PT_CORRECTED_X = parseFloat(((40 / 3395) * 100).toFixed(3)); /* ≈ 1.178 */

const rq03Bubbles = [
  { iso: "IT", country: "Italy",       x: 1.11,           y: 0.90, objects: 1832376, color: 0x90be6d },
  { iso: "FR", country: "France",      x: 1.89,           y: 1.40, objects: 4724898, color: 0x1f7f95 },
  { iso: "DE", country: "Germany",     x: 4.00,           y: 1.00, objects: 8701240, color: 0xfeda15 },
  { iso: "NL", country: "Netherlands", x: 6.76,           y: 1.10, objects: 9204845, color: 0xa180ad },
  { iso: "PT", country: "Portugal",    x: PT_ORIGINAL_X,  y: 0.90, objects: 139858,  color: 0xf4a64e },
  { iso: "ES", country: "Spain",       x: 9.78,           y: 1.20, objects: 6581724, color: 0xbb521f },
];

const MAX_OBJ = 9204845; /* NL — largest bubble */
const MIN_R   = 8;
const MAX_R   = 52;

function calcRadius(objects) {
  return Math.round(MIN_R + (MAX_R - MIN_R) * Math.sqrt(objects / MAX_OBJ));
}

/* ── State ── */
let _rq03Series  = null;
let _rq03Data    = null;
let _ptCorrected = false;
let _am5ref      = null;

/* ── Public toggle (called by the HTML button) ── */
window.togglePTCorrection = function () {
  if (!_rq03Series || !_rq03Data || !_am5ref) return;

  _ptCorrected = !_ptCorrected;
  const ptIdx  = _rq03Data.findIndex(d => d.iso === "PT");
  const newX   = _ptCorrected ? PT_CORRECTED_X : PT_ORIGINAL_X;

  /* Update the data — Animated theme provides the smooth transition */
  _rq03Series.data.setIndex(ptIdx, { ..._rq03Data[ptIdx], x: newX });
  _rq03Data[ptIdx].x = newX;

  /* Update button label */
  const btn = document.getElementById("pt-correct-btn");
  if (btn) {
    btn.innerHTML = _ptCorrected
      ? 'Reset to Wikidata'
      : 'Correct Portugal\'s data';
    btn.classList.toggle("corrected", _ptCorrected);
  }
};

/* ── Chart initialiser ── */
function initRQ03Chart() {
  const containerId = "rsq03-chart-div";
  const container   = document.getElementById(containerId);
  if (!container) return;
  if (container.dataset.am5built === "1") return;
  container.dataset.am5built = "1";

  const CDN_BASE = "https://cdn.amcharts.com/lib/5";
  function loadScript(src, cb) {
    if (document.querySelector(`script[src="${src}"]`)) { cb(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = cb;
    document.head.appendChild(s);
  }

  loadScript(`${CDN_BASE}/index.js`, () =>
    loadScript(`${CDN_BASE}/xy.js`, () =>
      loadScript(`${CDN_BASE}/themes/Animated.js`, () =>
        buildChart()
      )
    )
  );

  function buildChart() {
    setTimeout(() => {
      try {
        const am5   = window.am5;
        const am5xy = window.am5xy;
        const am5themes_Animated = window.am5themes_Animated;
        if (!am5 || !am5xy) { setTimeout(buildChart, 300); return; }

        _am5ref = am5;

        /* ── Root ── */
        const root = am5.Root.new(containerId);
        root._logo && root._logo.dispose();
        root.setThemes([am5themes_Animated.new(root)]);

        const TEXT_DARK = am5.color(0x1a2030);

        /* ── XYChart ── */
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false, panY: false,
            wheelX: "none", wheelY: "none",
            layout: root.verticalLayout,
            paddingTop: 22, paddingBottom: 16,
            paddingLeft: 20, paddingRight: 24,
          })
        );

        /* ── X-axis: Participation Rate (%) — locked [-0.5, 12.5] ── */
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


        /* X-axis label */
        xAxis.children.push(am5.Label.new(root, {
          text: "GLAM Participation Rate (%)",
          x: am5.percent(50),
          centerX: am5.percent(50),
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fill: TEXT_DARK,
          opacity: 0.55,
          marginTop: 6,
        }));

        /* ── Y-axis: Culture Expenditure (% GDP) ── */
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
            min: 0.75, max: 1.52,
            strictMinMax: true,
            renderer: yRenderer,
            numberFormat: "#.0'%'",
            tooltip: am5.Tooltip.new(root, {}),
          })
        );

        /* Hide 0.8% and 1.5% labels and gridlines completely */
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


        /* Y-axis label */
        yAxis.children.unshift(am5.Label.new(root, {
          text: "Public Cultural Expenditure (% GDP)",
          rotation: -90,
          y: am5.percent(50),
          centerX: am5.percent(50),
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fill: TEXT_DARK,
          opacity: 0.55,
        }));

        /* ── Bubble series ── */
        const chartData = rq03Bubbles.map(d => ({
          ...d,
          radius: calcRadius(d.objects),
        }));

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

        /* Remove the connecting line */
        series.strokes.template.setAll({ visible: false });

        /* ── Circle bullet (sized + coloured per data item) ── */
        series.bullets.push(function (root, series, dataItem) {
          const ctx    = dataItem.dataContext;
          const radius = ctx.radius || 20;
          const fill   = am5.color(ctx.color || 0x888888);

          /* Outer glow ring */
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
            tooltipText: "[bold]{country}[/]\nParticipation rate: {valueX.formatNumber('#.0')}%\nCulture expenditure: {valueY.formatNumber('#.0')}% GDP\nEuropeana objects: {objects.formatNumber('#,###')}",
            tooltip: am5.Tooltip.new(root, {
              pointerOrientation: "horizontal",
            }),
          });

          circle.get("tooltip").label.setAll({
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
          });

          /* ISO label above bubble */
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

          /* Hover pulse on the ring */
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

        /* ── Feed data ── */
        series.data.setAll(chartData);

        /* ── Store refs for animation ── */
        _rq03Series = series;
        _rq03Data   = chartData;

        /* ── Animate in ── */
        series.appear(1000);
        chart.appear(1000, 100);

      } catch (err) {
        console.error("RQ03 chart build error:", err);
      }
    }, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRQ03Chart);
} else {
  initRQ03Chart();
}
