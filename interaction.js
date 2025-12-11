// interaction.js
// Dropdown wiring

const elements = {
  select: null,
  measure: null
};

document.addEventListener("DOMContentLoaded", () => {
  elements.select = document.getElementById("region-select");
  elements.measure = document.getElementById("region-measure");
  
  setupRegionDropdown();
});

function setupRegionDropdown() {
  const { select } = elements;
  
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

function resizeRegionSelect() {
  const { select, measure } = elements;
  const text = select.options[select.selectedIndex].text;

  const { fontFamily, fontSize, fontWeight } = getComputedStyle(select);
  Object.assign(measure.style, { fontFamily, fontSize, fontWeight });

  measure.textContent = text;
  select.style.width = `${measure.offsetWidth + 45}px`; 
}