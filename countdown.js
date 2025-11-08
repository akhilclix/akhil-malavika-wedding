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
    const count = 8; // change if you have more/less
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
  function openLightbox(src){
    const overlay = document.createElement('div');
    overlay.style.position='fixed';
    overlay.style.inset='0';
    overlay.style.background='rgba(0,0,0,0.88)';
    overlay.style.display='flex';
    overlay.style.alignItems='center';
    overlay.style.justifyContent='center';
    overlay.style.zIndex=9999;
    overlay.style.cursor='zoom-out';

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '92%';
    img.style.maxHeight = '92%';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 30px 90px rgba(0,0,0,0.6)';
    overlay.appendChild(img);
    overlay.addEventListener('click', ()=> overlay.remove());
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
