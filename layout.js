// layout.js
// Person A: set up the SVG, radial axes, circles, purple arc, and center text.
// Expose initRadialChart() and updateRadialChart(selectedRegion).

let svg, gRoot, radius, innerRadius;
let tooltipDiv;
let currentRegion = REGIONS[0];

// Store current metric order so Person B can re-order it.
let currentMetricOrder = [...METRICS];

function initRadialChart() {
  const width = 900;
  const height = 700;
  radius = Math.min(width, height) / 2 - 60;
  innerRadius = 80;

  svg = d3.select("#viz-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  gRoot = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Tooltip (HTML overlay)
  tooltipDiv = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // Angle scale based on currentMetricOrder
  const angleScale = d3.scaleBand()
    .domain(currentMetricOrder)
    .range([0, 2 * Math.PI])
    .paddingInner(0.05);

  // Group for metric wedges (for hover background)
  const wedges = gRoot.append("g")
    .attr("class", "metric-wedges")
    .selectAll(".metric-wedge")
    .data(currentMetricOrder)
    .enter()
    .append("path")
    .attr("class", "metric-wedge")
    .attr("d", d => {
      const a0 = angleScale(d);
      const a1 = a0 + angleScale.bandwidth();
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius + 20);
      return arc({
        startAngle: a0,
        endAngle: a1
      });
    });

  // Axis lines + labels
  const axes = gRoot.append("g")
    .attr("class", "metric-axes")
    .selectAll(".metric-axis")
    .data(currentMetricOrder)
    .enter()
    .append("g")
    .attr("class", "metric-axis")
    .attr("transform", d => {
      const angle = angleScale(d) + angleScale.bandwidth() / 2 - Math.PI / 2;
      return `rotate(${(angle * 180) / Math.PI})`;
    });

  axes.append("line")
    .attr("x1", innerRadius)
    .attr("x2", radius)
    .attr("stroke", "#ddd");

  axes.append("text")
    .attr("class", "metric-label")
    .attr("x", radius + 18)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .text(d => d);

  // Region circles (one group per metric)
  const metricGroups = gRoot.append("g")
    .attr("class", "metric-groups")
    .selectAll(".metric-group")
    .data(currentMetricOrder)
    .enter()
    .append("g")
    .attr("class", "metric-group")
    .attr("data-metric", d => d)
    .attr("transform", d => {
      const angle = angleScale(d) + angleScale.bandwidth() / 2 - Math.PI / 2;
      return `rotate(${(angle * 180) / Math.PI})`;
    });

  // For position along axis, use a simple radial scale [0,1] -> [innerRadius, radius]
  const rScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerRadius, radius]);

  // For each metric, add circles for regions
  metricGroups.each(function(metric) {
    const g = d3.select(this);
    const ranking = getRegionRankingForMetric(metric); // [{region, value}, ...]

    g.selectAll(".region-circle")
      .data(ranking, d => d.region)
      .enter()
      .append("circle")
      .attr("class", d => "region-circle region-" + cssSafe(d.region))
      .attr("cx", d => rScale(d.value))
      .attr("cy", 0)
      .attr("r", 4);
  });

  // Center summary text
  gRoot.append("text")
    .attr("class", "center-summary")
    .attr("id", "center-percentage")
    .attr("y", -10)
    .text("0%");

  gRoot.append("text")
    .attr("class", "center-subtitle")
    .attr("id", "center-subtitle")
    .attr("y", 18)
    .text("of metrics are stronger than the average of other regions");

  // Purple arc for "strong metrics" (placeholder path)
  gRoot.append("path")
    .attr("id", "highlight-arc")
    .attr("fill", "none")
    .attr("stroke", "#9333ea")
    .attr("stroke-width", 6)
    .attr("stroke-linecap", "round");

  // Initial update with default region
  updateRadialChart(currentRegion);
}

/**
 * Helper: convert region name to a valid CSS class string.
 */
function cssSafe(str) {
  return str.replace(/\s+/g, "-").replace(/&/g, "and");
}

/**
 * Compute "strong" metrics for selected region.
 * Returns an array of metric names where selected region ranks #1.
 */
function getStrongMetrics(selectedRegion) {
  // TODO (Person A): you can define "strong" differently if needed.
  return currentMetricOrder.filter(metric => {
    const ranking = getRegionRankingForMetric(metric);
    return ranking[0].region === selectedRegion;
  });
}

/**
 * Update radial chart when the selected region changes.
 * Person A: implement layout bits; Person B will call this from interaction.js.
 */
function updateRadialChart(selectedRegion) {
  currentRegion = selectedRegion;

  // 1. (Person B later) Re-order currentMetricOrder so "strong" metrics are consecutive.
  // For now, we leave order as-is; just recompute strong metrics.
  const strongMetrics = getStrongMetrics(selectedRegion);
  const strongPercent = Math.round(100 * strongMetrics.length / currentMetricOrder.length);

  d3.select("#center-percentage").text(strongPercent + "%");

  // 2. Re-compute purple arc over the span of strong metrics.
  const angleScale = d3.scaleBand()
    .domain(currentMetricOrder)
    .range([0, 2 * Math.PI])
    .paddingInner(0.05);

  const arcGen = d3.arc()
    .innerRadius(radius + 8)
    .outerRadius(radius + 8);

  // Simple version: cover from first strong metric to last strong metric in current order
  if (strongMetrics.length > 0) {
    const firstMetric = strongMetrics[0];
    const lastMetric = strongMetrics[strongMetrics.length - 1];

    const startAngle = angleScale(firstMetric);
    const endAngle = angleScale(lastMetric) + angleScale.bandwidth();

    d3.select("#highlight-arc")
      .attr("d", arcGen({
        startAngle,
        endAngle
      }))
      .attr("visibility", "visible");
  } else {
    d3.select("#highlight-arc").attr("visibility", "hidden");
  }

  // 3. Update circles: size/color for selected region vs. others, and x-position for values.
  const rScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerRadius, radius]);

  gRoot.selectAll(".metric-group").each(function(metric) {
    const g = d3.select(this);
    const ranking = getRegionRankingForMetric(metric); // recompute; could be cached

    const circles = g.selectAll(".region-circle")
      .data(ranking, d => d.region);

    circles
      .transition()
      .duration(600)
      .attr("cx", d => rScale(d.value))
      .attr("r", d => d.region === selectedRegion ? 7 : 4)
      .classed("selected", d => d.region === selectedRegion);
  });

  // Note: hover behavior and metric reordering are handled in interaction.js
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initRadialChart);
