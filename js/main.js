document.documentElement.classList.add('js');

(() => {
  const canvas = document.querySelector('[data-energy-particles]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let size = 0;
  let dpr = 1;
  let particles = [];

  const reset = () => {
    const rect = canvas.getBoundingClientRect();
    size = Math.max(1, Math.min(rect.width, rect.height));
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: 48 }, (_, index) => ({
      radius: size * (.12 + Math.random() * .32),
      angle: Math.random() * Math.PI * 2,
      speed: (.00008 + Math.random() * .00018) * (index % 2 ? 1 : -1),
      size: .45 + Math.random() * 1.15,
      alpha: .16 + Math.random() * .4,
      colour: index % 3 === 0 ? '205,144,255' : index % 3 === 1 ? '90,229,255' : '255,180,245'
    }));
  };

  const draw = time => {
    ctx.clearRect(0, 0, size, size);
    const centre = size / 2;
    particles.forEach((particle, index) => {
      const wobble = Math.sin(time * .00035 + index) * size * .012;
      const angle = particle.angle + time * particle.speed;
      const x = centre + Math.cos(angle) * (particle.radius + wobble);
      const y = centre + Math.sin(angle) * (particle.radius * .72 + wobble * .45);
      const twinkle = .72 + Math.sin(time * .0012 + index * 1.7) * .28;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${particle.colour},${particle.alpha * twinkle})`;
      ctx.shadowColor = `rgba(${particle.colour},.65)`;
      ctx.shadowBlur = 5;
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    if (!reduced) requestAnimationFrame(draw);
  };

  reset();
  draw(0);
  addEventListener('resize', reset, { passive: true });
})();

// Lightweight particle sphere for the hero category system.
(() => {
  const canvas = document.getElementById('categoryParticleBall');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const points = [];
  const total = innerWidth < 650 ? 560 : innerWidth < 1100 ? 1050 : 1650;
  const networkEvery = Math.max(34, Math.round(total / 26));
  for (let i = 0; i < total; i += 1) {
    const y = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - y * y);
    const shell = .84 + Math.pow(Math.random(), 2.4) * .2;
    points.push({
      x: Math.cos(theta) * ring * shell,
      y: y * shell,
      z: Math.sin(theta) * ring * shell,
      seed: Math.random() * Math.PI * 2,
      size: .45 + Math.random() * .9,
      network: i % networkEvery === 0
    });
  }
  const outerNodes = Array.from({length:innerWidth < 650 ? 9 : 16},(_,index)=>({
    angle:(index/ (innerWidth < 650 ? 9 : 16))*Math.PI*2 + (Math.random()-.5)*.18,
    radius:.36 + Math.random()*.07,
    drift:.7 + Math.random()*.8,
    seed:Math.random()*Math.PI*2
  }));
  let width = 0, height = 0, dpr = 1, rx = -.18, ry = .25, targetX = rx, targetY = ry, time = 0;
  let pointerCanvasX = -9999, pointerCanvasY = -9999, pointerEnergy = 0;
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(canvas); resize();
  const hero = canvas.closest('.hero');
  hero?.addEventListener('pointermove', event => {
    if (reduced) return;
    const rect = hero.getBoundingClientRect();
    const moduleRect = canvas.parentElement.getBoundingClientRect();
    const centreX = moduleRect.left + moduleRect.width / 2, centreY = moduleRect.top + moduleRect.height / 2;
    const dx = event.clientX - centreX, dy = event.clientY - centreY;
    const distance = Math.hypot(dx, dy), proximity = Math.max(0, 1 - distance / Math.max(moduleRect.width, moduleRect.height) * 1.35);
    const canvasRect = canvas.getBoundingClientRect();
    pointerCanvasX = event.clientX - canvasRect.left;
    pointerCanvasY = event.clientY - canvasRect.top;
    pointerEnergy = proximity;
    targetY = ((event.clientX - rect.left) / rect.width - .5) * (1.15 + proximity * .95);
    targetX = -((event.clientY - rect.top) / rect.height - .5) * (.72 + proximity * .7);
    canvas.style.setProperty('--ball-x', `${Math.max(-30,Math.min(30,dx * .055 * proximity))}px`);
    canvas.style.setProperty('--ball-y', `${Math.max(-24,Math.min(24,dy * .045 * proximity))}px`);
    canvas.style.filter = `saturate(${1.2 + proximity * .28}) contrast(${1.04 + proximity * .08}) drop-shadow(0 18px ${58 + proximity * 22}px rgba(110,114,211,${.24 + proximity * .13}))`;
  });
  hero?.addEventListener('pointerleave', () => { targetX = -.18; targetY = .25; pointerCanvasX = -9999; pointerCanvasY = -9999; pointerEnergy = 0; canvas.style.setProperty('--ball-x','0px'); canvas.style.setProperty('--ball-y','0px'); canvas.style.filter = ''; });
  const rotate = (point) => {
    const cosy = Math.cos(ry), siny = Math.sin(ry), cosx = Math.cos(rx), sinx = Math.sin(rx);
    const x1 = point.x * cosy - point.z * siny, z1 = point.x * siny + point.z * cosy;
    return {x:x1, y:point.y * cosx - z1 * sinx, z:point.y * sinx + z1 * cosx};
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    rx += (targetX - rx) * .065; ry += (targetY - ry) * .065;
    if (!reduced) { ry += .0035; time += .032; }
    const size = Math.min(width, height) * .405;
    const projected = points.map(point => {
      const p = rotate(point), pulse = 1 + Math.sin(time * 1.25 + point.seed + p.y * 5) * .034;
      const perspective = 1 / (1.5 - p.z * .3);
      return {...p, size:point.size, sx:width/2 + p.x * size * pulse * perspective, sy:height/2 + p.y * size * pulse * perspective, perspective};
    }).sort((a,b) => a.z - b.z);

    // A restrained polygonal network gives the sphere a systems-diagram feel
    // and visually connects it to the five portfolio category cards.
    const network = projected.filter(point => point.network).map(point => {
      const dx = point.sx - pointerCanvasX, dy = point.sy - pointerCanvasY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const influence = reduced ? 0 : Math.max(0, 1 - distance / 190) * (7 + pointerEnergy * 12);
      return {...point, nx:point.sx + dx / distance * influence, ny:point.sy + dy / distance * influence};
    });
    const outerNetwork = outerNodes.map(node => {
      const slowTime = reduced ? 0 : time * .055 * node.drift;
      const radius = Math.min(width,height) * node.radius;
      const baseX = width/2 + Math.cos(node.angle + slowTime) * radius;
      const baseY = height/2 + Math.sin(node.angle + slowTime) * radius * .82;
      const dx = baseX-pointerCanvasX,dy=baseY-pointerCanvasY,distance=Math.max(1,Math.hypot(dx,dy));
      const influence = reduced ? 0 : Math.max(0,1-distance/230)*(10+pointerEnergy*15);
      return {nx:baseX+dx/distance*influence,ny:baseY+dy/distance*influence,z:-.1,outer:true,seed:node.seed};
    });
    const polygonNodes = [...network,...outerNetwork];
    ctx.lineWidth = .72;
    for (let i = 0; i < polygonNodes.length; i += 1) {
      for (let j = i + 1; j < polygonNodes.length; j += 1) {
        const a = polygonNodes[i], b = polygonNodes[j], distance = Math.hypot(a.nx - b.nx, a.ny - b.ny);
        const reach = size * ((a.outer || b.outer) ? .5 : .46);
        if (distance > reach) continue;
        const cursorDistance = Math.min(Math.hypot(a.nx-pointerCanvasX,a.ny-pointerCanvasY),Math.hypot(b.nx-pointerCanvasX,b.ny-pointerCanvasY));
        const cursorBoost = reduced ? 0 : Math.max(0,1-cursorDistance/220) * .16;
        ctx.beginPath(); ctx.moveTo(a.nx,a.ny); ctx.lineTo(b.nx,b.ny);
        ctx.strokeStyle = `rgba(116,124,136,${Math.max(0,1-distance/reach)*.19 + cursorBoost*.72})`;
        ctx.stroke();
      }
    }
    const canvasRect = canvas.getBoundingClientRect();
    const cards = [...canvas.parentElement.querySelectorAll(':scope > a')];
    cards.forEach((card, index) => {
      if (!polygonNodes.length) return;
      const rect = card.getBoundingClientRect();
      const endX = rect.left - canvasRect.left + rect.width / 2;
      const endY = rect.top - canvasRect.top + rect.height / 2;
      const start = polygonNodes.reduce((closest,node) => Math.hypot(node.nx-endX,node.ny-endY) < Math.hypot(closest.nx-endX,closest.ny-endY) ? node : closest, polygonNodes[0]);
      const bendX = start.nx + (endX-start.nx) * .52;
      const bendY = start.ny + (endY-start.ny) * .52 + (index%2 ? 14 : -14);
      ctx.beginPath(); ctx.moveTo(start.nx,start.ny); ctx.lineTo(bendX,bendY); ctx.lineTo(endX,endY);
      ctx.strokeStyle = `rgba(112,120,132,${.12 + pointerEnergy*.045})`;
      ctx.stroke();
      for (let dot = 1; dot <= 3; dot += 1) {
        const t = dot / 4, x = start.nx + (endX-start.nx)*t, y = start.ny + (endY-start.ny)*t + Math.sin(t*Math.PI)*(index%2 ? 9 : -9);
        ctx.beginPath(); ctx.arc(x,y,1.25 + pointerEnergy*.3,0,Math.PI*2); ctx.fillStyle=`rgba(126,134,146,${.38 + pointerEnergy*.1})`; ctx.fill();
      }
    });
    polygonNodes.forEach(node => { ctx.beginPath(); ctx.arc(node.nx,node.ny,node.outer?1.5:1.25 + Math.max(0,node.z)*.7,0,Math.PI*2); ctx.fillStyle=node.outer?'rgba(128,136,148,.42)':'rgba(128,136,148,.5)'; ctx.fill(); });

    for (const p of projected) {
      const front = Math.max(.16, (p.z + 1) / 2);
      const hue = 218 + (p.y + 1) * 31 + p.x * 12;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.size * (.62 + front * .8) * p.perspective, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},94%,${56 + front * 20}%,${.14 + front * .72})`;
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,size*.85);
    glow.addColorStop(0,'rgba(122,167,255,.075)'); glow.addColorStop(.52,'rgba(187,124,255,.045)'); glow.addColorStop(1,'rgba(255,139,180,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
    if (!reduced) requestAnimationFrame(draw);
  };
  draw();
})();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const canvas = document.querySelector('#space');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let pointerX = innerWidth / 2;
  let pointerY = innerHeight / 2;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(150, Math.floor(width / 8)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * .9 + .1,
      size: Math.random() * 1.2 + .2,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const draw = (time = 0) => {
    ctx.clearRect(0, 0, width, height);
    const driftX = (pointerX / Math.max(1, width) - .5) * 20;
    const driftY = (pointerY / Math.max(1, height) - .5) * 14;
    stars.forEach(star => {
      const alpha = .12 + (Math.sin(time * .001 + star.phase) + 1) * .12;
      ctx.beginPath();
      ctx.fillStyle = `rgba(170,232,242,${alpha})`;
      ctx.arc((star.x + driftX * star.z + width) % width, (star.y + driftY * star.z + height) % height, star.size * star.z, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!reduced) requestAnimationFrame(draw);
  };

  resize();
  draw();
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => { pointerX = event.clientX; pointerY = event.clientY; }, { passive: true });
})();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const root = document.documentElement;
  const meter = document.querySelector('.scroll-meter span');
  const topbar = document.querySelector('.topbar');
  const aura = document.querySelector('.cursor-light');
  const hero = document.querySelector('.hero');
  const heroVideo = document.querySelector('.hero-background-video');
  const heroCopy = document.querySelector('.hero-copy');
  const heroVisual = document.querySelector('.hero-visual-depth');
  const projects = [...document.querySelectorAll('.project')];
  const reveals = [...document.querySelectorAll('.reveal')];
  let scrollFrame = 0;

  if (reduced) reveals.forEach(item => item.classList.add('visible'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(item => observer.observe(item));
  }

  const updateScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const ratio = Math.min(1, scrollY / max);
    meter.style.transform = `scaleX(${ratio})`;
    topbar.classList.toggle('is-scrolled', scrollY > 30);
    if (!reduced) {
      const heroProgress = Math.min(1, Math.max(0, scrollY / (innerHeight * .9)));
      hero.style.setProperty('--hero-scroll', heroProgress.toFixed(3));
      hero.style.setProperty('--hero-video-opacity', String(1 - heroProgress * .38));
      hero.style.setProperty('--hero-copy-opacity', String(1 - heroProgress * .72));
      hero.style.setProperty('--hero-module-opacity', String(1 - heroProgress * .58));
      hero.style.setProperty('--hero-shade-opacity', String(1 - heroProgress * .18));
      hero.style.setProperty('--hero-copy-y', `${heroProgress * 90}px`);
      hero.style.setProperty('--hero-copy-scale', String(1 - heroProgress * .045));
      hero.style.setProperty('--hero-module-y', `${heroProgress * 145}px`);
      hero.style.setProperty('--hero-module-scale', String(1 - heroProgress * .08));
      root.style.setProperty('--hero-band-lift', `${heroProgress * -18}px`);
      root.style.setProperty('--hero-shadow-opacity', String(heroProgress * .9));
      if (heroVideo) heroVideo.style.transform = `scale(${1 + heroProgress * .09}) translateY(${heroProgress * 2.5}%)`;

      projects.forEach((project, index) => {
        const rect = project.getBoundingClientRect();
        const centreOffset = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
        const shift = Math.max(-1, Math.min(1, centreOffset));
        project.style.setProperty('--scroll-shift', `${shift * 54 + index * .6}px`);
        project.style.setProperty('--copy-shift', `${shift * -22}px`);
        project.style.setProperty('--scroll-glow', String(Math.max(0, 1 - Math.abs(centreOffset)) * .22));
      });
    }
    scrollFrame = 0;
  };
  updateScroll();
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, { passive: true });

  if (!reduced && finePointer) {
    addEventListener('pointermove', event => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      root.style.setProperty('--hero-x', `${x * -16}px`);
      root.style.setProperty('--hero-y', `${y * -12}px`);
      root.style.setProperty('--reactor-x', `${x * 36}px`);
      root.style.setProperty('--reactor-y', `${y * 28}px`);
      root.style.setProperty('--reactor-rx', `${y * -6}deg`);
      root.style.setProperty('--reactor-ry', `${x * 8}deg`);
      aura.style.transform = `translate(${event.clientX - 260}px,${event.clientY - 260}px)`;
    }, { passive: true });

    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--rx', `${y * -2.4}deg`);
        card.style.setProperty('--ry', `${x * 3.2}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();

(() => {
  const modules = [...document.querySelectorAll('[data-module]')];
  const readout = document.querySelector('[data-readout]');
  const content = {
    web: ['WEB SYSTEMS', 'Landing pages, Shopify customisation, and responsive portfolio experiences.'],
    growth: ['GROWTH SUPPORT', 'Audience-focused pages, foundational SEO, campaign assets, and enquiry flows.'],
    content: ['CONTENT ENGINE', 'Short-form editing, AIGC production, visual storytelling, and social assets.'],
    product: ['PRODUCT PROTOTYPES', 'Internal tools and early concepts shaped around practical business workflows.']
  };
  const show = module => {
    const item = content[module.dataset.module];
    modules.forEach(button => button.classList.toggle('active', button === module));
    readout.querySelector('small').textContent = 'MODULE ACTIVE';
    readout.querySelector('strong').textContent = item[0];
    readout.querySelector('p').textContent = item[1];
  };
  modules.forEach(module => {
    module.addEventListener('mouseenter', () => show(module));
    module.addEventListener('focus', () => show(module));
    module.addEventListener('click', () => show(module));
  });
})();

(() => {
  const system = document.querySelector('[data-reels]');
  if (!system) return;
  const frame = system.querySelector('iframe');
  const buttons = [...system.querySelectorAll('[data-reel]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-current', item === button ? 'true' : 'false'));
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.reel}?rel=0`;
  }));
})();

