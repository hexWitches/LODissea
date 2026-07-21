// Initialize Lucide Icons
lucide.createIcons();

// Animation classes applied to elements
document.getElementById('hero-boat').classList.add('boat-bob');
document.getElementById('wave-boat').classList.add('wave-boat-anim');
document.querySelector('#map-boat-container div').classList.add('boat-bob');
// Use global boat instead
document.querySelector('#global-boat > div').classList.add('boat-bob');

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

// --- Navigation Scroll Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const startJourneyBtn = document.getElementById('start-journey-btn');
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener('click', () => {
      document.getElementById('introduction').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const introNextBtn = document.getElementById('intro-next-btn');
  if (introNextBtn) {
    introNextBtn.addEventListener('click', () => {
      document.getElementById('journey').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      document.getElementById('analysis-1a').scrollIntoView({ behavior: 'smooth' });
    });
  }
});

// --- Map Logic ---
const HIGHLIGHTED_COUNTRIES = ['Netherlands', 'Germany', 'Spain', 'Portugal', 'France', 'Italy'];
const KEEP_COUNTRIES = [
  'Netherlands', 'Germany', 'Spain', 'Portugal', 'France', 'Italy',
  'Belgium', 'Luxembourg', 'Switzerland', 'Andorra', 'Monaco', 'San Marino', 'Liechtenstein',
  'Austria'
];

const COUNTRY_COLORS = {
  'Italy': '#90be6d',
  'France': '#1f7f95',
  'Germany': '#feda15',
  'Netherlands': '#a180ad',
  'Portugal': '#f4a64e',
  'Spain': '#bb521f'
};

const projection = d3.geoConicConformal()
  .center([2, 45])
  .rotate([0, 0])
  .scale(1450)
  .translate([500, 300]);

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

      // Phase 2: Highlight countries sequentially
      setTimeout(() => {
        HIGHLIGHTED_COUNTRIES.forEach((name, i) => {
          setTimeout(() => {
            const countryPath = document.querySelector(`.country[data-name="${name}"]`);
            if (countryPath) {
              countryPath.classList.add('highlighted');
              if (COUNTRY_COLORS[name]) {
                countryPath.style.fill = COUNTRY_COLORS[name];
              }
            }
          }, i * 500);
        });
      }, 500);
    }
  });
}



// --- Analysis Scroll Animations ---
const progressSections = Array.from(document.querySelectorAll('.analysis-section, #conclusion'));
const totalSections = progressSections.length;
const globalProgress = document.getElementById('global-progress');

if (totalSections > 0) {
  // Progress bar visibility toggle
  ScrollTrigger.create({
    trigger: progressSections[0],
    start: "top 60%", 
    endTrigger: progressSections[totalSections - 1],
    end: "bottom center",
    onEnter: () => gsap.to(globalProgress, { opacity: 1, duration: 0.5 }),
    onLeave: () => gsap.to(globalProgress, { opacity: 0, duration: 0.5 }),
    onEnterBack: () => gsap.to(globalProgress, { opacity: 1, duration: 0.5 }),
    onLeaveBack: () => gsap.to(globalProgress, { opacity: 0, duration: 0.5 })
  });

  // Create stops dynamically based on number of sections
  progressSections.forEach((sec, index) => {
    const topPos = 10 + (80 / (totalSections - 1)) * index;

    // Create the visual stop (custom marker)
    const stopEl = document.createElement('div');
    stopEl.className = 'scroll-stop';
    stopEl.style.top = `${topPos}%`;
    stopEl.style.cursor = 'pointer'; // Make it clickable
    
    // Click to scroll
    stopEl.addEventListener('click', () => {
      sec.scrollIntoView({ behavior: 'smooth' });
    });
    
    if (sec.id === 'conclusion') {
      stopEl.innerHTML = '<i data-lucide="gem" width="24" height="24" stroke-width="3"></i>';
    } else {
      stopEl.innerHTML = '<i data-lucide="x" width="24" height="24" stroke-width="3"></i>';
    }
    
    globalProgress.appendChild(stopEl);

    // Cross completion logic
    ScrollTrigger.create({
      trigger: sec,
      start: "top 30%", // When section hits upper part of screen
      onEnter: () => stopEl.classList.add('completed'),
      onLeaveBack: () => stopEl.classList.remove('completed')
    });

    // Animate between stops
    if (index < totalSections - 1) {
      const nextSec = progressSections[index + 1];
      const nextTop = 10 + (80 / (totalSections - 1)) * (index + 1);

      // Animate Boat
      gsap.fromTo('#global-boat',
        { top: `${topPos}%` },
        {
          top: `${nextTop}%`,
          scrollTrigger: {
            trigger: sec,
            start: "top 20%",
            endTrigger: nextSec,
            end: "top 20%",
            scrub: true
          },
          ease: "none",
          immediateRender: false
        }
      );

      // Animate Active Line
      gsap.fromTo('#global-line-active',
        { height: `${Math.max(0, topPos - 10)}%` },
        {
          height: `${nextTop - 10}%`,
          scrollTrigger: {
            trigger: sec,
            start: "top 20%",
            endTrigger: nextSec,
            end: "top 20%",
            scrub: true
          },
          ease: "none",
          immediateRender: false
        }
      );
    }
  });

  // Re-initialize icons for the newly added anchors
  lucide.createIcons();
}

