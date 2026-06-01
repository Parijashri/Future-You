/* ═══════════════════════════════════════════
   FUTURE YOU — script.js
   ═══════════════════════════════════════════ */

/* ─── State ─── */
let currentStep = 1;
const TOTAL_STEPS = 6;
let selectedSkills = [];
let userData = {};
let particles = [];
let trailParticles = [];
let activeLetterIdx = 0;
let quests = [];
let questCompletion = JSON.parse(localStorage.getItem('fy_quests') || '{}');
let constellationStars = [];
let constellationHover = null;
let animationFrameId = null;
let countersStarted = false;

/* ─── Custom Cursor ─── */
const cursor = document.getElementById('cursor');
const trailCanvas = document.getElementById('trailCanvas');
const trailCtx = trailCanvas.getContext('2d');
let mouseX = -200, mouseY = -200;

function resizeTrailCanvas() {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resizeTrailCanvas();
window.addEventListener('resize', resizeTrailCanvas);

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';

  // Create trail particle
  if (Math.random() < 0.4) {
    trailParticles.push({
      x: mouseX, y: mouseY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5 - 0.5,
      life: 1, decay: 0.04 + Math.random() * 0.04,
      size: 6 + Math.random() * 6,
      type: Math.random() < 0.6 ? 'heart' : 'spark',
      color: ['#fb7185', '#c4b5fd', '#6ee7b7', '#fdba74', '#60a5fa'][Math.floor(Math.random() * 5)]
    });
  }
});

// Cursor enlarges on hover
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('button, a, .chip, .radio-card, .quest-card, .future-card, .letter-tab')) {
    document.body.classList.add('cursor-enlarged');
  }
});
document.addEventListener('mouseout', () => { document.body.classList.remove('cursor-enlarged'); });

// Click burst
document.addEventListener('click', (e) => {
  for (let i = 0; i < 10; i++) {
    trailParticles.push({
      x: e.clientX, y: e.clientY,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 1,
      life: 1, decay: 0.06 + Math.random() * 0.05,
      size: 8 + Math.random() * 8,
      type: 'heart',
      color: ['#fb7185', '#c4b5fd', '#6ee7b7', '#fdba74'][Math.floor(Math.random() * 4)]
    });
  }
});

/* ─── Trail Animation ─── */
function drawHeart(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❤', x, y);
  ctx.restore();
}

function drawSpark(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', x, y);
  ctx.restore();
}

function animateTrail() {
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const p = trailParticles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.05; // gravity
    p.life -= p.decay;
    if (p.life <= 0) { trailParticles.splice(i, 1); continue; }
    if (p.type === 'heart') drawHeart(trailCtx, p.x, p.y, p.size, p.color, p.life * 0.8);
    else drawSpark(trailCtx, p.x, p.y, p.size, p.color, p.life * 0.8);
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

/* ─── Stars Canvas (Hero) ─── */
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
let stars = [];

function initStars() {
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      r: 0.5 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.3,
      twinkle: Math.random() * Math.PI * 2,
      color: ['#c4b5fd', '#6ee7b7', '#5eead4', '#fdba74', '#60a5fa'][Math.floor(Math.random() * 5)]
    });
  }
}
initStars();
window.addEventListener('resize', initStars);

function animateStars() {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  stars.forEach(s => {
    s.twinkle += 0.02;
    const alpha = 0.4 + Math.sin(s.twinkle) * 0.3;
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starsCtx.fillStyle = s.color;
    starsCtx.globalAlpha = alpha;
    starsCtx.fill();
    starsCtx.globalAlpha = 1;
    s.y -= s.speed;
    if (s.y < 0) { s.y = starsCanvas.height; s.x = Math.random() * starsCanvas.width; }
  });
  requestAnimationFrame(animateStars);
}
animateStars();

/* ─── Navigation Scroll ─── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── Counter Animation ─── */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    animateCounter(el, parseInt(el.dataset.target));
  });
}

/* ─── Scroll Reveal ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('hero-stats')) startCounters();
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section, .about-card, .sdg-card, .future-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});
document.querySelector('.hero-stats')?.classList.add('reveal');
revealObserver.observe(document.querySelector('.hero-stats'));

/* ─── Animate meters when visible ─── */
const meterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.meter-fill').forEach(fill => {
        fill.style.width = fill.dataset.target || '0%';
      });
    }
  });
}, { threshold: 0.3 });

