// Uses global d3, topojson, and global `overdoseData` defined in scripts/overdoseData.js

// --- Guard: if data is missing, log clearly and bail to avoid breaking the page ---
if (typeof overdoseData === 'undefined') {
  console.error(
    'overdoseData is not defined. Make sure scripts/overdoseData.js is loaded BEFORE app.js and that it does NOT use `export`.'
  );
}

// ---------- STATE NAME HELPERS ----------
const stateNames = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};
function toFullName(codeOrName) {
  if (!codeOrName) return null;
  return codeOrName.length > 2 ? codeOrName : stateNames[codeOrName] || null;
}

// ---------- MAP ----------
(function initMap() {
  const mapSvg = d3.select('#map');
  const width = +mapSvg.attr('width');
  const height = +mapSvg.attr('height');

  // Build lookup: ratesByYear[year][stateFullName] = record
  const ratesByYear = {};
  if (Array.isArray(overdoseData)) {
    for (const d of overdoseData) {
      const y = String(d.YEAR ?? d.year);
      const stateFull = toFullName(d.STATE ?? d.state);
      if (!y || !stateFull) continue;
      if (!ratesByYear[y]) ratesByYear[y] = {};
      ratesByYear[y][stateFull] = {
        RATE: +d.RATE ?? null,
        DEATHS: d.DEATHS ?? null,
      };
    }
  }

  const maxRate = Array.isArray(overdoseData)
    ? d3.max(overdoseData, (d) => +d.RATE || 0)
    : 0;

  const color = d3
    .scaleSequential(d3.interpolateReds)
    .domain([0, maxRate || 90]);

  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
    .then((us) => {
      const states = topojson.feature(us, us.objects.states).features;
      const projection = d3
        .geoAlbersUsa()
        .fitSize([width, height], topojson.feature(us, us.objects.states));
      const path = d3.geoPath(projection);

      // Draw states once
      const statePaths = mapSvg
        .selectAll('path.state')
        .data(states)
        .join('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('stroke', '#666')
        .attr('stroke-width', 0.5);

      // Update fill by year
      function update(year) {
        const y = String(year);
        statePaths
          .attr('fill', (d) => {
            const rec = ratesByYear[y]?.[d.properties.name];
            return rec && isFinite(rec.RATE) ? color(rec.RATE) : '#eee';
          })
          .selectAll('title')
          .remove();

        statePaths.append('title').text((d) => {
          const rec = ratesByYear[y]?.[d.properties.name];
          return rec
            ? `${d.properties.name}\nRate: ${rec.RATE}\nDeaths: ${
                rec.DEATHS ?? 'N/A'
              }`
            : `${d.properties.name} — no data`;
        });
      }

      // Slider wiring
      const slider = document.getElementById('yearSlider');
      const label = document.getElementById('yearLabel');
      const startYear = slider ? slider.value : 1999;

      if (slider && label) {
        label.textContent = startYear;
        slider.addEventListener('input', (e) => {
          const yr = e.target.value;
          label.textContent = yr;
          update(yr);
        });
      }

      update(startYear);
    })
    .catch((err) => {
      console.error('Failed to load US map topojson:', err);
    });
})();

// ---------- NYC LINE CHART ----------
(function initNYCLine() {
  const data = [
    { year: 2001, deaths: 792, pct_change: null },
    { year: 2002, deaths: 723, pct_change: -8.71 },
    { year: 2003, deaths: 769, pct_change: 6.36 },
    { year: 2004, deaths: 722, pct_change: -6.11 },
    { year: 2005, deaths: 796, pct_change: 10.25 },
    { year: 2006, deaths: 838, pct_change: 5.28 },
    { year: 2007, deaths: 695, pct_change: -17.06 },
    { year: 2008, deaths: 618, pct_change: -11.08 },
    { year: 2009, deaths: 593, pct_change: -4.05 },
    { year: 2010, deaths: 541, pct_change: -8.77 },
    { year: 2011, deaths: 630, pct_change: 16.45 },
    { year: 2012, deaths: 730, pct_change: 15.87 },
    { year: 2013, deaths: 788, pct_change: 7.95 },
    { year: 2014, deaths: 800, pct_change: 1.52 },
    { year: 2015, deaths: 942, pct_change: 17.75 },
    { year: 2016, deaths: 1413, pct_change: 50.0 },
    { year: 2017, deaths: 1482, pct_change: 4.88 },
    { year: 2018, deaths: 1452, pct_change: -2.02 },
    { year: 2019, deaths: 1497, pct_change: 3.1 },
    { year: 2020, deaths: 2103, pct_change: 40.48 },
    { year: 2021, deaths: 2696, pct_change: 28.2 },
    { year: 2022, deaths: 3070, pct_change: 13.87 },
    { year: 2023, deaths: 3046, pct_change: -0.78 },
    { year: 2024, deaths: 2165, pct_change: -28.92 },
  ];

  const svg = d3.select('#linechart');
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, w]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.deaths)])
    .nice()
    .range([h, 0]);

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));

  g.append('g').call(d3.axisLeft(y));

  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr(
      'd',
      d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.deaths))
    );

  g.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.year))
    .attr('cy', (d) => y(d.deaths))
    .attr('r', 3)
    .attr('fill', 'red');
})();
