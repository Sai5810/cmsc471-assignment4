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
  "Education spending",
  "Human development",
  "Health $ per capita",
  "CO2 emissions",
  "Political stability",
  "Rule of law",
  "Extreme poverty"
];

const LOWER_IS_BETTER = [
  "Infant mortality",
  "CO2 emissions",
  "Extreme poverty"
];

const ISO_TO_REGION = {
  // Americas
  "ARG": "Americas", "BHS": "Americas", "BRB": "Americas", "BLZ": "Americas", 
  "BOL": "Americas", "BRA": "Americas", "CAN": "Americas", "CHL": "Americas",
  "COL": "Americas", "CRI": "Americas", "CUB": "Americas", "DOM": "Americas",
  "ECU": "Americas", "SLV": "Americas", "GTM": "Americas", "GUY": "Americas",
  "HTI": "Americas", "HND": "Americas", "JAM": "Americas", "MEX": "Americas",
  "NIC": "Americas", "PAN": "Americas", "PRY": "Americas", "PER": "Americas",
  "SUR": "Americas", "TTO": "Americas", "USA": "Americas", "URY": "Americas",
  "VEN": "Americas",
  
  // East Asia & Pacific
  "AUS": "East Asia & Pacific", "BRN": "East Asia & Pacific", "KHM": "East Asia & Pacific",
  "CHN": "East Asia & Pacific", "FJI": "East Asia & Pacific", "IDN": "East Asia & Pacific",
  "JPN": "East Asia & Pacific", "KOR": "East Asia & Pacific", "LAO": "East Asia & Pacific",
  "MYS": "East Asia & Pacific", "MNG": "East Asia & Pacific", "MMR": "East Asia & Pacific",
  "NZL": "East Asia & Pacific", "PNG": "East Asia & Pacific", "PHL": "East Asia & Pacific",
  "SGP": "East Asia & Pacific", "THA": "East Asia & Pacific", "TLS": "East Asia & Pacific",
  "VNM": "East Asia & Pacific", "TWN": "East Asia & Pacific",
  
  // Europe & Central Asia
  "ALB": "Europe & Central Asia", "ARM": "Europe & Central Asia", "AUT": "Europe & Central Asia",
  "AZE": "Europe & Central Asia", "BLR": "Europe & Central Asia", "BEL": "Europe & Central Asia",
  "BIH": "Europe & Central Asia", "BGR": "Europe & Central Asia", "HRV": "Europe & Central Asia",
  "CYP": "Europe & Central Asia", "CZE": "Europe & Central Asia", "DNK": "Europe & Central Asia",
  "EST": "Europe & Central Asia", "FIN": "Europe & Central Asia", "FRA": "Europe & Central Asia",
  "GEO": "Europe & Central Asia", "DEU": "Europe & Central Asia", "GRC": "Europe & Central Asia",
  "HUN": "Europe & Central Asia", "ISL": "Europe & Central Asia", "IRL": "Europe & Central Asia",
  "ITA": "Europe & Central Asia", "KAZ": "Europe & Central Asia", "XKX": "Europe & Central Asia",
  "KGZ": "Europe & Central Asia", "LVA": "Europe & Central Asia", "LTU": "Europe & Central Asia",
  "LUX": "Europe & Central Asia", "MKD": "Europe & Central Asia", "MDA": "Europe & Central Asia",
  "MNE": "Europe & Central Asia", "NLD": "Europe & Central Asia", "NOR": "Europe & Central Asia",
  "POL": "Europe & Central Asia", "PRT": "Europe & Central Asia", "ROU": "Europe & Central Asia",
  "RUS": "Europe & Central Asia", "SRB": "Europe & Central Asia", "SVK": "Europe & Central Asia",
  "SVN": "Europe & Central Asia", "ESP": "Europe & Central Asia", "SWE": "Europe & Central Asia",
  "CHE": "Europe & Central Asia", "TJK": "Europe & Central Asia", "TUR": "Europe & Central Asia",
  "TKM": "Europe & Central Asia", "UKR": "Europe & Central Asia", "GBR": "Europe & Central Asia",
  "UZB": "Europe & Central Asia",
  
  // Middle East & North Africa
  "DZA": "Middle East & North Africa", "BHR": "Middle East & North Africa", "EGY": "Middle East & North Africa", 
  "IRN": "Middle East & North Africa", "IRQ": "Middle East & North Africa", "ISR": "Middle East & North Africa",
  "JOR": "Middle East & North Africa", "KWT": "Middle East & North Africa", "LBN": "Middle East & North Africa", 
  "LBY": "Middle East & North Africa", "MAR": "Middle East & North Africa", "OMN": "Middle East & North Africa",
  "QAT": "Middle East & North Africa", "SAU": "Middle East & North Africa", "SYR": "Middle East & North Africa", 
  "TUN": "Middle East & North Africa", "ARE": "Middle East & North Africa", "YEM": "Middle East & North Africa",
  "PSE": "Middle East & North Africa",
  
  // South Asia
  "AFG": "South Asia", "BGD": "South Asia", "BTN": "South Asia",
  "IND": "South Asia", "MDV": "South Asia", "NPL": "South Asia",
  "PAK": "South Asia", "LKA": "South Asia",
  
  // Sub-Saharan Africa
  "AGO": "Sub-Saharan Africa", "BEN": "Sub-Saharan Africa", "BWA": "Sub-Saharan Africa",
  "BFA": "Sub-Saharan Africa", "BDI": "Sub-Saharan Africa", "CPV": "Sub-Saharan Africa",
  "CMR": "Sub-Saharan Africa", "CAF": "Sub-Saharan Africa", "TCD": "Sub-Saharan Africa",
  "COM": "Sub-Saharan Africa", "COD": "Sub-Saharan Africa", "COG": "Sub-Saharan Africa",
  "CIV": "Sub-Saharan Africa", "DJI": "Sub-Saharan Africa", "GNQ": "Sub-Saharan Africa",
  "ERI": "Sub-Saharan Africa", "SWZ": "Sub-Saharan Africa", "ETH": "Sub-Saharan Africa",
  "GAB": "Sub-Saharan Africa", "GMB": "Sub-Saharan Africa", "GHA": "Sub-Saharan Africa",
  "GIN": "Sub-Saharan Africa", "GNB": "Sub-Saharan Africa", "KEN": "Sub-Saharan Africa",
  "LSO": "Sub-Saharan Africa", "LBR": "Sub-Saharan Africa", "MDG": "Sub-Saharan Africa",
  "MWI": "Sub-Saharan Africa", "MLI": "Sub-Saharan Africa", "MRT": "Sub-Saharan Africa",
  "MUS": "Sub-Saharan Africa", "MOZ": "Sub-Saharan Africa", "NAM": "Sub-Saharan Africa",
  "NER": "Sub-Saharan Africa", "NGA": "Sub-Saharan Africa", "RWA": "Sub-Saharan Africa",
  "STP": "Sub-Saharan Africa", "SEN": "Sub-Saharan Africa", "SYC": "Sub-Saharan Africa",
  "SLE": "Sub-Saharan Africa", "SOM": "Sub-Saharan Africa", "ZAF": "Sub-Saharan Africa",
  "SSD": "Sub-Saharan Africa", "SDN": "Sub-Saharan Africa", "TZA": "Sub-Saharan Africa",
  "TGO": "Sub-Saharan Africa", "UGA": "Sub-Saharan Africa", "ZMB": "Sub-Saharan Africa",
  "ZWE": "Sub-Saharan Africa"
};

