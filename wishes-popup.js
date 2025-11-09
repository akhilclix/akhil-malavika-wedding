(function(){
  const openBtn = document.getElementById('openWishesBtn');
  const modal = document.getElementById('wishesModal');
  const closeBtn = document.getElementById('closeWishesBtn');
  const wishesGrid = document.getElementById('wishesGrid');
  const thankMsg = document.getElementById('thankMsg');
  const backdrop = document.getElementById('backdrop');
  const confCanvas = document.getElementById('confettiCanvas');
  const ctx = confCanvas.getContext('2d');

  // size canvas to modal content
  function resizeCanvas(){
    confCanvas.width = confCanvas.clientWidth * devicePixelRatio;
    confCanvas.height = confCanvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  // open/close modal
  openBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resizeCanvas();
  });
  function closeModal(){
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    thankMsg.hidden = true;
  }
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });

  // small burst element creation & animation
  function burstAt(x, y, parent){
    const b = document.createElement('div');
    b.className = 'burst';
    b.style.left = (x) + 'px';
    b.style.top = (y) + 'px';
    parent.appendChild(b);
    // force reflow then animate
    requestAnimationFrame(()=> b.classList.add('animate'));
    // remove after animation
    setTimeout(()=> b.remove(), 700);
  }

  // Confetti particle system
  class Particle {
    constructor(x,y){
      this.x = x; this.y = y;
      this.size = Math.random()*6 + 4;
      const angle = Math.random()*Math.PI*2;
      const speed = Math.random()*6 + 4;
      this.vx = Math.cos(angle)*speed;
      this.vy = Math.sin(angle)*speed - 2;
      this.color = Particle.randomColor();
      this.ttl = 80 + Math.random()*40;
      this.age = 0;
      this.rotate = Math.random()*360;
      this.spin = (Math.random()-0.5)*15;
    }
    static randomColor(){
      const palette = ['#FFD54A','#FFB74D','#FDD835','#FFD700','#FFE082','#FBC02D'];
      return palette[Math.floor(Math.random()*palette.length)];
    }
    update(){
      this.vy += 0.25; // gravity
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.99;
      this.vy *= 0.99;
      this.age++;
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotate * Math.PI/180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size*0.6);
      ctx.restore();
    }
    alive(){ return this.age < this.ttl; }
  }

  let particles = [];
  let running = false;

  function emitConfetti(cx, cy, count = 40){
    // create many particles
    for(let i=0;i<count;i++) particles.push(new Particle(cx, cy));
    if(!running) startLoop();
  }

  function startLoop(){
    running = true;
    function loop(){
      // clear
      ctx.clearRect(0,0, confCanvas.width, confCanvas.height);
      // update & draw (transform coordinates to CSS pixels)
      const scale = devicePixelRatio;
      // draw in CSS pixels (canvas already scaled)
      particles.forEach(p => p.update());
      particles = particles.filter(p => p.alive());
      particles.forEach(p => p.draw(ctx));
      if(particles.length) requestAnimationFrame(loop);
      else running = false;
    }
    requestAnimationFrame(loop);
  }

  // when user clicks a wish
  wishesGrid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.wish');
    if(!btn) return;
    // show burst at click position relative to modal-content
    const rect = btn.getBoundingClientRect();
    const modalRect = btn.closest('.modal-content').getBoundingClientRect();
    const clickX = (e.clientX - modalRect.left);
    const clickY = (e.clientY - modalRect.top);

    // popper burst
    burstAt(clickX, clickY, btn.closest('.modal-content'));

    // show thank you message
    thankMsg.hidden = false;
    // subtle animation restart
    thankMsg.style.animation = 'none';
    requestAnimationFrame(()=>{ thankMsg.style.animation = ''; });

    // emit confetti at that position (convert to CSS canvas coords)
    // compute canvas-space coords
    const canvasRect = confCanvas.getBoundingClientRect();
    const cx = (e.clientX - canvasRect.left) * (confCanvas.width / canvasRect.width) / devicePixelRatio;
    const cy = (e.clientY - canvasRect.top) * (confCanvas.height / canvasRect.height) / devicePixelRatio;

    // emit a burst
    emitConfetti(cx, cy, 60);

    // small visual feedback on the clicked button
    btn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.96)' },
      { transform: 'scale(1.02)' },
      { transform: 'scale(1)' }
    ], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' });

    // optional: disable button after click for a few seconds
    btn.disabled = true;
    setTimeout(()=> btn.disabled = false, 2000);
  });

  // ensure canvas is ready when modal opens (resize)
  const observer = new MutationObserver((m)=>{
    for(const mut of m) if(mut.attributeName === 'aria-hidden') resizeCanvas();
  });
  observer.observe(modal, { attributes: true });

  // fix for high DPI
  const devicePixelRatio = window.devicePixelRatio || 1;

})();