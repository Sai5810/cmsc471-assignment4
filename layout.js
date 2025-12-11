// Radial layout with center text, base arc, highlight arc, and metric ranges

let svg, gRoot, tooltipDiv;
let innerRadius, radius;
let currentRegion = REGIONS[0];
let currentMetricOrder = [...METRICS];

// Scales and generators
const scales = {
  angle: d3.scaleBand().range([0, 2 * Math.PI]).paddingInner(0.18),
  r: d3.scaleLinear().domain([0, 1])
};

const arcs = {
  wedge: d3.arc(),
  base: d3.arc(),
  highlight: d3.arc()
};

function initRadialChart() {
  const [w, h] = [900, 700];
  innerRadius = 100;
  radius = Math.min(w, h) / 2 - 60;

  // Setup SVG
  svg = d3.select("#viz-container")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  gRoot = svg.append("g")
    .attr("transform", `translate(${w / 2},${h / 2})`);

  tooltipDiv = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // Configure scales
  scales.angle.domain(currentMetricOrder);
  scales.r.range([innerRadius + 10, radius - 10]);

  // Configure arcs
  arcs.wedge.innerRadius(innerRadius).outerRadius(radius + 4);
  
  const arcR = [radius + 4, radius + 10];
  arcs.base.innerRadius(arcR[0]).outerRadius(arcR[1]);
  arcs.highlight.innerRadius(arcR[0]).outerRadius(arcR[1]);

  // Build static elements
  buildWedges();
  buildAxes();
  buildMetricGroups();
  buildCenterText();
  buildArcs();

  updateRadialChart(currentRegion);
}

function buildWedges() {
  gRoot.append("g")
    .attr("class", "metric-wedges")
    .selectAll(".metric-wedge")
    .data(currentMetricOrder)
    .join("path")
    .attr("class", "metric-wedge")
    .attr("d", d => {
      const [a0, a1] = [scales.angle(d), scales.angle(d) + scales.angle.bandwidth()];
      return arcs.wedge({ startAngle: a0, endAngle: a1 });
    })
    .on("mouseover", function() { d3.select(this).style("fill", "#cccccc"); })
    .on("mouseout", function() { d3.select(this).style("fill", null); });
}

function normalizeAngle(deg) {
  return (deg % 360 + 360) % 360;
}

function buildAxes() {
  const axes = gRoot.append("g")
    .attr("class", "metric-axes")
    .selectAll(".metric-axis")
    .data(currentMetricOrder)
    .join("g")
    .attr("class", "metric-axis")
    .attr("transform", d => `rotate(${getRotation(d)})`);

  axes.append("line")
    .attr("class", "metric-axis-base")
    .attr("x1", innerRadius)
    .attr("x2", radius)
    .attr("stroke", "#f0f0f0");

  axes.append("text")
    .attr("class", "metric-label")
    .attr("x", innerRadius + 60)
    .attr("y", 10)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => {
      const a = normalizeAngle(getRotation(d));
      return (a > 90 && a < 270) ? "end" : "start";
    })
    .attr("transform", d => {
      const rot = getRotation(d);
      const a = normalizeAngle(rot);
      const x = innerRadius + 60;
      if (a > 90 && a < 270) {
        return `rotate(180 ${x} 0)`;
      }
      return null;
    })
    .text(d => d.toUpperCase());

}

function buildMetricGroups() {
  const groups = gRoot.append("g")
    .attr("class", "metric-groups")
    .selectAll(".metric-group")
    .data(currentMetricOrder)
    .join("g")
    .attr("class", "metric-group")
    .attr("data-metric", d => d)
    .attr("transform", d => `rotate(${getRotation(d)})`);

  groups.each(function(metric) {
    const g = d3.select(this);
    const ranking = getRegionRankingForMetric(metric);
    if (!ranking.length) return;

    const [minVal, maxVal] = d3.extent(ranking, d => d.value);
    const [rMin, rMax] = [scales.r(minVal), scales.r(maxVal)];

    // Range lines
    g.append("line")
      .attr("class", "metric-range-solid")
      .attr("x1", innerRadius)
      .attr("x2", rMin);

    g.append("line")
      .attr("class", "metric-range-dashed")
      .attr("x1", rMin)
      .attr("x2", rMax);

    // Position circles to avoid overlap using force simulation approach
    const circleRadius = 4;
    const positions = ranking.map((d, i) => ({
      ...d,
      x: scales.r(d.value),
      y: 0,
      index: i
    }));

    // Simple collision resolution: spread vertically if too close
    positions.sort((a, b) => a.x - b.x);
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const dx = curr.x - prev.x;
      const minDist = circleRadius * 2 + 1;
      
      if (dx < minDist) {
        // Stagger vertically
        const offset = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 6;
        curr.y = offset;
      }
    }

    // Data circles
    g.selectAll(".region-circle")
      .data(positions, d => d.region)
      .join("circle")
      .attr("class", d => `region-circle region-${cssSafe(d.region)}`)
      .classed("selected", d => d.region === currentRegion) // purple style
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.region === currentRegion ? 7 : 4)
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    // Hit targets
    g.selectAll(".hit-target")
      .data(positions, d => d.region)
      .join("circle")
      .attr("class", "hit-target")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 14)
      .style("fill", "transparent")
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);
  });
}

function buildCenterText() {
  gRoot.append("text")
    .attr("class", "center-summary")
    .attr("id", "center-percentage")
    .attr("y", -4)
    .text("0%");

  const lines = ["of metrics are stronger than the", "average of other regions"];
  gRoot.append("text")
    .attr("class", "center-subtitle")
    .attr("id", "center-subtitle")
    .attr("text-anchor", "middle")
    .selectAll("tspan")
    .data(lines)
    .join("tspan")
    .attr("x", 0)
    .attr("dy", (d, i) => i === 0 ? 22 : 16)
    .text(d => d);
}