// This object is where averaged, normalized values per region+metric
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
let REGION_METRIC_RAW = {};

// TODO (Person A):
// 1. Load your CSV from Assignment 3 (via d3.csv in layout.js or here).
// 2. Compute average metric values per region.
// 3. Normalize each metric across regions to [0,1] if you want.
// 4. Populate REGION_METRIC_VALUES as described above.
//
// For now, put some fake values so the rest of the code runs.


function parseValue(val) {
  if (val === null || val === undefined || val === "-" || val === "" || val === "..." || val === ",") {
    return null;
  }
  const cleaned = String(val).replace(/,/g, "").replace(/"/g, "").replace(/%/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}


function loadData() {
  return d3.csv('assignment 3 & 4 dataset - assignment 3 and 4.csv', d => {
    const row = Object.values(d);
    const isoCode = row[1];
    
    if (!isoCode || isoCode.length !== 3) return null;
    
    const region = ISO_TO_REGION[isoCode];
    if (!region) return null;
    
    return {
      country: row[0],
      iso: isoCode,
      region: region,
      gdpPerCapita:       parseValue(row[21]) || parseValue(row[20]) || parseValue(row[19]) || parseValue(row[18]),
      infantMortality:    parseValue(row[37]),
      electricityAccess:  parseValue(row[51]),
      educationSpending:  parseValue(row[44]) || parseValue(row[43]),
      hdi:                parseValue(row[9]) || parseValue(row[8]),
      healthPerCapita:    parseValue(row[36]) || parseValue(row[35]) || parseValue(row[34]),
      co2Emissions:       parseValue(row[77]),
      politicalStability: parseValue(row[58]) || parseValue(row[57]),
      ruleOfLaw:          parseValue(row[64]) || parseValue(row[63]),
      extremePoverty:     parseValue(row[50])
    };
  })
  .then(data => {
    const countries = data.filter(d => d !== null);
    console.log('Loaded countries:', countries.length);
    
    const grouped = d3.group(countries, d => d.region);
    
    const rawAverages = {};
    REGIONS.forEach(region => {
      const regionData = grouped.get(region) || [];
      console.log(`${region}: ${regionData.length} countries`);

      console.log(`  GDP valid values: ${regionData.filter(d => d.gdpPerCapita != null).length}`);
      console.log(`  Infant mort valid: ${regionData.filter(d => d.infantMortality != null).length}`);
      console.log(`  Education valid: ${regionData.filter(d => d.educationSpending != null).length}`);
      rawAverages[region] = {
        "GDP per capita":      d3.mean(regionData, d => d.gdpPerCapita),
        "Infant mortality":    d3.mean(regionData, d => d.infantMortality),
        "Electricity access":  d3.mean(regionData, d => d.electricityAccess),
        "Education spending":  d3.mean(regionData, d => d.educationSpending),
        "Human development":   d3.mean(regionData, d => d.hdi),
        "Health $ per capita": d3.mean(regionData, d => d.healthPerCapita),
        "CO2 emissions":       d3.mean(regionData, d => d.co2Emissions),
        "Political stability": d3.mean(regionData, d => d.politicalStability),
        "Rule of law":         d3.mean(regionData, d => d.ruleOfLaw),
        "Extreme poverty":     d3.mean(regionData, d => d.extremePoverty)
      };
    });
    
    REGION_METRIC_RAW = rawAverages;
    
    REGIONS.forEach(region => REGION_METRIC_VALUES[region] = {});
    
    METRICS.forEach(metric => {
      const values = REGIONS.map(r => rawAverages[r][metric]).filter(v => v !== undefined);
      const [min, max] = d3.extent(values);
      
      const scale = d3.scaleLinear()
                    .domain([min, max])
                    .range([0, 1]);
      
      REGIONS.forEach(region => {
        const rawVal = rawAverages[region][metric];
      
        let normalized = (min === max) ? 0.5 : scale(rawVal);
          
        if (LOWER_IS_BETTER.includes(metric)) {
          normalized = 1 - normalized;
        }
          
          REGION_METRIC_VALUES[region][metric] = 0.1 + normalized * 0.85;
        });
    });
    
    console.log('Raw averages:', REGION_METRIC_RAW);
    console.log('Normalized values:', REGION_METRIC_VALUES);
    
    return countries;
  })
  .catch(error => {
    console.error('Error loading data:', error);

    // Fallback to placeholder data
    REGIONS.forEach(region => {
      REGION_METRIC_VALUES[region] = {};
      REGION_METRIC_RAW[region] = {};
      METRICS.forEach(metric => {
        REGION_METRIC_VALUES[region][metric] = Math.random() * 0.85 + 0.1;
        REGION_METRIC_RAW[region][metric] = Math.random() * 100;
      });
    });
  });
}

/**
 * Utility: get metric value for region.
 */
function getMetricValue(region, metric) {
  return REGION_METRIC_VALUES[region][metric];
}

function getRawMetricValue(region, metric) {
  return REGION_METRIC_RAW[region][metric];
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
    value: getMetricValue(r, metric),
    raw: getRawMetricValue(r, metric)
  })).filter(d => d.value !== null);

  console.log(metric);
  console.log(rows);

  return rows.sort((a, b) => d3.descending(a.value, b.value));
}
