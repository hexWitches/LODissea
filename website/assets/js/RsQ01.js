/* ==========================================================================
   RQ01 Chart — amCharts 5  |  Vertical Stacked Bar  |  Water-Fill
   "Do Europeana providers reflect the number of GLAM institutions?"
   ========================================================================== */

const rq01Data = [
  { country: "Spain",       iso: "ES", wikidata: 2813,  providers: 275, rate: 9.78 },
  { country: "Portugal",    iso: "PT", wikidata: 554,   providers: 40,  rate: 7.22 },
  { country: "Netherlands", iso: "NL", wikidata: 1539,  providers: 104, rate: 6.76 },
  { country: "Germany",     iso: "DE", wikidata: 9370,  providers: 375, rate: 4.00 },
  { country: "France",      iso: "FR", wikidata: 2640,  providers: 50,  rate: 1.89 },
  { country: "Italy",       iso: "IT", wikidata: 14236, providers: 158, rate: 1.11 },
];

function initRQ01Chart() {
  const containerId = "rsq01-chart-div";
  const container   = document.getElementById(containerId);
  if (!container) return;
  if (container.dataset.am5built === "1") return;
  container.dataset.am5built = "1";

  const CDN_BASE = "https://cdn.amcharts.com/lib/5";

  function loadScript(src, cb) {
    if (document.querySelector(`script[src="${src}"]`)) { cb(); return; }
    const s  = document.createElement("script");
    s.src    = src;
    s.onload = cb;
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

        if (!am5 || !am5xy) {
          setTimeout(buildChart, 300);
          return;
        }

        /* ── Root ── */
        const root = am5.Root.new(containerId);
        root._logo && root._logo.dispose();
        root.setThemes([am5themes_Animated.new(root)]);

        const TEXT_DARK     = am5.color(0x1a2030);
        const WATER_OFFLINE = am5.color(0xc6e8f4);

        /* ── XYChart (vertical bars → default layout) ── */
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

        /* ── X-axis (countries) ── */
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

        /* ── Y-axis (0–100%) ── */
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

        /* ── Helper: create a stacked vertical column series ── */
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

            /* Percentage label above the active bar */
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
            const bgColorHex = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
            /* Offline bars — match hero background color dynamically */
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

        /* ── Legend ── */
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

        /* ── Data (sorted descending by rate for visual clarity) ── */
        const chartData = rq01Data
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

        /* ── Animate in ── */
        activeSeries.appear(1000);
        offlineSeries.appear(1000);
        chart.appear(1000, 100);

      } catch (err) {
        console.error("RQ01 chart build error:", err);
      }
    }, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRQ01Chart);
} else {
  initRQ01Chart();
}