function buildArcs() {
  const fullCircle = { startAngle: 0, endAngle: 2 * Math.PI };
  
  gRoot.append("path")
    .attr("id", "base-arc")
    .attr("d", arcs.base(fullCircle))
    .style("fill", "none")
    .style("stroke", "#f2f2f4")
    .style("stroke-width", 10)
    .style("stroke-linecap", "round");

  gRoot.append("path")
    .attr("id", "highlight-arc")
    .style("fill", "none")
    .style("stroke", "var(--color-primary-dark)")
    .style("stroke-width", 10)
    .style("stroke-linecap", "round")
    .style("visibility", "hidden");
}

function updateRadialChart(selectedRegion) {
  currentRegion = selectedRegion;

  // Reorder metrics: strong first
  const strong = METRICS.filter(m => {
    const r = getRegionRankingForMetric(m);
    return r.length && r[0].region === selectedRegion;
  });
  currentMetricOrder = [...strong, ...METRICS.filter(m => !strong.includes(m))];

  scales.angle.domain(currentMetricOrder);

  // Update center
  const pct = Math.round(100 * strong.length / METRICS.length);
  d3.select("#center-percentage").text(`${pct}%`);

  const t = d3.transition().duration(600);

  // Update wedges
  gRoot.selectAll(".metric-wedge")
    .transition(t)
    .attr("d", d => {
      const [a0, a1] = [scales.angle(d), scales.angle(d) + scales.angle.bandwidth()];
      return arcs.wedge({ startAngle: a0, endAngle: a1 });
    });

  // Update axes
  gRoot.selectAll(".metric-axis")
    .transition(t)
    .attr("transform", d => `rotate(${getRotation(d)})`);

  // Update metric groups
  gRoot.selectAll(".metric-group")
    .transition(t)
    .attr("transform", d => `rotate(${getRotation(d)})`);

  // Update circles and ranges
  gRoot.selectAll(".metric-group").each(function(metric) {
    const g = d3.select(this);
    const ranking = getRegionRankingForMetric(metric);
    if (!ranking.length) return;

    const [minVal, maxVal] = d3.extent(ranking, d => d.value);
    const [rMin, rMax] = [scales.r(minVal), scales.r(maxVal)];

    g.select(".metric-range-solid").transition(t).attr("x2", rMin);
    g.select(".metric-range-dashed").transition(t).attr("x1", rMin).attr("x2", rMax);

    // Recalculate positions with collision detection
    const circleRadius = 4;
    const positions = ranking.map((d, i) => ({
      ...d,
      x: scales.r(d.value),
      y: 0,
      index: i
    }));

    positions.sort((a, b) => a.x - b.x);
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const dx = curr.x - prev.x;
      const minDist = circleRadius * 2 + 1;
      
      if (dx < minDist) {
        const offset = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 6;
        curr.y = offset;
      }
    }

  g.selectAll(".region-circle")
    .data(positions, d => d.region)
    .classed("selected", d => d.region === selectedRegion)
    .transition(t)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.region === selectedRegion ? 7 : 4);

    g.selectAll(".hit-target")
      .data(positions, d => d.region)
      .transition(t)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });
  console.log("strong count", strong.length, "selectedRegion", selectedRegion);

  const arc = d3.select("#highlight-arc");
  if (strong.length) {
    const firstMetric = strong[0];
    const lastMetric = strong[strong.length - 1];
    
    const startAngle = scales.angle(firstMetric);
    const endAngle = scales.angle(lastMetric) + scales.angle.bandwidth();
    
    arc.attr("d", arcs.highlight({ startAngle: startAngle, endAngle: endAngle }))
       .style("visibility", "visible");
  } else {
    arc.style("visibility", "hidden");
  }
}

function showTooltip(event, d) {
  const metric = d3.select(this.parentNode).attr("data-metric");
  
  let val = d.raw;
  let valStr = "N/A";
  if (typeof val === 'number') {
    valStr = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  const PERCENTAGE_METRICS = ["Electricity access", "Education spending", "Extreme poverty"];
  if (PERCENTAGE_METRICS.includes(metric) && valStr !== "N/A") {
    valStr += "%";
  }

  tooltipDiv
    .style("opacity", 1)
    .style("left", `${event.pageX + 16}px`)
    .style("top", `${event.pageY + 16}px`)
    .html(`
      <div class="tooltip-value">${valStr}</div>
      <div class="tooltip-divider"></div>
      <div class="tooltip-row"><span class="tooltip-label">METRIC :</span> <span>${metric}</span></div>
      <div class="tooltip-row"><span class="tooltip-label">REGION :</span> <span>${d.region}</span></div>
    `);
}

function moveTooltip(event) {
  tooltipDiv
    .style("left", `${event.pageX + 16}px`)
    .style("top", `${event.pageY + 16}px`);
}

function hideTooltip() {
  tooltipDiv.style("opacity", 0);
}

// Helpers
const cssSafe = str => str.replace(/\s+/g, "-").replace(/&/g, "and");
const getRotation = d => (scales.angle(d) + scales.angle.bandwidth() / 2 - Math.PI / 2) * 180 / Math.PI;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("viz-container");
  container.innerHTML = '<p style="text-align:center;padding:50px;">Loading data...</p>';
  
  loadData()
    .then(() => {
      container.innerHTML = '';
      initRadialChart();

      window.dataReady = true;
    });
});