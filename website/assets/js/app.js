// Initialize Lucide Icons
lucide.createIcons();

// Animation classes applied to elements
document.getElementById('hero-boat').classList.add('boat-bob');
document.getElementById('wave-boat').classList.add('wave-boat-anim');
document.querySelector('#map-boat-container div').classList.add('boat-bob');
document.querySelector('#left-boat').classList.add('boat-bob');
document.querySelector('#scroll-boat-inner').classList.add('boat-bob');

// --- GSAP Hero Animations ---
gsap.to('#hero-content', {
  opacity: 1,
  y: 0,
  duration: 1,
  ease: "power2.out",
  delay: 0.2
});

// --- Modal Logic ---
const modal = document.getElementById('about-modal');
const tabs = ['project', 'team', 'credit'];

window.openTab = (tabName) => {
  modal.classList.add('modal-active');
  switchTab(tabName);
};

window.closeModal = () => {
  modal.classList.remove('modal-active');
  // Reset tabs
  tabs.forEach(t => {
    document.getElementById(`tab-content-${t}`).classList.remove('tab-active');
    document.getElementById(`tab-btn-${t}`).classList.remove('tab-btn-active');
  });
};

window.switchTab = (tabName) => {
  tabs.forEach(t => {
    document.getElementById(`tab-content-${t}`).classList.remove('tab-active');
    document.getElementById(`tab-btn-${t}`).classList.remove('tab-btn-active');
  });
  document.getElementById(`tab-content-${tabName}`).classList.add('tab-active');
  document.getElementById(`tab-btn-${tabName}`).classList.add('tab-btn-active');
};

// --- Map Logic ---
const HIGHLIGHTED_COUNTRIES = ['Netherlands', 'Germany', 'Spain', 'Portugal', 'France', 'Italy'];
const KEEP_COUNTRIES = [
  'Netherlands', 'Germany', 'Spain', 'Portugal', 'France', 'Italy',
  'Belgium', 'Luxembourg', 'Switzerland', 'Andorra', 'Monaco', 'San Marino', 'Liechtenstein',
  'Austria', 'United Kingdom', 'Ireland', 'Denmark'
];

const projection = d3.geoConicConformal()
  .center([3, 47])
  .rotate([0, 0])
  .scale(1800)
  .translate([400, 300]);

const pathGenerator = d3.geoPath().projection(projection);
const nlCoords = projection([5.29, 52.13]) || [0, 0];

// Fetch and draw map
fetch('https://unpkg.com/world-atlas@2.0.2/countries-50m.json')
  .then(response => response.json())
  .then(topology => {
    const geo = topojson.feature(topology, topology.objects.countries);
    const svg = d3.select('#map-countries');
    
    geo.features.forEach((d) => {
      const name = d.properties?.name;
      if (!KEEP_COUNTRIES.includes(name)) return;
      
      svg.append("path")
        .attr("d", pathGenerator(d))
        .attr("class", "country")
        .attr("data-name", name);
    });

    setupMapAnimations();
  });

function setupMapAnimations() {
  ScrollTrigger.create({
    trigger: '#journey',
    start: "top 20%",
    once: true,
    onEnter: () => {
      // Remove map boat since we skip it
      const mapBoatContainer = document.getElementById('map-boat-container');
      if (mapBoatContainer) mapBoatContainer.style.display = 'none';

      // Phase 1: Boat falls directly to the left progress bar
      const leftBoatContainer = document.getElementById('left-boat-container');
      gsap.fromTo(leftBoatContainer, 
        { top: '-20%', left: '40px', opacity: 0 },
        { top: '50%', left: '40px', opacity: 1, duration: 1.5, ease: "power2.out" }
      );

      // Line grows down
      const leftLine = document.getElementById('left-line');
      gsap.fromTo(leftLine, 
        { top: '0%', height: '0%' },
        { height: '50%', duration: 1.5, delay: 0.5, ease: "power1.inOut" }
      );

      // Phase 2: Highlight countries sequentially
      setTimeout(() => {
        HIGHLIGHTED_COUNTRIES.forEach((name, i) => {
          setTimeout(() => {
            const countryPath = document.querySelector(`.country[data-name="${name}"]`);
            if (countryPath) countryPath.classList.add('highlighted');
          }, i * 500);
        });
      }, 500);

      // Phase 3: Show next button
      setTimeout(() => {
        const nextBtn = document.getElementById('next-btn');
        gsap.to(nextBtn, {
          opacity: 1,
          y: 0,
          duration: 1
        });
      }, 1000 + HIGHLIGHTED_COUNTRIES.length * 500);
    }
  });
}

// --- Analysis Chart ---
const ctx = document.getElementById('analysisChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['1500', '1600', '1700', '1800', '1900', '2000'],
    datasets: [{
      label: 'Artifacts',
      data: [400, 3000, 2000, 2780, 1890, 2390],
      borderColor: '#6D213C',
      borderWidth: 3,
      pointBackgroundColor: '#6D213C',
      pointRadius: 4,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#1A3A5F', font: { size: 12, family: 'Inter' } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(26, 58, 95, 0.2)', borderDash: [3, 3] },
        ticks: { color: '#1A3A5F', font: { size: 12, family: 'Inter' } },
        border: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FBF9F5',
        titleColor: '#1A1A1A',
        bodyColor: '#6D213C',
        borderColor: 'rgba(26, 58, 95, 0.1)',
        borderWidth: 1,
        padding: 10
      }
    }
  }
});

// --- Analysis Scroll Animations ---
gsap.to('#scroll-boat', {
  scrollTrigger: {
    trigger: '#analysis',
    start: "top top",
    end: "bottom bottom",
    scrub: true
  },
  y: "80vh",
  ease: "none"
});
