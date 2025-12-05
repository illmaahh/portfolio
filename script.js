/* script.js
   Full-page snap scrolling (wheel / touch), GSAP animations, typing effect,
   project modal, certificate modal, nav highlighting, small parallax motion.
*/

/* == Helpers == */
const select = s => document.querySelector(s);
const selectAll = s => Array.from(document.querySelectorAll(s));

/* Variables */
const sections = selectAll('.section');
const navBtns = selectAll('.nav-btn');
const fullpage = select('#fullpage');
let current = 0;
let isAnimating = false;
const total = sections.length;

/* Ensure focusable for keyboard nav */
sections.forEach(s => s.setAttribute('tabindex', '-1'));

/* Set initial active nav */
function setActiveNav(index) {
  navBtns.forEach(b => b.removeAttribute('aria-current'));
  const id = sections[index].id;
  const btn = navBtns.find(n => n.dataset.target === id);
  if (btn) btn.setAttribute('aria-current', 'true');
}

/* Scroll to a section with GSAP for smooth swipe effect */
function goToSection(index) {
  if (isAnimating) return;
  if (index < 0) index = 0;
  if (index >= total) index = total - 1;
  isAnimating = true;
  current = index;
  const el = sections[index];
  gsap.to(window, {duration: 0.9, ease: "power2.inOut", scrollTo: {y: el, offsetY: 0}});
  setActiveNav(index);
  // after animation
  setTimeout(() => {
    isAnimating = false;
    el.focus({preventScroll: true});
  }, 1000);
}

/* Mouse wheel / trackpad handler for snapping */
let wheelTimeout;
window.addEventListener('wheel', (e) => {
  if (isAnimating) return;
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => { /* do nothing, debounced */ }, 50);
  const delta = e.deltaY;
  if (delta > 30) {
    goToSection(Math.min(current + 1, total - 1));
  } else if (delta < -30) {
    goToSection(Math.max(current - 1, 0));
  }
}, {passive: true});

/* Keyboard navigation */
window.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goToSection(Math.min(current + 1, total - 1));
  if (e.key === 'ArrowUp' || e.key === 'PageUp') goToSection(Math.max(current - 1, 0));
  if (e.key === 'Home') goToSection(0);
  if (e.key === 'End') goToSection(total - 1);
});

/* Touch navigation - swipe up/down */
let touchStartY = null;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
}, {passive: true});
window.addEventListener('touchend', (e) => {
  if (!touchStartY) return;
  const dy = touchStartY - e.changedTouches[0].screenY;
  if (Math.abs(dy) > 40) {
    if (dy > 0) goToSection(Math.min(current + 1, total - 1));
    else goToSection(Math.max(current - 1, 0));
  }
  touchStartY = null;
}, {passive: true});

/* Nav button clicks */
navBtns.forEach((btn, i) => {
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    const target = btn.dataset.target;
    const index = sections.findIndex(s => s.id === target);
    if (index !== -1) goToSection(index);
  });
});

/* Buttons with data-scroll-to */
selectAll('[data-scroll-to]').forEach(b => {
  b.addEventListener('click', (ev) => {
    const id = b.dataset.scrollTo;
    const index = sections.findIndex(s => s.id === id);
    if (index !== -1) goToSection(index);
  });
});

/* Highlight animation for nav based on scroll position (fallback) */
window.addEventListener('scroll', () => {
  // determine current by viewport center
  const midpoint = window.scrollY + (window.innerHeight / 2);
  sections.forEach((sec, idx) => {
    const rect = sec.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = top + rect.height;
    if (midpoint >= top && midpoint < bottom) {
      current = idx;
      setActiveNav(idx);
    }
  });
});

/* == GSAP Entry Animations == */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Reveal sections on scroll for users who do not snap (also adds final animation when arriving)
sections.forEach((sec) => {
  const inner = sec.querySelector('.section-inner') || sec.querySelector('.container');
  gsap.fromTo(inner, {opacity:0, y:30}, {
    opacity:1, y:0, duration:0.9, ease:'power3.out',
    scrollTrigger: {
      trigger: sec,
      start: 'top 70%',
      once: true
    }
  });
});

/* subtle parallax reactive movement for layers */
const l1 = document.querySelector('.layer-1');
const l2 = document.querySelector('.layer-2');
const l3 = document.querySelector('.layer-3');
window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  if (l1) gsap.to(l1, {x: nx * 12, y: ny * 12, duration: 0.9, ease: 'power3.out'});
  if (l2) gsap.to(l2, {x: nx * -8, y: ny * -8, duration: 0.9, ease: 'power3.out'});
  if (l3) gsap.to(l3, {x: nx * 5, y: ny * 5, duration: 0.9, ease: 'power3.out'});
});

/* hero visual hover tilt (small) */
const hv = document.querySelector('.vr-card');
if (hv) {
  hv.addEventListener('mousemove', (e) => {
    const rect = hv.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width - 0.5;
    const ry = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(hv.querySelector('.vr-svg'), {rotationY: rx * 10, rotationX: ry * -6, transformPerspective:600, duration:0.6, ease:'power3.out'});
  });
  hv.addEventListener('mouseleave', () => gsap.to(hv.querySelector('.vr-svg'), {rotationY:0, rotationX:0, duration:0.6}));
}