/* ─── Simulator ─── */
function buildProgressDots() {
  const container = document.getElementById('progressSteps');
  container.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'p-step' + (i === currentStep ? ' active' : '') + (i < currentStep ? ' done' : '');
    dot.textContent = i < currentStep ? '✓' : i;
    container.appendChild(dot);
  }
  document.getElementById('progressFill').style.width = (currentStep / TOTAL_STEPS * 100) + '%';
  document.getElementById('stepCurrent').textContent = currentStep;
  document.getElementById('btnPrev').style.display = currentStep > 1 ? 'inline-flex' : 'none';
  const btnNext = document.getElementById('btnNext');
  btnNext.textContent = currentStep === TOTAL_STEPS ? 'Generate My Futures ✨' : 'Continue →';
}

buildProgressDots();

// Chip selection
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
    const skill = chip.dataset.skill;
    if (chip.classList.contains('selected')) {
      selectedSkills.push(skill);
    } else {
      selectedSkills = selectedSkills.filter(s => s !== skill);
    }
  });
});

function collectCurrentStep() {
  if (currentStep === 1) {
    userData.name = document.getElementById('name').value || 'Explorer';
    userData.age = document.getElementById('age').value || '20';
    userData.degree = document.getElementById('degree').value || 'Computer Science';
    userData.year = document.getElementById('year').value || '2';
  }
  if (currentStep === 2) {
    userData.skills = [...selectedSkills];
  }
  if (currentStep === 3) {
    userData.dreamRole = document.getElementById('dreamRole').value || 'Product Designer';
    userData.workEnv = document.querySelector('input[name="env"]:checked')?.value || 'startup';
    userData.motivation = document.querySelector('input[name="motiv"]:checked')?.value || 'impact';
  }
  if (currentStep === 4) {
    userData.sleep = document.getElementById('sleep').value;
    userData.screen = document.getElementById('screen').value;
    userData.projects = document.querySelector('input[name="projects"]:checked')?.value || 'weekly';
    userData.exercise = document.querySelector('input[name="exercise"]:checked')?.value || 'sometimes';
  }
  if (currentStep === 5) {
    userData.intern = document.querySelector('input[name="intern"]:checked')?.value || 'applying';
    userData.portfolio = document.querySelector('input[name="portfolio"]:checked')?.value || 'building';
    userData.network = document.querySelector('input[name="network"]:checked')?.value || 'moderate';
  }
  if (currentStep === 6) {
    userData.ambitions = document.getElementById('ambitions').value;
    userData.fear = document.querySelector('input[name="fear"]:checked')?.value || 'stuck';
    userData.superpower = document.querySelector('input[name="superpower"]:checked')?.value || 'focus';
  }
  localStorage.setItem('fy_data', JSON.stringify(userData));
}

