document.addEventListener("DOMContentLoaded", function () {
  am5.ready(function () {
    // Create root element
    var root = am5.Root.new("france-concentration-chart");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Hide amcharts logo
    if (root._logo) {
      root._logo.dispose();
    }

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

    var data = {
      name: "France",
      nodeSettings: { fill: am5.color(0x1f7f95) },
      children: [
        {
          name: "BnF",
          value: 63.5,
          customTooltip: "National Library of France\nConcentration: 63.5%",
          nodeSettings: { fill: am5.color(0x203464) }
        },
        {
          name: "Top 5",
          value: 27.8,
          customTooltip: "The next 4 top providers\naccount for 27.8%",
          nodeSettings: { fill: am5.color(0x4b74a0) }
        },
        {
          name: "Others",
          value: 8.7,
          customTooltip: "The remaining 45 providers\nmake up only 8.7%",
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
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
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
          var bridgeSection = document.querySelector(".bridge-section");
          var chartContainerEl = document.getElementById("france-concentration-chart");
          var bubble = document.getElementById("falling-france-bubble");

          if (bridgeSection && chartContainerEl && bubble) {
            var bridgeRect = bridgeSection.getBoundingClientRect();
            var chartRect = chartContainerEl.getBoundingClientRect();
            var targetTop = chartRect.top - bridgeRect.top + (chartRect.height / 2) - 60;

            gsap.fromTo(bubble,
              {
                top: -300,
                x: -150,
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
  });
});
