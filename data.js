// data.js
// Person A: load data, compute averages per region & metric, and expose
// a clean structure for layout.js and interaction.js.

// Example regions and metrics (placeholder; replace with real ones)
const REGIONS = [
  "Americas",
  "East Asia & Pacific",
  "Europe & Central Asia",
  "Middle East & North Africa",
  "South Asia",
  "Sub-Saharan Africa"
];

// Choose at least 10 metrics from your dataset
const METRICS = [
  "GDP per capita",
  "Infant mortality",
  "Electricity access",
  "Education index",
  "Life expectancy",
  "Health $ per capita",
  "CO2 emissions",
  "Internet access",
  "Rule of law",
  "Extreme poverty"
];

// This object is where **averaged, normalized values per region+metric**
// should live. The visualization will use this, not raw country rows.
// You can normalize to [0,1] for radial distance.
//
// Example structure:
//
// REGION_METRIC_VALUES = {
//   "Americas": {
//      "GDP per capita": 0.7,
//      "Infant mortality": 0.2,
//      ...
//   },
//   "East Asia & Pacific": { ... },
//   ...
// };
//
let REGION_METRIC_VALUES = {};

// TODO (Person A):
// 1. Load your CSV from Assignment 3 (via d3.csv in layout.js or here).
// 2. Compute average metric values per region.
// 3. Normalize each metric across regions to [0,1] if you want.
// 4. Populate REGION_METRIC_VALUES as described above.
//
// For now, put some fake values so the rest of the code runs.

REGION_METRIC_VALUES = {};
REGIONS.forEach(region => {
  REGION_METRIC_VALUES[region] = {};
  METRICS.forEach(metric => {
    REGION_METRIC_VALUES[region][metric] = Math.random(); // placeholder
  });
});

/**
 * Utility: get metric value for region.
 */
function getMetricValue(region, metric) {
  return REGION_METRIC_VALUES[region][metric];
}

/**
 * Utility: for a given metric, return an array of:
 * [{ region, value }, ...] sorted descending by "better" performance.
 * Person A should define "better" (e.g., higher is better, lower is better for some metrics).
 */
function getRegionRankingForMetric(metric) {
  // TODO (Person A): handle metrics where lower is better (e.g., mortality).
  const rows = REGIONS.map(r => ({
    region: r,
    value: getMetricValue(r, metric)
  }));
  return rows.sort((a, b) => d3.descending(a.value, b.value));
}