function changeStep(dir) {
  collectCurrentStep();
  const next = currentStep + dir;
  if (next < 1 || next > TOTAL_STEPS) return;
  if (dir > 0 && currentStep === TOTAL_STEPS) {
    generateFutures();
    return;
  }
  document.querySelectorAll('.sim-step').forEach(s => s.classList.remove('active'));
  currentStep = next;
  document.querySelector(`.sim-step[data-step="${currentStep}"]`).classList.add('active');
  buildProgressDots();
  document.getElementById('simulator').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Future Generation ─── */
function scoreUser() {
  let productivity = 50;
  let wellbeing = 50;
  let careerMomentum = 50;
  let creativity = 50;

  const sleep = parseInt(userData.sleep || 7);
  const screen = parseInt(userData.screen || 3);

  productivity += (sleep >= 7 ? 15 : sleep >= 6 ? 5 : -15);
  productivity += (screen <= 2 ? 10 : screen <= 4 ? 0 : screen <= 6 ? -10 : -20);
  wellbeing += (sleep >= 8 ? 15 : sleep >= 7 ? 8 : sleep < 6 ? -20 : 0);
  wellbeing += (userData.exercise === 'daily' ? 15 : userData.exercise === 'sometimes' ? 5 : -10);

  if (userData.projects === 'daily') { productivity += 20; careerMomentum += 20; }
  else if (userData.projects === 'weekly') { productivity += 8; careerMomentum += 10; }
  else if (userData.projects === 'rarely') { careerMomentum -= 5; }
  else { careerMomentum -= 15; }

  if (userData.intern === 'yes_relevant') careerMomentum += 25;
  else if (userData.intern === 'yes_not') careerMomentum += 10;
  else if (userData.intern === 'applying') careerMomentum += 5;
  else careerMomentum -= 10;

  if (userData.portfolio === 'strong') { careerMomentum += 20; creativity += 15; }
  else if (userData.portfolio === 'building') { careerMomentum += 5; creativity += 5; }

  if (userData.network === 'active') careerMomentum += 15;
  else if (userData.network === 'ghost') careerMomentum -= 10;

  const skillCount = (userData.skills || []).length;
  creativity += Math.min(skillCount * 3, 30);

  // clamp
  return {
    productivity: Math.min(Math.max(productivity, 10), 100),
    wellbeing: Math.min(Math.max(wellbeing, 10), 100),
    careerMomentum: Math.min(Math.max(careerMomentum, 10), 100),
    creativity: Math.min(Math.max(creativity, 10), 100)
  };
}

const futureTemplates = {
  thriving: {
    emoji: '🚀',
    type: 'Thriving You',
    className: 'thriving',
    color: '#059669',
    tagline: (u) => `${u.name} who said yes to everything that mattered.`,
    description: (u, sc) => `You invested in your skills, protected your sleep, and showed up consistently. Five years later, you're the ${u.dreamRole || 'professional'} you imagined — and then some.`,
    tags: (u) => ['High Growth', 'Well-Rested', 'Strong Network', 'Promoted Fast'],
    metrics: (sc) => [
      { val: Math.round(sc.careerMomentum * 1.3) + 'k', label: 'Avg. Salary (₹ Monthly)' },
      { val: Math.round(sc.productivity) + '%', label: 'Productivity Score' },
      { val: Math.round(sc.wellbeing) + '%', label: 'Wellbeing Index' },
      { val: '3+', label: 'Certifications Earned' }
    ],
    gains: (u) => [
      `Landed a role at a leading ${u.workEnv || 'startup'} within 3 months of graduating`,
      `Mastered ${(u.skills || ['your key skills']).slice(0, 3).join(', ')}`,
      `Built a portfolio that opened doors without a single cold email`,
      'Maintained 7–8 hrs of sleep as a non-negotiable',
      'Became a mentor within 2 years of starting your career'
    ],
    watch: () => [
      'Don\'t let ambition crowd out rest — it\'s a feature, not a bug',
      'Guard your mornings; that\'s when your best work happens',
      'Give back early; mentorship multiplies your impact'
    ]
  },
  comfortable: {
    emoji: '😌',
    type: 'Comfortable You',
    className: 'comfortable',
    color: '#7c3aed',
    tagline: (u) => `${u.name} who played it safe and found stability.`,
    description: (u, sc) => `You made reasonable choices, avoided major burnout, and built a stable life. Not every dream came true — but the important things did.`,
    tags: () => ['Steady Growth', 'Work-Life Balance', 'Reliable Income', 'Content'],
    metrics: (sc) => [
      { val: Math.round(sc.careerMomentum * 0.8) + 'k', label: 'Avg. Salary (₹ Monthly)' },
      { val: Math.round(sc.productivity * 0.75) + '%', label: 'Productivity Score' },
      { val: Math.round(sc.wellbeing * 1.1) + '%', label: 'Wellbeing Index' },
      { val: '2', label: 'Promotions in 5 Yrs' }
    ],
    gains: (u) => [
      `Secured a stable role in a reputable ${u.workEnv || 'organization'}`,
      'Found routines that work — not exciting, but sustainable',
      'Built meaningful relationships at work',
      'Avoided major health crises through moderate habits',
      'Paid off student debt within 4 years'
    ],
    watch: () => [
      'Comfort can quietly become complacency — audit your growth yearly',
      'It\'s okay to want more; ambition and contentment can coexist',
      'Your network needs investment even when things feel fine'
    ]
  },
  burnout: {
    emoji: '🔥',
    type: 'Burned Out You',
    className: 'burnout',
    color: '#c2410c',
    tagline: (u) => `${u.name} who ran at full speed with no finish line.`,
    description: (u, sc) => `You achieved a lot on paper. But by year three, exhaustion caught up. You built a career but lost yourself somewhere in the hustle.`,
    tags: () => ['High Achiever', 'Low Energy', 'Needs Rest', 'Rebuilding'],
    metrics: (sc) => [
      { val: Math.round(sc.careerMomentum) + 'k', label: 'Avg. Salary (₹ Monthly)' },
      { val: '30%', label: 'Energy Remaining' },
      { val: '45%', label: 'Wellbeing Index' },
      { val: '1', label: 'Career Break Taken' }
    ],
    gains: (u) => [
      'Impressive titles early — but at a steep personal cost',
      `Expertise in ${(u.skills || ['multiple areas']).slice(0, 2).join(' and ')}`,
      'Learned what boundaries feel like — from violating them',
      'Developed deep empathy for mental health struggles',
      'Now rebuilding with far more self-awareness'
    ],
    watch: () => [
      'Start protecting your energy before you have none left',
      'Sleep is the highest-leverage habit you have right now',
      'It\'s not weak to rest — it\'s strategic',
      'Learn to say no; it\'s a full sentence'
    ]
  },
  unexpected: {
    emoji: '🎲',
    type: 'Unexpected You',
    className: 'unexpected',
    color: '#be185d',
    tagline: (u) => `${u.name} who followed a thread and ended up somewhere extraordinary.`,
    description: (u, sc) => `None of this was planned. A random conversation, a side project that blew up, a pivot that felt crazy — and somehow it all made sense.`,
    tags: () => ['Plot Twist', 'Rare Path', 'Unconventional', 'Wildly Alive'],
    metrics: () => [
      { val: '?', label: 'Salary (Ask Again in 5 Yrs)' },
      { val: '∞', label: 'Curiosity Score' },
      { val: '92%', label: 'Life Satisfaction' },
      { val: '7', label: 'Countries Lived In' }
    ],
    gains: (u) => [
      `Started as a ${u.dreamRole || 'professional'} — ended up building something no one had a name for`,
      'A viral moment changed your trajectory completely',
      'Collaborated with people you once only admired online',
      'Discovered a second passion that became your livelihood',
      'Broke the mold that was built for you'
    ],
    watch: () => [
      'Stay curious; the unexpected life rewards open eyes',
      'Document everything — your journey will inspire others',
      'Build your foundations now so the detours don\'t break you',
      'The weird, winding path needs a stable person walking it'
    ]
  }
};

function generateFutures() {
  collectCurrentStep();
  const scores = scoreUser();
  userData.scores = scores;

  // Show futures section
  const futuresSection = document.getElementById('futures');
  futuresSection.classList.remove('hidden');
  document.getElementById('futureName').textContent = userData.name || 'Explorer';
  document.getElementById('futuresTitle');

  const grid = document.getElementById('futuresGrid');
  grid.innerHTML = '';

  Object.entries(futureTemplates).forEach(([key, t]) => {
    const card = document.createElement('div');
    card.className = `future-card ${t.className} reveal`;
    card.innerHTML = `
      <div class="future-emoji">${t.emoji}</div>
      <div class="future-type">${t.type}</div>
      <h3>${t.tagline(userData)}</h3>
      <p>${t.description(userData, scores)}</p>
      <div class="future-tags">${t.tags(userData).map(tag => `<span class="future-tag">${tag}</span>`).join('')}</div>
      <button class="future-view-btn" onclick="showFutureDetail('${key}')">Explore this future →</button>
    `;
    grid.appendChild(card);
    setTimeout(() => revealObserver.observe(card), 10);
  });

  // Letters
  generateLetters();
  // Burnout meters
  generateMeters(scores);
  // Quests
  generateQuests();
  // Constellation
  buildConstellation();

  document.getElementById('letters').classList.remove('hidden');
  futuresSection.scrollIntoView({ behavior: 'smooth' });
}

function showFutureDetail(key) {
  const t = futureTemplates[key];
  const scores = userData.scores || scoreUser();
  const detail = document.getElementById('futureDetail');
  const content = document.getElementById('futureDetailContent');

  const metrics = t.metrics(scores);
  const gains = t.gains(userData);
  const watch = t.watch();

  content.innerHTML = `
    <div class="detail-card">
      <div class="detail-header">
        <div class="detail-emoji">${t.emoji}</div>
        <div class="detail-title-group">
          <h2>${t.type}</h2>
          <p>${t.tagline(userData)}</p>
        </div>
      </div>
      <div class="detail-metrics">
        ${metrics.map(m => `<div class="detail-metric"><span class="metric-val" style="color:${t.color}">${m.val}</span><div class="metric-label">${m.label}</div></div>`).join('')}
      </div>
      <div class="detail-body">
        <div class="detail-section">
          <h4>✦ What you gained</h4>
          <ul class="detail-list">${gains.map(g => `<li>${g}</li>`).join('')}</ul>
        </div>
        <div class="detail-section">
          <h4>👀 What to watch</h4>
          <ul class="detail-list">${watch.map(w => `<li>${w}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `;

  detail.classList.remove('hidden');
  document.getElementById('futuresGrid').classList.add('hidden');
  detail.scrollIntoView({ behavior: 'smooth' });
}

function closeFutureDetail() {
  document.getElementById('futureDetail').classList.add('hidden');
  document.getElementById('futuresGrid').classList.remove('hidden');
}

/* ─── Letters ─── */
const letterData = [
  {
    key: 'thriving',
    emoji: '🚀',
    label: 'Thriving You',
    from: 'From: Thriving You, 2030',
    body: (u) => `Hi. It's me — you — five years from now.\n\nI know right now it feels like nothing is certain. I know you're up late wondering if you're doing enough. You are. I need you to know that.\n\nThe ${u.degree || 'degree'} thing? It matters less than the person you're becoming while you do it. The internship you're nervous about? Apply. The project you've been putting off? Start it this weekend. Not to be productive — just to prove to yourself that you can.\n\nThe skills you're building right now — ${(u.skills || ['all the ones you think don't matter yet']).slice(0,3).join(', ')} — they compound. By 2028 you'll have a portfolio that makes people ask how you got there. You'll smile and think of this moment.\n\nProtect your sleep. That one's not negotiable.`,
    sign: '— You (but better rested) ✦'
  },
  {
    key: 'comfortable',
    emoji: '😌',
    label: 'Comfortable You',
    from: 'From: Comfortable You, 2030',
    body: (u) => `Hey ${u.name || 'you'}.\n\nI won't pretend everything went exactly as planned. It didn't. But here's what I want you to know: stable is underrated. Happy is underrated.\n\nYou built a good life. Not the one plastered all over LinkedIn — a real one. You sleep well. You have people who know you. You do work that doesn't crush your soul.\n\nThe pressure you feel right now to be extraordinary? Let some of it go. Sustainable is extraordinary. Consistent is extraordinary.\n\nDo the things that matter. Skip the ones that just look good. You'll figure out the difference faster than you think.`,
    sign: '— You (calm, actually) 🌙'
  },
  {
    key: 'burnout',
    emoji: '🔥',
    label: 'Burned Out You',
    from: 'From: Burned Out You, 2029',
    body: (u) => `${u.name || 'Listen'}. I'm writing this from a sabbatical I didn't plan.\n\nYou're going to achieve things. Real things. But somewhere around year two you'll forget that achievement isn't the point — living is.\n\nI need you to do something I didn't: build one hour into every day that belongs to nobody and nothing. Not productive. Not networked. Just you.\n\nSleep at least 7 hours. I know it sounds boring. Do it anyway.\n\nYou can care about ${u.dreamRole || 'your goals'} deeply and still put the laptop down at 9pm. Please. For both of us.\n\nI'm rebuilding. You don't have to.`,
    sign: '— You (resting now) 🛌'
  },
  {
    key: 'unexpected',
    emoji: '🎲',
    label: 'Unexpected You',
    from: 'From: Unexpected You, 2031',
    body: (u) => `${u.name || 'You'}, you are not going to believe this.\n\nI can't tell you exactly what happens because I'm still figuring it out. But here's the key thing: say yes to the thing that doesn't make sense. You'll know which one.\n\nThe ${(u.skills || ['skills']).slice(0, 2).join(' and ')} you're building? They're not for the role you're imagining. They're for something that doesn't exist yet. But it will, and it'll need you specifically.\n\nDon't over-plan. Build foundations, stay curious, and leave room for the universe to be creative. It's much more imaginative than either of us.\n\nThe weird path is the best path. I know it feels unstable. That's how it's supposed to feel.`,
    sign: '— You (somewhere wild) 🌍'
  }
];

