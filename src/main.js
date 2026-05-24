import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const cursor = document.querySelector('.cursor');
  const cursorTrail = document.querySelector('.cursor-trail');
  const introGate = document.getElementById('introGate');
  const app = document.getElementById('app');
  const bgMusic = document.getElementById('bgMusic');
  const vhsToggle = document.getElementById('vhsToggle');
  const musicToggle = document.getElementById('musicToggle');
  const vhsOverlay = document.querySelector('.vhs-overlay');
  const controls = document.querySelector('.controls');
  
  const countdownScreen = document.getElementById('countdownScreen');
  const countdownTimer = document.getElementById('countdownTimer');
  const dartScreen = document.getElementById('dartScreen');
  const movingDart = document.getElementById('movingDart');
  const throwBtn = document.getElementById('throwBtn');
  const insultMessage = document.getElementById('insultMessage');

  // --- Pre-Gate Logic (Countdown & Dart) ---
  const TARGET_DATE = new Date('2026-05-24T15:00:00Z').getTime();
  let countdownInterval;
  let dartAnimFrame;
  let dartPos = 0;
  let dartDirection = 1;
  const dartSpeed = 2.5; 
  let gameActive = false;

  const insults = [
    "Matanya minus berapa sih?",
    "Meleset mulu, cape deh.",
    "Bukan di situ woi!",
    "Kurang fokus nih!",
    "Yakin bisa masuk?",
    "Gitu aja gak kena!",
    "Payah banget wkwk",
    "Belajar lempar dulu sana"
  ];

  function initDartGame() {
    dartScreen.classList.remove('hidden');
    gameActive = true;
    animateDart();
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    if (distance <= 0) {
      clearInterval(countdownInterval);
      countdownScreen.classList.add('hidden');
      initDartGame();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownTimer.textContent = `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  if (new Date().getTime() < TARGET_DATE) {
    countdownScreen.classList.remove('hidden');
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  } else {
    initDartGame();
  }

  function animateDart() {
    if (!gameActive) return;
    
    dartPos += dartSpeed * dartDirection;
    if (dartPos >= 100 || dartPos <= 0) {
      dartDirection *= -1;
    }
    
    movingDart.style.left = `${dartPos}%`;
    dartAnimFrame = requestAnimationFrame(animateDart);
  }

  throwBtn.addEventListener('click', () => {
    if (!gameActive) return;
    
    if (dartPos >= 38 && dartPos <= 62) {
      gameActive = false;
      cancelAnimationFrame(dartAnimFrame);
      insultMessage.style.color = "var(--color-highlight)";
      insultMessage.textContent = "Mantap! Membuka...";
      
      setTimeout(() => {
        dartScreen.classList.add('hidden');
        introGate.classList.remove('hidden');
      }, 1500);
    } else {
      const randomInsult = insults[Math.floor(Math.random() * insults.length)];
      insultMessage.style.color = "#e74c3c";
      insultMessage.textContent = randomInsult;
    }
  });

  // --- Custom Cursor ---
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      // Trail follows with slight delay
      setTimeout(() => {
        cursorTrail.style.left = e.clientX + 'px';
        cursorTrail.style.top = e.clientY + 'px';
      }, 50);
    });
  }

  // --- Intro Gate & Music ---
  let isPlaying = false;

  introGate.addEventListener('click', () => {
    introGate.classList.add('hidden');
    app.classList.add('visible');
    
    // Play audio
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
      isPlaying = true;
    }).catch(err => console.error("Audio playback failed:", err));

    // Show controls shortly after
    setTimeout(() => {
      controls.classList.add('visible');
    }, 2000);

    // Start Typewriter
    setTimeout(startTypewriter, 1000);
  });

  // --- Typewriter Effect ---
  const lines = [
    { el: document.getElementById('line1'), text: "“some people don’t just exist...”" },
    { el: document.getElementById('line2'), text: "“they become a feeling.”" },
    { el: document.getElementById('line3'), text: "“you were always one of those people.”" }
  ];
  const titleReveal = document.getElementById('titleReveal');
  const scrollPrompt = document.querySelector('.scroll-prompt');

  async function typeLine(lineObj, speed = 60) {
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        lineObj.el.textContent += lineObj.text.charAt(i);
        i++;
        if (i >= lineObj.text.length) {
          clearInterval(interval);
          setTimeout(resolve, 800); // Wait before next line
        }
      }, speed);
    });
  }

  async function startTypewriter() {
    for (const line of lines) {
      await typeLine(line);
    }
    titleReveal.classList.add('visible');
    setTimeout(() => {
      scrollPrompt.classList.add('visible');
      // allow scrolling
      document.body.style.overflowY = 'auto';
    }, 2000);
  }

  // Disable scroll initially
  document.body.style.overflowY = 'hidden';

  // --- Scroll Animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: unobserve to animate only once
        // observer.unobserve(entry.target);
      } else {
        // Optional: remove if you want them to fade out when scrolling away
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });

  // --- Controls Toggles ---
  vhsToggle.addEventListener('click', () => {
    vhsOverlay.classList.toggle('hidden');
    vhsToggle.textContent = vhsOverlay.classList.contains('hidden') ? 'VHS: OFF' : 'VHS: ON';
  });

  musicToggle.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      musicToggle.textContent = 'AUDIO: OFF';
    } else {
      bgMusic.play();
      musicToggle.textContent = 'AUDIO: ON';
    }
    isPlaying = !isPlaying;
  });

  // --- Populate Gallery ---
  const photos = [
    'WhatsApp Image 2026-05-24 at 2.39.31 PM.jpeg',
    'WhatsApp Image 2026-05-24 at 2.39.31 PM (1).jpeg',
    'WhatsApp Image 2026-05-24 at 2.39.31 PM (2).jpeg',
    'WhatsApp Image 2026-05-24 at 2.39.31 PM (3).jpeg'
  ];
  
  const captions = [
    "memories that stayed.",
    "our little archive.",
    "for the moments that mattered.",
    "always."
  ];

  const scrapbook = document.querySelector('.scrapbook');
  photos.forEach((photo, index) => {
    const div = document.createElement('div');
    div.className = 'polaroid fade-up';
    
    const tape = document.createElement('div');
    tape.className = 'tape';
    
    const img = document.createElement('img');
    img.src = `/photos/${photo}`;
    img.alt = `Memory ${index + 1}`;
    
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = captions[index];

    div.appendChild(tape);
    div.appendChild(img);
    div.appendChild(caption);
    scrapbook.appendChild(div);
  });
});
