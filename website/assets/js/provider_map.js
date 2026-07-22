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
  const COUNTRY_COLORS = {
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

      if (root._logo) root._logo.dispose();

      var chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "translateX",
          panY: "translateY",
          projection: am5map.geoMercator(),
          // layout: root.horizontalLayout,
          // You can edit these values to set the exact starting zoom and center position!
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

        // Map country names to CSS hex colors (mirrors COUNTRY_COLORS above)
        var BUTTON_COLORS = {
          "all":         "#1a3a5f",
          "France":      "#1f7f95",
          "Germany":     "#feda15",
          "Italy":       "#90BE6D",
          "Netherlands": "#a180ad",
          "Portugal":    "#f4a64e",
          "Spain":       "#bb521f"
        };

        // Update button styles: reset all, then highlight the active one
        document.querySelectorAll(".map-country-btn").forEach(function (btn) {
          if (btn.dataset.country === country) {
            var bgColor = BUTTON_COLORS[country] || "#1a3a5f";
            btn.style.background    = bgColor;
            btn.style.color         = "#ffffff";
            btn.style.borderColor   = bgColor;
          } else {
            btn.style.background    = "";
            btn.style.color         = "";
            btn.style.borderColor   = "";
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

      // Removed the datavalidated zoomToDataItems override so your homeZoomLevel is respected.

      var pointSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {})
      );

      fetch("../notebook/data/json/provider_geo.json")
        .then(res => res.json())
        .then(data => {
          data = data.filter(d => d.latitude && d.longitude);

          let maxCount = Math.max(...data.map(d => d.count));

          data.forEach(d => {
            d.geometry = { type: "Point", coordinates: [d.longitude, d.latitude] };
            // Pin head radius scaled by sqrt(count) — matches your Plotly size_mapped logic
            d.headRadius = 4 + (Math.sqrt(d.count) / Math.sqrt(maxCount)) * 22;
          });

          pointSeries.bullets.push(function (root, series, dataItem) {
            var d = dataItem.dataContext;

            // Normalize country string (e.g. 'italy' -> 'Italy') to match COUNTRY_COLORS
            var normalizedCountry = d.country ? (d.country.charAt(0).toUpperCase() + d.country.slice(1).toLowerCase()) : "";
            var color = am5.color(COUNTRY_COLORS[normalizedCountry] || 0x1f7f95);

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