function generateLetters() {
  const tabs = document.getElementById('lettersTabs');
  tabs.innerHTML = '';
  letterData.forEach((l, i) => {
    const tab = document.createElement('button');
    tab.className = 'letter-tab' + (i === 0 ? ' active' : '');
    tab.innerHTML = `${l.emoji} ${l.label}`;
    tab.addEventListener('click', () => {
      document.querySelectorAll('.letter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeLetterIdx = i;
      typewriteLetter(i);
    });
    tabs.appendChild(tab);
  });
  typewriteLetter(0);
}

function typewriteLetter(idx) {
  const l = letterData[idx];
  const container = document.getElementById('letterContent');
  const text = l.body(userData);
  container.innerHTML = `
    <div class="letter-from">${l.from}</div>
    <div class="letter-body" id="typewriteTarget"></div>
    <div class="letter-sign" id="letterSign" style="opacity:0"></div>
  `;
  const target = document.getElementById('typewriteTarget');
  const sign = document.getElementById('letterSign');
  sign.textContent = l.sign;

  let i = 0;
  const speed = 18;
  if (window._typewriteTimer) clearInterval(window._typewriteTimer);
  window._typewriteTimer = setInterval(() => {
    target.textContent = text.slice(0, i);
    i++;
    if (i > text.length) {
      clearInterval(window._typewriteTimer);
      sign.style.opacity = '1';
      sign.style.transition = 'opacity 0.6s ease';
    }
  }, speed);
}

/* ─── Burnout Meters ─── */
function generateMeters(scores) {
  const grid = document.getElementById('metersGrid');
  const sleep = parseInt(userData.sleep || 7);
  const screen = parseInt(userData.screen || 3);

  const energy = Math.min(100, Math.round((sleep / 9) * 60 + (userData.exercise === 'daily' ? 30 : userData.exercise === 'sometimes' ? 15 : 0) + (screen <= 3 ? 10 : 0)));
  const stress = Math.min(100, Math.round(100 - scores.wellbeing + (screen > 5 ? 15 : 0)));
  const growth = Math.min(100, Math.round(scores.careerMomentum * 0.9 + scores.creativity * 0.1));
  const balance = Math.min(100, Math.round((scores.wellbeing + scores.productivity) / 2));

  const meters = [
    { name: '⚡ Energy', score: energy, cls: 'energy', desc: energy > 70 ? 'You\'re fueled up and running strong.' : energy > 45 ? 'You\'re managing, but more rest would help.' : 'Your energy reserves are running low. Prioritize sleep.' },
    { name: '🔥 Stress', score: stress, cls: 'stress', desc: stress < 40 ? 'Stress levels are healthy — keep that balance.' : stress < 65 ? 'Moderate stress detected. Watch your screen time.' : 'High stress detected. You need recovery habits now.' },
    { name: '🌱 Growth', score: growth, cls: 'growth', desc: growth > 70 ? 'You\'re on a strong growth trajectory.' : growth > 45 ? 'Steady growth — a few more consistent actions will accelerate this.' : 'Growth is slow. More intentional action needed.' },
    { name: '⚖️ Balance', score: balance, cls: 'balance', desc: balance > 70 ? 'Great life balance! You\'re building sustainably.' : balance > 45 ? 'Balance is okay but could be stronger.' : 'Imbalance detected. Something is getting too much — or too little.' }
  ];

  grid.innerHTML = meters.map(m => `
    <div class="meter-card reveal">
      <div class="meter-header">
        <span class="meter-name">${m.name}</span>
        <span class="meter-score" style="color: var(--lavender-deep)">${m.score}%</span>
      </div>
      <div class="meter-bar"><div class="meter-fill ${m.cls}" data-target="${m.score}%" style="width:0"></div></div>
      <div class="meter-desc">${m.desc}</div>
    </div>
  `).join('');

  const meterSection = document.querySelector('.burnout');
  meterObserver.observe(meterSection);
  meterSection.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ─── Weekly Quests ─── */
const allQuests = [
  { icon: '📩', title: 'Apply to 3 internships', desc: 'Reach out to 3 companies that excite you — even dream ones.', xp: '+50 XP', key: 'q1' },
  { icon: '🌙', title: 'Sleep before midnight twice', desc: 'Your future self will thank present you. Twice.', xp: '+30 XP', key: 'q2' },
  { icon: '🔗', title: 'Update your LinkedIn', desc: 'Add your latest project, skill, or experience.', xp: '+20 XP', key: 'q3' },
  { icon: '🔨', title: 'Ship one project update', desc: 'Push code, add a feature, or write a case study section.', xp: '+60 XP', key: 'q4' },
  { icon: '📚', title: 'Learn one new thing deeply', desc: 'Pick one topic and go 30 minutes deeper than usual.', xp: '+25 XP', key: 'q5' },
  { icon: '🤝', title: 'Have a networking conversation', desc: 'Reach out to someone whose work you admire. Ask one genuine question.', xp: '+40 XP', key: 'q6' },
  { icon: '🏃', title: 'Move your body for 20 mins', desc: 'Walk, stretch, dance — doesn\'t matter. Just move.', xp: '+20 XP', key: 'q7' },
  { icon: '✍️', title: 'Write for 15 minutes', desc: 'Journal, blog post, or just thoughts. Writing is thinking.', xp: '+15 XP', key: 'q8' }
];

function generateQuests() {
  const grid = document.getElementById('questsGrid');
  const relevant = allQuests.slice();
  grid.innerHTML = relevant.map(q => `
    <div class="quest-card${questCompletion[q.key] ? ' completed' : ''} reveal" id="quest_${q.key}" onclick="toggleQuest('${q.key}', this)">
      <div class="quest-icon">${q.icon}</div>
      <div class="quest-body">
        <div class="quest-title">${q.title}</div>
        <div class="quest-desc">${q.desc}</div>
        <span class="quest-xp">${q.xp}</span>
      </div>
      <div class="quest-check">${questCompletion[q.key] ? '✓' : ''}</div>
    </div>
  `).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function toggleQuest(key, card) {
  questCompletion[key] = !questCompletion[key];
  localStorage.setItem('fy_quests', JSON.stringify(questCompletion));
  card.classList.toggle('completed', questCompletion[key]);
  card.querySelector('.quest-check').textContent = questCompletion[key] ? '✓' : '';

  if (questCompletion[key]) {
    // Burst effect
    const rect = card.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      trailParticles.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 1, decay: 0.04 + Math.random() * 0.04,
        size: 10 + Math.random() * 10,
        type: 'heart',
        color: '#6ee7b7'
      });
    }
  }
}

