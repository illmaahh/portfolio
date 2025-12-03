// Certificate popup
function showCert(img) {
  document.getElementById('cert-img').src = img;
  document.getElementById('cert-popup').style.display = 'flex';
}
function closeCert() {
  document.getElementById('cert-popup').style.display = 'none';
}

// Smooth scroll on wheel
document.querySelector('.sections').addEventListener('wheel', function(e) {
  e.preventDefault();
  this.scrollBy({ top: e.deltaY, behavior: 'smooth' });
});

// Animate on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.opacity = 1;
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.fade-in, .slide-in').forEach(el => observer.observe(el));

// Update navigation dot on scroll
const sections = document.querySelectorAll('.page');
const dots = document.querySelectorAll('.nav-dots .dot');
const options = { threshold: 0.5 };
const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      dots.forEach(dot => dot.classList.remove('active'));
      const index = Array.from(sections).indexOf(entry.target);
      dots[index].classList.add('active');
    }
  });
}, options);
sections.forEach(sec => dotObserver.observe(sec));

// Dot click scroll
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    sections[i].scrollIntoView({ behavior: 'smooth' });
  });
});

// Contact modal
const contactBtn = document.getElementById('contact-btn');
const contactModal = document.getElementById('contact-modal');
const closeModal = document.getElementById('close-modal');

contactBtn.addEventListener('click', () => { contactModal.style.display = 'flex'; });
closeModal.addEventListener('click', () => { contactModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == contactModal) { contactModal.style.display = 'none'; } });
