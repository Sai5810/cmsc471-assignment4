// interaction.js
// Person B: connect dropdown, implement hover effects, metric reordering,
// and tooltip behavior. Uses functions and global variables from layout.js & data.js.

document.addEventListener("DOMContentLoaded", () => {
  setupRegionDropdown();
  setupHoverInteractions();
});

/**
 * Populate the dropdown and wire change event to updateRadialChart().
 */
function setupRegionDropdown() {
  const select = document.getElementById("region-select");
  REGIONS.forEach(region => {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    select.appendChild(opt);
  });

  select.value = REGIONS[0];

  select.addEventListener("change", e => {
    const selected = e.target.value;
    // TODO (Person B): Reorder metrics so "strong" metrics appear consecutively.
    // You will probably need a function that:
    //  1. Gets strong metrics (getStrongMetrics(selectedRegion)).
    //  2. Places them together in currentMetricOrder.
    //  3. Re-draws axes & wedges based on new order.
    //
    // For now, just call update with existing order:
    updateRadialChart(selected);
  });
}

/**
 * Attach hover behaviors to metric wedges and region circles.
 */
function setupHoverInteractions() {
  const svgNode = d3.select("svg");
  if (svgNode.empty()) return;

  const tooltip = d3.select(".tooltip");

  // Hover over metric wedges (background gray)
  svgNode.selectAll(".metric-wedge")
    .on("mouseover", function (event, metric) {
      d3.select(this).classed("hovered", true);
    })
    .on("mouseout", function () {
      d3.select(this).classed("hovered", false);
    });

  // Hover over circles: show tooltip
  svgNode.selectAll(".region-circle")
    .on("mouseover", function (event, d) {
      const metric = d3.select(this.parentNode).attr("data-metric");
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>Metric:</strong> ${metric}<br/>
           <strong>Region:</strong> ${d.region}<br/>
           <strong>Value:</strong> ${d.value.toFixed(3)}`
        );
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY + 12) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // NOTE: after you rebind data or redraw circles (e.g., when reordering metrics),
  // you must call setupHoverInteractions() again to re-attach listeners.
}