/* ─── Constellation Canvas ─── */
const skillPaths = {
  'HTML/CSS': ['JavaScript', 'UI/UX Design', 'React', 'Graphic Design'],
  'JavaScript': ['React', 'Python', 'Problem Solving', 'Product Management'],
  'Python': ['Data Analysis', 'Machine Learning', 'Problem Solving'],
  'React': ['UI/UX Design', 'Product Management', 'JavaScript'],
  'Data Analysis': ['Machine Learning', 'SQL', 'Finance'],
  'Machine Learning': ['Python', 'Data Analysis'],
  'UI/UX Design': ['Graphic Design', 'Product Management', 'Illustration'],
  'Writing': ['Communication', 'Content Creation', 'Marketing'],
  'Communication': ['Leadership', 'Public Speaking', 'Teamwork'],
  'Graphic Design': ['Illustration', 'Content Creation', 'UI/UX Design'],
  'Marketing': ['Content Creation', 'Communication', 'Entrepreneurship'],
  'Product Management': ['Communication', 'Leadership', 'Entrepreneurship'],
  'Entrepreneurship': ['Marketing', 'Leadership', 'Finance'],
  'Leadership': ['Communication', 'Teamwork', 'Public Speaking'],
  'SQL': ['Data Analysis', 'Finance'],
  'Finance': ['SQL', 'Entrepreneurship'],
  'Content Creation': ['Writing', 'Graphic Design', 'Marketing'],
  'Video Editing': ['Content Creation', 'Graphic Design'],
  'Photography': ['Graphic Design', 'Content Creation'],
  'Illustration': ['Graphic Design', 'UI/UX Design'],
  'Sales': ['Communication', 'Marketing'],
  'Teamwork': ['Communication', 'Leadership'],
  'Public Speaking': ['Communication', 'Leadership'],
  'Problem Solving': ['Python', 'Data Analysis', 'Product Management']
};

