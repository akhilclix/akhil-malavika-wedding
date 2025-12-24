// countdown.js — countdown + gallery loader + reveal scroll + lightbox
(function(){
  // --- Countdown ---
  function initCountdown(){
    const el = document.getElementById('countdown');
    if(!el) return;
    const targetISO = el.dataset.target;
    const target = new Date(targetISO).getTime();
    if(isNaN(target)) return;

    function render(){
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000*60*60*24));
      diff -= days * (1000*60*60*24);
      const hours = Math.floor(diff / (1000*60*60));
      diff -= hours * (1000*60*60);
      const mins = Math.floor(diff / (1000*60));
      diff -= mins * (1000*60);
      const secs = Math.floor(diff / 1000);

      const parts = [
        {n:days, label:'Days'},
        {n:hours, label:'Hours'},
        {n:mins, label:'Minutes'},
        {n:secs, label:'Seconds'}
      ];

      el.innerHTML = parts.map(p => (
        `<div><div class="num" aria-hidden="true">${p.n}</div><div class="label">${p.label}</div></div>`
      )).join('');
    }
    render();
    setInterval(render,1000);
  }

  // --- Gallery loader ---
  function initGallery(){
    const g = document.getElementById('gallery');
    if(!g) return;
    const count = 6;
    for(let i=1;i<=count;i++){
      const img = document.createElement('img');
      img.src = `images/photo${i}.jpg`;
      img.alt = `Photo ${i}`;
      img.loading = 'lazy';
      img.onerror = ()=>{ img.style.display='none' };
      img.addEventListener('click', ()=> openLightbox(img.src));
      g.appendChild(img);
    }
  }

  // --- Lightbox ---
// helpers to lock/unlock background scroll (works well on iOS)
let _scrollY = 0;
function lockBodyScroll(){
  _scrollY = window.scrollY || document.documentElement.scrollTop;
  // Freeze position
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  // prevent touchmove propagation on document (important for iOS)
  document.addEventListener('touchmove', preventTouchMove, { passive: false });
}
function unlockBodyScroll(){
  document.removeEventListener('touchmove', preventTouchMove, { passive: false });
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  window.scrollTo(0, _scrollY);
}
function preventTouchMove(e){ e.preventDefault(); }
function openLightbox(src){
  // If a lightbox is already open, remove it first (clean up)
  const existing = document.querySelector('.lightbox-overlay');
  if(existing){
    existing.remove();
    unlockBodyScroll();
  }

  // create overlay (give it a class so we can find/remove it reliably)
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.76)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    cursor: 'zoom-out',
    touchAction: 'none',
    WebkitOverflowScrolling: 'auto'
  });

  // lock background scroll
  lockBodyScroll();

  // spinner while loading
  const spinner = document.createElement('div');
  spinner.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="25" cy="25" r="20" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="31.4 31.4" transform="rotate(-90 25 25)">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
  Object.assign(spinner.style, {
    position: 'absolute',
    zIndex: 100000,
    pointerEvents: 'none'
  });
  overlay.appendChild(spinner);

  // close button — APPENDED INTO overlay so removal is atomic
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close modal-close';
  closeBtn.type = 'button';
  closeBtn.innerHTML = '&#10005;'; // X
  Object.assign(closeBtn.style, {
    position: 'fixed', // still fixed so it stays at the corner
    top: '18px',
    right: '18px',
    fontSize: '30px',
    color: '#fff',
    background: 'transparent',
    border: 'none',
    borderRadius: '0px',
    padding: '6px 10px',
    cursor: 'pointer',
    zIndex: 100001,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none'
  });

  // Close handler — remove overlay (which includes the button) and unlock scroll
  closeBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
    unlockBodyScroll();
  });

  // image element
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  Object.assign(img.style, {
    maxWidth: '92%',
    maxHeight: '92%',
    borderRadius: '12px',
    boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
    userSelect: 'none',
    touchAction: 'none',
    WebkitUserDrag: 'none',
    WebkitTouchCallout: 'none',
  });

  img.addEventListener('load', ()=>{
    if(spinner.parentNode) spinner.parentNode.removeChild(spinner);
    // ensure close button remains on top
    closeBtn.style.zIndex = '100001';
  });

  img.addEventListener('error', ()=>{
    if(spinner.parentNode) spinner.parentNode.removeChild(spinner);
    const fail = document.createElement('div');
    fail.textContent = 'Failed to load image';
    Object.assign(fail.style, { color: '#fff', fontSize: '16px' });
    overlay.appendChild(fail);
  });

  // stop clicks on the image from closing the overlay
  img.addEventListener('click', (e)=> e.stopPropagation());
  closeBtn.addEventListener('touchstart', (e)=> e.stopPropagation(), { passive: true });

  // prevent touchmove from propagating to the background
  overlay.addEventListener('touchmove', (e)=> { e.stopPropagation(); }, { passive: false });

  // clicking the overlay (outside the image) closes it
  overlay.addEventListener('click', ()=>{
    if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
    unlockBodyScroll();
  });

  // put the image and close button into the overlay, then append overlay once
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}


  // --- Scroll reveal (simple) ---
  function initReveal(){
    const items = document.querySelectorAll('.reveal');
    const onScroll = () => {
      const windowBottom = window.innerHeight * 0.9;
      items.forEach(i => {
        const rect = i.getBoundingClientRect();
        if(rect.top <= windowBottom) i.classList.add('visible');
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
  }

  // Init all
  document.addEventListener('DOMContentLoaded', ()=>{
    initCountdown();
    initGallery();
    initReveal();
  });
})();

  document.addEventListener("DOMContentLoaded", () => {
    const brand = document.querySelector(".brand .initials");
    brand.style.cursor = "pointer"; // makes it look clickable
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });

  

  // Fade items into view using IntersectionObserver
(function () {
  const items = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // if you prefer one-time reveal, unobserve:
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(i => obs.observe(i));
  } else {
    // fallback: reveal all
    items.forEach(i => i.classList.add('in-view'));
  }
})();
