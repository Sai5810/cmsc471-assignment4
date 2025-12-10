// interaction.js
// Dropdown wiring, hover behavior, and tooltip

const elements = {
  select: null,
  measure: null,
  tooltip: null
};

document.addEventListener("DOMContentLoaded", () => {
  elements.select = document.getElementById("region-select");
  elements.measure = document.getElementById("region-measure");
  elements.tooltip = d3.select(".tooltip");
  
  setupRegionDropdown();
  setupHoverInteractions();
});

function setupRegionDropdown() {
  const { select } = elements;
  
  // Populate dropdown
  select.append(...REGIONS.map(r => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = r;
    return opt;
  }));

  select.value = REGIONS[0];
  resizeRegionSelect();
  
  select.addEventListener("change", () => {
    updateRadialChart(select.value);
    resizeRegionSelect();
  });
}

function resizeRegionSelect() { // FIX THIS
  const { select, measure } = elements;
  const text = select.options[select.selectedIndex].text;

  // Copy font properties for accurate measurement
  const { fontFamily, fontSize, fontWeight } = getComputedStyle(select);
  Object.assign(measure.style, { fontFamily, fontSize, fontWeight });

  measure.textContent = text;
  select.style.width = `${measure.offsetWidth + 45}px`; // 40px for padding + arrow
}

function setupHoverInteractions() {
  const svg = d3.select("svg");
  if (svg.empty()) return;

  const { tooltip } = elements;

  // Wedge hover
  svg.selectAll(".metric-wedge")
    .on("mouseover", function() { d3.select(this).classed("hovered", true); })
    .on("mouseout", function() { d3.select(this).classed("hovered", false); });

  // Tooltip on hit targets
  svg.selectAll(".hit-target")
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip);
}

function showTooltip(event, d) {
  const metric = d3.select(this.parentNode).attr("data-metric");
  const pct = (d.value * 100).toFixed(1);

  elements.tooltip
    .style("opacity", 1)
    .html(`
      <div class="tooltip-value">${pct}%</div>
      <div class="tooltip-divider"></div>
      <div class="tooltip-row"><span class="tooltip-label">METRIC :</span> <span>${metric}</span></div>
      <div class="tooltip-row"><span class="tooltip-label">REGION :</span> <span>${d.region}</span></div>
    `);
}

function moveTooltip(event) {
  elements.tooltip
    .style("left", `${event.pageX + 16}px`)
    .style("top", `${event.pageY + 16}px`);
}

function hideTooltip() {
  elements.tooltip.style("opacity", 0);
}