function buildConstellation() {
  const canvas = document.getElementById('constellationCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const userSkills = userData.skills || [];
  const allSkillNames = Object.keys(skillPaths);

  // Build nodes: user skills are bright, others are dim
  constellationStars = allSkillNames.map((skill, i) => {
    const angle = (i / allSkillNames.length) * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.2;
    const cx = W / 2, cy = H / 2;
    const spread = Math.min(W, H) * 0.42;
    return {
      name: skill,
      x: cx + Math.cos(angle) * spread * radius * (1 + (i % 3) * 0.3),
      y: cy + Math.sin(angle) * spread * radius * (1 + (i % 2) * 0.35),
      r: userSkills.includes(skill) ? 7 : 3,
      owned: userSkills.includes(skill),
      twinkle: Math.random() * Math.PI * 2,
      pulse: 0
    };
  });

  // Clamp positions
  constellationStars.forEach(s => {
    s.x = Math.max(30, Math.min(W - 30, s.x));
    s.y = Math.max(30, Math.min(H - 30, s.y));
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    constellationHover = null;
    constellationStars.forEach(s => {
      const d = Math.hypot(s.x - mx, s.y - my);
      if (d < 20) constellationHover = s;
    });
  });
  canvas.addEventListener('mouseleave', () => { constellationHover = null; });

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  drawConstellation(ctx, W, H);
}

function drawConstellation(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f0a1a';
  ctx.fillRect(0, 0, W, H);

  const userSkills = userData.skills || [];

  // Draw connections
  constellationStars.forEach(star => {
    if (!star.owned) return;
    const connected = skillPaths[star.name] || [];
    connected.forEach(targetName => {
      const target = constellationStars.find(s => s.name === targetName);
      if (!target) return;
      const both = star.owned && target.owned;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = both ? 'rgba(110,231,183,0.5)' : 'rgba(196,181,253,0.15)';
      ctx.lineWidth = both ? 1.5 : 0.5;
      ctx.stroke();
    });
  });

  // Draw stars
  constellationStars.forEach(s => {
    s.twinkle += 0.02;
    const alpha = s.owned ? 0.8 + Math.sin(s.twinkle) * 0.2 : 0.2 + Math.sin(s.twinkle) * 0.1;
    const isHovered = constellationHover === s;
    const r = isHovered ? s.r * 2.5 : (s.owned ? s.r + Math.sin(s.twinkle) * 1.5 : s.r);

    // Glow for owned
    if (s.owned) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
      grd.addColorStop(0, 'rgba(110,231,183,0.3)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#fde68a' : (s.owned ? '#6ee7b7' : '#c4b5fd');
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    if (s.owned || isHovered) {
      ctx.fillStyle = isHovered ? '#fde68a' : 'rgba(255,255,255,0.75)';
      ctx.font = isHovered ? 'bold 13px "DM Sans", sans-serif' : '11px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - r - 6);
    }
  });

  // Hover card
  if (constellationHover) {
    const s = constellationHover;
    const connected = (skillPaths[s.name] || []).filter(n => userSkills.includes(n));
    ctx.fillStyle = 'rgba(20,12,40,0.92)';
    const boxW = 180, boxH = 70 + connected.length * 18;
    let bx = s.x + 15, by = s.y - 20;
    if (bx + boxW > W - 10) bx = s.x - boxW - 15;
    if (by + boxH > H - 10) by = H - boxH - 10;
    roundRect(ctx, bx, by, boxW, boxH, 10);
    ctx.fill();
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 13px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.name, bx + 12, by + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px "DM Sans", sans-serif';
    ctx.fillText(s.owned ? '✦ In your constellation' : '○ Not yet explored', bx + 12, by + 40);
    if (connected.length > 0) {
      ctx.fillStyle = 'rgba(196,181,253,0.8)';
      ctx.fillText('Connects to:', bx + 12, by + 58);
      connected.forEach((cn, ci) => {
        ctx.fillText('• ' + cn, bx + 14, by + 74 + ci * 18);
      });
    }
  }

  animationFrameId = requestAnimationFrame(() => drawConstellation(ctx, W, H));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ─── Magnetic Buttons ─── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ─── Default Constellation (no user data yet) ─── */
window.addEventListener('DOMContentLoaded', () => {
  // Pre-build default constellation with some example skills
  userData.skills = userData.skills || ['HTML/CSS', 'JavaScript', 'Communication', 'Writing'];
  buildConstellation();

  // Load saved data
  const saved = localStorage.getItem('fy_data');
  if (saved) {
    try { userData = JSON.parse(saved); } catch (e) {}
  }

  // Generate default meters and quests if no session data
  const defaultScores = { productivity: 60, wellbeing: 65, careerMomentum: 55, creativity: 70 };
  generateMeters(defaultScores);
  generateQuests();
});