(() => {
  const viewer = document.querySelector('[data-image-viewer]');
  if (!viewer) return;
  const viewerImage = viewer.querySelector('[data-viewer-image]');
  const viewerCaption = viewer.querySelector('[data-viewer-caption]');
  const closeButton = viewer.querySelector('[data-viewer-close]');
  const openViewer = preview => {
    viewerImage.src = preview.currentSrc || preview.src;
    viewerImage.alt = preview.alt || 'Project preview';
    viewerCaption.textContent = preview.alt || '';
    viewer.showModal();
  };
  document.querySelectorAll('.projects .project-screen img').forEach(preview => {
    preview.closest('.project-screen')?.classList.add('has-zoom');
    preview.tabIndex = 0;
    preview.setAttribute('role', 'button');
    preview.setAttribute('aria-label', `Enlarge ${preview.alt || 'project preview'}`);
    preview.addEventListener('click', () => openViewer(preview));
    preview.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(preview);
      }
    });
  });
  closeButton.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
})();

(() => {
  const modal = document.querySelector('[data-project-modal]');
  const content = modal?.querySelector('[data-project-modal-content]');
  const closeButton = modal?.querySelector('[data-project-modal-close]');
  const cards = [...document.querySelectorAll('.project-card')];
  if (!modal || !content || !closeButton || !cards.length) return;

  let returnTarget = null;

  const removeDuplicateIds = root => {
    root.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  };

  const activateReelControls = root => {
    const frame = root.querySelector('iframe');
    const buttons = [...root.querySelectorAll('[data-reel]')];
    if (!frame || !buttons.length) return;
    buttons.forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      buttons.forEach(item => item.setAttribute('aria-current', item === button ? 'true' : 'false'));
      frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.reel}?rel=0`;
    }));
  };

  const openProject = card => {
    returnTarget = card;
    content.replaceChildren();

    const screen = card.querySelector('.project-screen')?.cloneNode(true);
    const copy = card.querySelector('.project-copy')?.cloneNode(true);
    if (!screen || !copy) return;

    removeDuplicateIds(screen);
    removeDuplicateIds(copy);
    screen.querySelectorAll('[tabindex="-1"]').forEach(element => element.removeAttribute('tabindex'));
    copy.querySelector('.card-category')?.remove();

    const category = document.createElement('span');
    category.className = 'modal-category';
    category.textContent = card.dataset.category || 'PROJECT';
    copy.prepend(category);

    const title = copy.querySelector('h3');
    if (title) title.id = 'project-modal-title';

    content.append(screen, copy);
    activateReelControls(screen);
    modal.showModal();
    requestAnimationFrame(() => closeButton.focus());
  };

  cards.forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('img, iframe, button, a')) return;
      openProject(card);
    });
    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
        event.preventDefault();
        openProject(card);
      }
    });
  });

  closeButton.addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
  modal.addEventListener('close', () => {
    content.replaceChildren();
    returnTarget?.focus();
  });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]),a[href],iframe,[tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const demo = document.getElementById('tyosDemo');
  if (!demo) return;
  const screens = [...demo.querySelectorAll('[data-screen]')];
  const navButtons = [...demo.querySelectorAll('[data-nav]')];
  const cursor = document.getElementById('demoCursor');
  const ring = document.getElementById('cursorRing');
  const status = document.getElementById('demoStatus');
  const result = document.getElementById('demoResult');
  const caption = document.getElementById('requestCaption');
  const statusDot = document.getElementById('statusDot');
  const stepLines = [...document.querySelectorAll('.tyos-steps span')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playing = false;
  let paused = false;
  let runToken = 0;
  const flows = [
    { screen: 'products', title: 'Clearance Stock & Pricing', subtitle: 'Find product information without searching through separate files.', request: 'Request: “Can you find the product specs and price?”', result: 'Result · Product specs and pricing together' },
    { screen: 'guide', title: 'Focus Product', subtitle: 'Keep product guidance, questions, and notes close to the product categories.', request: 'Request: “What should I clarify for this setup?”', result: 'Result · A consistent starting point for selection' },
    { screen: 'incoming', title: 'Incoming Stock', subtitle: 'Follow purchase requests and the shipment details assigned to each item.', request: 'Request: “What is arriving, and when?”', result: 'Result · Status, dates, items, and ownership visible' }
  ];

  const setScreen = name => {
    screens.forEach(screen => screen.classList.toggle('active', screen.dataset.screen === name));
    navButtons.forEach(button => button.classList.toggle('active', button.dataset.nav === name));
    const flow = flows.find(item => item.screen === name);
    document.getElementById('screenTitle').textContent = flow.title;
    document.getElementById('screenSubtitle').textContent = flow.subtitle;
  };
  const resetScreen = name => {
    document.getElementById('searchText').textContent = 'Search SKU or product…';
    document.getElementById('specCard').classList.remove('open');
    document.getElementById('arrivalDetail').classList.remove('open');
    document.getElementById('progressFill').classList.remove('show');
    demo.querySelectorAll('.tyos-product-row,.tyos-arrival-card').forEach(item => item.classList.remove('selected'));
    setScreen(name);
  };
  const setFlow = index => {
    resetScreen(flows[index].screen);
    caption.textContent = flows[index].request;
    result.textContent = flows[index].result;
    stepLines.forEach((line, i) => line.classList.toggle('active', i === index));
    status.textContent = ['Product finder ready', 'Product guidance ready', 'Shipment tracking ready'][index];
    statusDot.classList.remove('live');
  };
  const positionCursor = target => {
    if (reducedMotion) return;
    const rect = target.getBoundingClientRect();
    const parent = demo.querySelector('.tyos-demo-content').getBoundingClientRect();
    const x = rect.left - parent.left + Math.min(rect.width * .58, rect.width - 10);
    const y = rect.top - parent.top + Math.min(rect.height * .55, rect.height - 8);
    cursor.style.transform = `translate(${Math.max(0, x)}px, ${Math.max(0, y)}px)`;
    cursor.classList.add('show');
  };
  const clickPulse = () => {
    if (reducedMotion) return;
    ring.style.transform = getComputedStyle(cursor).transform;
    ring.classList.remove('ping');
    void ring.offsetWidth;
    ring.classList.add('ping');
  };
  const wait = (ms, token) => new Promise((resolve, reject) => {
    let elapsed = 0;
    let last = performance.now();
    const tick = now => {
      if (token !== runToken || !playing) return reject(new Error('stopped'));
      if (!paused) elapsed += now - last;
      last = now;
      if (elapsed >= ms) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const moveClick = async (selector, token, action, waitAfter = 500) => {
    const target = demo.querySelector(selector);
    if (!target) return;
    positionCursor(target);
    await wait(reducedMotion ? 50 : 620, token);
    clickPulse();
    action();
    await wait(waitAfter, token);
  };
  const runAll = async () => {
    if (playing) { paused = false; return; }
    playing = true;
    paused = false;
    const token = ++runToken;
    document.getElementById('playBtn').textContent = '▶ Playing';
    document.getElementById('pauseBtn').textContent = 'Ⅱ Pause';
    statusDot.classList.add('live');
    try {
      resetScreen('products');
      caption.textContent = flows[0].request;
      result.textContent = 'Finding a product record…';
      stepLines.forEach((line, i) => line.classList.toggle('active', i === 0));
      status.textContent = 'Searching sample product information';
      await moveClick('[data-nav="products"]', token, () => setScreen('products'));
      await moveClick('#searchTarget', token, () => { document.getElementById('searchText').textContent = '4 door freezer'; });
      await moveClick('#productTarget', token, () => { document.getElementById('productTarget').classList.add('selected'); document.getElementById('specCard').classList.add('open'); });
      status.textContent = 'Product specifications and pricing are ready'; result.textContent = flows[0].result; stepLines[0].classList.add('done');
      await wait(350, token);

      caption.textContent = flows[1].request; result.textContent = 'Opening product guidance…'; status.textContent = 'Opening the product guide';
      stepLines.forEach((line, i) => line.classList.toggle('active', i === 1));
      await moveClick('[data-nav="guide"]', token, () => resetScreen('guide'));
      await moveClick('#guideTarget', token, () => document.getElementById('guideTarget').classList.add('active'));
      status.textContent = 'Selection questions and notes are visible'; result.textContent = flows[1].result; stepLines[1].classList.add('done');
      await wait(350, token);

      caption.textContent = flows[2].request; result.textContent = 'Checking sample incoming requests…'; status.textContent = 'Opening incoming stock';
      stepLines.forEach((line, i) => line.classList.toggle('active', i === 2));
      await moveClick('[data-nav="incoming"]', token, () => resetScreen('incoming'));
      await moveClick('#arrivalTarget', token, () => { document.getElementById('arrivalTarget').classList.add('selected'); document.getElementById('progressFill').classList.add('show'); document.getElementById('arrivalDetail').classList.add('open'); });
      status.textContent = 'Shipment dates, items, and owner are visible'; result.textContent = flows[2].result; stepLines[2].classList.add('done');
      await wait(450, token);
      status.textContent = 'Walkthrough complete · sample data only';
      result.textContent = 'Product info · Selection guidance · Shipment visibility';
      cursor.classList.remove('show');
      playing = false;
      document.getElementById('playBtn').textContent = '▶ Replay walkthrough';
    } catch (_) {
      playing = false;
      cursor.classList.remove('show');
      document.getElementById('playBtn').textContent = '▶ Play walkthrough';
    }
  };

  document.getElementById('playBtn').addEventListener('click', runAll);
  document.getElementById('replayBtn').addEventListener('click', () => { playing = false; paused = false; runToken += 1; setTimeout(runAll, 40); });
  document.getElementById('pauseBtn').addEventListener('click', event => {
    if (!playing) return;
    paused = !paused;
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.textContent = paused ? '▶ Resume' : 'Ⅱ Pause';
    status.textContent = paused ? 'Walkthrough paused' : 'Walkthrough resumed';
  });
  navButtons.forEach((button, index) => button.addEventListener('click', () => { playing = false; paused = false; runToken += 1; setFlow(index); }));
  demo.querySelectorAll('.tyos-guide-categories button').forEach(button => button.addEventListener('click', () => {
    demo.querySelectorAll('.tyos-guide-categories button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
  }));
  demo.querySelectorAll('.tyos-product-row').forEach(button => button.addEventListener('click', () => {
    demo.querySelectorAll('.tyos-product-row').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    document.getElementById('specCard').classList.add('open');
  }));
  demo.querySelectorAll('.tyos-arrival-card').forEach(button => button.addEventListener('click', () => {
    demo.querySelectorAll('.tyos-arrival-card').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    document.getElementById('arrivalDetail').classList.add('open');
    document.getElementById('progressFill').classList.add('show');
  }));
  setFlow(0);
})();
