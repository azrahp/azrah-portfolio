/* ==========================================================================
   RETRO PORTFOLIO JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Audio Context (initializes on first interaction)
  let audioCtx = null;
  let isSoundEnabled = true;

  // Initializing Sound System
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Synthesis for Retro Sound Effects
  function playSynthSound(type) {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    // Resume AudioContext if suspended (browser security rules)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
      case 'click': // Short high-pitched blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'bleep': // Menu navigation select
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(450, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'coin': // Classic retro coin/chime sound (two rapid notes)
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'powerup': // Ascending sweep arpeggio
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.05); // E4
        osc.frequency.setValueAtTime(392.00, now + 0.1); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.15); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
        
      case 'dpad': // D-pad click (thud/low buzz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  }

  // ==========================================================================
  // TWINKLING PIXEL STARFIELD CANVAS
  // ==========================================================================
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const maxStars = 80;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        // Small pixel sizes (1x1 to 3x3)
        size: Math.floor(Math.random() * 3) + 1,
        alpha: Math.random(),
        speed: 0.01 + Math.random() * 0.02
      });
    }
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid pattern subtly
    ctx.strokeStyle = 'rgba(255, 63, 164, 0.02)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw and update stars
    stars.forEach(star => {
      // Twinkle alpha
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed;
      }
      star.alpha = Math.max(0, Math.min(1, star.alpha));

      // Draw pixel stars
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      // Neon colors mixed in
      if (Math.random() > 0.95) {
        ctx.fillStyle = `rgba(186, 255, 94, ${star.alpha})`; // neon-green
      } else if (Math.random() > 0.95) {
        ctx.fillStyle = `rgba(255, 63, 164, ${star.alpha})`; // neon-pink
      }
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    requestAnimationFrame(animateStars);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateStars();

  // ==========================================================================
  // PROFILE IMAGE RETRO PIXEL FILTER (DYNAMIC CANVAS SCALING)
  // ==========================================================================
  const profileCanvas = document.getElementById('profile-canvas');
  const profileCtx = profileCanvas.getContext('2d');
  const profileImg = document.getElementById('profile-img-src');
  const filterToggleBtn = document.getElementById('filter-toggle');
  let isPixelated = true;

  // Offscreen canvas for rendering downscaled image
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  function renderProfile() {
    if (!profileImg.complete) return;

    const w = profileCanvas.width;
    const h = profileCanvas.height;

    if (isPixelated) {
      // Downscale factor (more downscaling = larger pixels)
      const pixelSize = 4.5;
      const sw = Math.floor(w / pixelSize);
      const sh = Math.floor(h / pixelSize);

      offscreenCanvas.width = sw;
      offscreenCanvas.height = sh;

      // Draw normal image to offscreen small canvas
      offscreenCtx.drawImage(profileImg, 0, 0, sw, sh);

      // Disable image smoothing for scaling back up (crisp pixelation)
      profileCtx.imageSmoothingEnabled = false;
      profileCtx.mozImageSmoothingEnabled = false;
      profileCtx.webkitImageSmoothingEnabled = false;
      profileCtx.msImageSmoothingEnabled = false;

      profileCtx.clearRect(0, 0, w, h);
      profileCtx.drawImage(offscreenCanvas, 0, 0, sw, sh, 0, 0, w, h);

      // Draw a CRT overlay scanline effect inside the DS photo screen
      profileCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < h; y += 4) {
        profileCtx.fillRect(0, y, w, 2);
      }
    } else {
      // Draw normal image smoothly
      profileCtx.imageSmoothingEnabled = true;
      profileCtx.clearRect(0, 0, w, h);
      profileCtx.drawImage(profileImg, 0, 0, w, h);
    }
  }

  // Load and draw photo
  profileImg.addEventListener('load', renderProfile);
  // Trigger rendering if already cached/completed
  if (profileImg.complete) {
    renderProfile();
  }

  filterToggleBtn.addEventListener('click', () => {
    isPixelated = !isPixelated;
    filterToggleBtn.textContent = `PIXEL FILTER: ${isPixelated ? 'ON' : 'OFF'}`;
    playSynthSound('click');
    renderProfile();
  });

  // ==========================================================================
  // NINTENDO DS MOCKUP SYSTEM & STATS PANEL TOGGLES
  // ==========================================================================
  const menuItems = document.querySelectorAll('.ds-menu .menu-item');
  const statPanels = document.querySelectorAll('.stat-panel');

  function selectTab(targetId) {
    // Update active tab styling in menu
    menuItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update visibility of target info panel
    statPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      playSynthSound('bleep');
      selectTab(target);
    });
  });

  // Mocking Dpad and ABXY console buttons triggers
  const dpadBtns = document.querySelectorAll('.dpad-btn');
  dpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('dpad');
      // Navigate stats panels up/down sequentially
      const currentActive = document.querySelector('.ds-menu .menu-item.active');
      const allItemsArray = Array.from(menuItems);
      let currentIndex = allItemsArray.indexOf(currentActive);
      
      if (btn.classList.contains('down') || btn.classList.contains('right')) {
        currentIndex = (currentIndex + 1) % allItemsArray.length;
      } else {
        currentIndex = (currentIndex - 1 + allItemsArray.length) % allItemsArray.length;
      }
      selectTab(allItemsArray[currentIndex].getAttribute('data-target'));
    });
  });

  const abxyBtns = document.querySelectorAll('.action-btn');
  abxyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('coin');
      showToast(`BUTTON ${btn.textContent} CLICKED! POWERING UP!`);
    });
  });

  // ==========================================================================
  // DYNAMIC DUPLICATION OF NAVIGATION BAR FOR CONTINUOUS MARQUEE
  // ==========================================================================
  const navContainer = document.querySelector('.marquee-nav-container');
  // Duplicate contents to ensure seamless infinite looping scroll
  const navItems = Array.from(navContainer.children);
  navItems.forEach(item => {
    const clone = item.cloneNode(true);
    navContainer.appendChild(clone);
  });
  // Duplicate one more time to avoid blanks on wide monitors
  navItems.forEach(item => {
    const clone = item.cloneNode(true);
    navContainer.appendChild(clone);
  });

  // Navigation Links click sound
  const allNavLinks = document.querySelectorAll('.nav-item');
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      playSynthSound('click');
    });
  });

  // ==========================================================================
  // INTERACTIVE WIDGET: LOOT CHEST (DOWNLOAD CV)
  // ==========================================================================
  const cvChest = document.getElementById('cv-chest');
  const closedChest = cvChest.querySelector('.chest-svg.closed');
  const openChest = cvChest.querySelector('.chest-svg.open');
  const downloadCvBtn = document.getElementById('download-cv-btn');

  cvChest.addEventListener('click', () => {
    if (closedChest.classList.contains('hidden')) {
      // Re-close chest
      closedChest.classList.remove('hidden');
      openChest.classList.add('hidden');
      downloadCvBtn.classList.add('hidden');
      playSynthSound('click');
    } else {
      // Open chest and reveal loot
      closedChest.classList.add('hidden');
      openChest.classList.remove('hidden');
      downloadCvBtn.classList.remove('hidden');
      playSynthSound('powerup');
      showToast("UNLOCKED AZRAH'S CV SCROLL!");
    }
  });

  // ==========================================================================
  // INTERACTIVE WIDGET: SAVE POINT
  // ==========================================================================
  const savePoint = document.getElementById('save-point');
  const saveBtn = document.getElementById('save-btn');

  function triggerSaveLog() {
    // Animate rotation
    const starSvg = savePoint.querySelector('.save-star-svg');
    starSvg.classList.add('save-star-clicked');
    playSynthSound('coin');

    // Get exact local time formatted
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    showToast(`PROGRESS SAVED AT ${timeStr}!`);

    // Reset animation class after completion
    setTimeout(() => {
      starSvg.classList.remove('save-star-clicked');
    }, 400);
  }

  savePoint.addEventListener('click', triggerSaveLog);
  saveBtn.addEventListener('click', triggerSaveLog);

  // ==========================================================================
  // INTERACTIVE WIDGET: ENVELOPE & SOCIAL PORTALS
  // ==========================================================================
  const envelopeTrigger = document.getElementById('envelope-trigger');
  const envelope = document.getElementById('envelope');
  const socialRow = document.getElementById('social-row');

  envelopeTrigger.addEventListener('click', () => {
    const isOpened = envelope.classList.contains('opened');
    
    if (isOpened) {
      envelope.classList.remove('opened');
      socialRow.classList.add('hidden');
      playSynthSound('click');
    } else {
      envelope.classList.add('opened');
      socialRow.classList.remove('hidden');
      playSynthSound('powerup');
      showToast("CONTACT portals DECRYPTED!");
    }
  });

  // Social Buttons click sound
  const socialBtns = document.querySelectorAll('.social-btn');
  socialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('click');
    });
  });

  // ==========================================================================
  // SOUND AND CRT TOGGLES
  // ==========================================================================
  const soundToggle = document.getElementById('sound-toggle');
  const crtToggle = document.getElementById('crt-toggle');

  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.innerHTML = `<span class="icon">${isSoundEnabled ? '🔊' : '🔇'}</span> SOUND ${isSoundEnabled ? 'ON' : 'OFF'}`;
    if (isSoundEnabled) {
      playSynthSound('click');
    }
  });

  crtToggle.addEventListener('click', () => {
    document.body.classList.toggle('crt-active');
    const isCrtActive = document.body.classList.contains('crt-active');
    crtToggle.innerHTML = `<span class="icon">📺</span> CRT ${isCrtActive ? 'ON' : 'OFF'}`;
    playSynthSound('click');
  });

  // Press Start Button scroll behavior
  const pressStartBtn = document.getElementById('press-start-btn');
  pressStartBtn.addEventListener('click', () => {
    playSynthSound('coin');
    const aboutSection = document.getElementById('about');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  });

  // ==========================================================================
  // UTILITIES (TOAST NOTIFICATIONS)
  // ==========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    // Remove previous toasts to avoid crowding
    toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'pixel-toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove toast
    setTimeout(() => {
      toast.remove();
    }, 2800);
  }
});