/* == Typing effect for subtitle (animation 3) == */
const typingTarget = select('.typing-subtitle');
const typingPhrases = [
    'B.Tech Computer Science Student · Exploring Internships, Research & Innovation',
  'Learning AI, HCI & real-world problem solving',
  'Exploring research, projects & new opportunities'
];
let tpIndex = 0;
let charIndex = 0;
let typingDelay = 40;
let pauseDelay = 1200;

function typeLoop() {
  const phrase = typingPhrases[tpIndex];
  if (charIndex <= phrase.length) {
    typingTarget.textContent = phrase.slice(0, charIndex);
    charIndex++;
    setTimeout(typeLoop, typingDelay);
  } else {
    setTimeout(() => {
      // delete
      const delInterval = setInterval(() => {
        if (charIndex >= 0) {
          typingTarget.textContent = phrase.slice(0, charIndex);
          charIndex--;
        } else {
          clearInterval(delInterval);
          tpIndex = (tpIndex + 1) % typingPhrases.length;
          setTimeout(typeLoop, 240);
        }
      }, 25);
    }, pauseDelay);
  }
}
setTimeout(typeLoop, 600);
const eyebrowElement = document.querySelector(".typing-eyebrow");

function typeEyebrowText(text, callback) {
  let i = 0;
  eyebrowElement.textContent = "";
  const interval = setInterval(() => {
    eyebrowElement.textContent += text.charAt(i);
    i++;
    if (i === text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 40);
}

// Start eyebrow animation first
typeEyebrowText(typingLines[0], () => {
  // then start the subtitle animation
  startTyping();
});


/* == Project modal logic == */
function openProject(key) {
  const modal = select('#project-modal');
  const content = select('#project-content');
  let html = '';
  if (key === 'eldervr') {
    html = `
      <h2 id="project-title">ElderVR — Adaptive Healthcare Dashboard</h2>
      <p>VR-inspired adaptive healthcare system with simplified UI, medicine reminders, and stress-relief modules. Focused on accessibility and low cognitive effort for elderly users.</p>
      <p><strong>Tools:</strong> Python, Streamlit, Pandas, Matplotlib</p>
      <p><a href="https://github.com/illmaahh/ElderVR" target="_blank" rel="noopener">Repository</a></p>
    `;
  } else if (key === 'ddap') {
    html = `
      <h2 id="project-title">DDAP Web App (Python, Streamlit)</h2>
      <p>Engineered a sentiment analysis platform to uncover behavioural patterns of digital addiction using social media data. Includes dashboards, topic clustering and user-behaviour timelines.</p>
      <p><strong>Tools:</strong> Python, Streamlit, NLP stack</p>
      <p><a href="https://github.com/illmaahh" target="_blank" rel="noopener">GitHub</a></p>
    `;
  } else if (key === 'whatsapp') {
    html = `
      <h2 id="project-title">WhatsApp Usability Research</h2>
      <p>Structured usability testing investigating accessibility friction points and recommending redesigns to improve discoverability for elderly users.</p>
      <p><a href="https://github.com/illmaahh/ElderVR" target="_blank" rel="noopener">Read the study materials</a></p>
    `;
  } else {
    html = `<h2>Project</h2><p>Details will be added soon.</p>`;
  }
  content.innerHTML = html;
  modal.style.display = 'flex';
  gsap.fromTo('.project-modal-inner', {y:40, opacity:0}, {y:0, opacity:1, duration:0.45, ease:'power3.out'});
  modal.setAttribute('aria-hidden', 'false');
}
function closeProject(){
  const modal = select('#project-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  select('#project-content').innerHTML = '';
}

/* Project card click handlers */
selectAll('.project.card').forEach(card => {
  card.addEventListener('click', (e) => {
    const key = card.dataset.key || null;
    const link = card.dataset.link || null;
    if (key) openProject(key);
    else if (link) window.open(link, '_blank');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') card.click();
  });
});

/* == Certifications modal == */
function showCert(src) {
  const m = select('#cert-modal');
  const img = select('#cert-img');
  img.src = src;
  m.style.display = 'flex';
  gsap.fromTo(img, {scale:0.9, opacity:0}, {scale:1, opacity:1, duration:0.45, ease:'power3.out'});
  m.setAttribute('aria-hidden','false');
}
function closeCert() {
  const m = select('#cert-modal');
  m.style.display = 'none';
  select('#cert-img').src = '';
  m.setAttribute('aria-hidden','true');
}

/* Close modals with Esc */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeCert(); closeProject(); }
});

/* Clicking outside project modal content closes */
select('#project-modal').addEventListener('click', (e) => {
  if (e.target.classList.contains('project-modal')) closeProject();
});

/* Initialize - set active nav and start on top */
setTimeout(() => {
  goToSection(0);
  setActiveNav(0);
}, 80);

/* Accessibility: focus visible section when clicking nav */
navBtns.forEach((btn) => {
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
});
