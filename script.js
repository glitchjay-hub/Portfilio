/* ============================================================
   ANSH MAURYA — script.js
   ============================================================ */

// ================================================================
// THEME
// ================================================================
const body = document.body;
const themeBtn = document.getElementById('theme-toggle');

function applyTheme(t) {
    const icon = themeBtn.querySelector('i');
    if (t === 'dark') {
        body.classList.remove('light-mode'); body.classList.add('dark-mode');
        icon.className = 'ri-sun-line';
    } else {
        body.classList.remove('dark-mode'); body.classList.add('light-mode');
        icon.className = 'ri-moon-line';
    }
}
applyTheme(localStorage.getItem('theme') || 'light');
themeBtn.addEventListener('click', () => {
    const next = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(next); localStorage.setItem('theme', next);
});

// ================================================================
// SCROLL PROGRESS BAR
// ================================================================
const scrollBar = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    scrollBar.style.width = (pct * 100) + '%';
}, { passive: true });

// ================================================================
// HEADER — scroll class
// ================================================================
const header = document.getElementById('top-header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ================================================================
// SMOOTH SCROLL
// ================================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const el = document.querySelector(id);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
});

// ================================================================
// HERO LINE REVEAL (on load)  — stack-up animation driven
// ================================================================
window.addEventListener('load', () => {
    // Hero lines: trigger stack-up in sequence
    document.querySelectorAll('.hero .stack-up').forEach((el, i) => {
        el.style.setProperty('--stack-delay', `${0.08 + i * 0.14}s`);
    });

    // Count-up animation for stats
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = el.textContent.replace(/[^0-9]/g, '');
        const suffix = el.textContent.replace(/[0-9]/g, '');
        if (!target) return;
        const end = parseInt(target);
        const duration = 1400;
        const startTime = performance.now();
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(ease * end);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        };
        setTimeout(() => requestAnimationFrame(tick), 600);
    });

    // ---- Word cycling: ENGINEER → DEVELOPER ----
    const container = document.getElementById('word-cycle');
    if (container) {
        const words = container.querySelectorAll('.word-slide');
        let current = 0;

        const updateWidths = () => {
            let maxW = 0;
            words.forEach(w => {
                const origStyle = w.style.cssText;
                w.style.cssText = 'position:relative;display:inline-block;visibility:hidden;';
                maxW = Math.max(maxW, w.offsetWidth);
                w.style.cssText = origStyle;
            });
            container.style.width = (maxW + 2) + 'px';
        };

        // Run immediately
        updateWidths();

        // Run when fonts are fully ready to prevent font-swap layout jumps
        if (document.fonts) {
            document.fonts.ready.then(updateWidths);
        }

        // Show first word immediately
        words[0].classList.add('active');
        words[0].style.position = 'relative';

        setInterval(() => {
            const prev = current;
            current = (current + 1) % words.length;

            // Exit the current one
            words[prev].classList.remove('active');
            words[prev].classList.add('exit');
            words[prev].style.position = 'absolute';
            setTimeout(() => words[prev].classList.remove('exit'), 350);

            // Enter the next one
            words[current].style.position = 'relative';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    words[current].classList.add('active');
                });
            });
        }, 2200);
    }
});

// ================================================================
// CURSOR
// ================================================================
const cursor   = document.getElementById('custom-cursor');
const follower = document.getElementById('custom-cursor-follower');
const glow     = document.getElementById('cursor-glow');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursor)  { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
    if (glow)    { glow.style.left   = mx + 'px'; glow.style.top  = my + 'px'; }
});

(function loop() {
    fx += (mx - fx) * 0.13;
    fy += (my - fy) * 0.13;
    if (follower) { follower.style.left = fx + 'px'; follower.style.top = fy + 'px'; }
    requestAnimationFrame(loop);
})();

// Cursor expand on interactive elements
document.querySelectorAll('a, button, .tool-circle, .work-card, .expertise-card, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (!cursor) return;
        cursor.style.width = '46px'; cursor.style.height = '46px';
        cursor.style.background = 'rgba(255,87,34,.1)';
    });
    el.addEventListener('mouseleave', () => {
        if (!cursor) return;
        cursor.style.width = '22px'; cursor.style.height = '22px';
        cursor.style.background = 'transparent';
    });
});

// ================================================================
// MAGNETIC TILT on work cards
// ================================================================
document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `scale(1.014) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(() => card.style.transition = '', 500);
    });
});

// ================================================================
// TEXT SCRAMBLE on section headings (hover)
// ================================================================
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
function scramble(el) {
    const orig = el.textContent;
    let iter = 0;
    const total = 12;
    const interval = setInterval(() => {
        el.textContent = orig.split('').map((c, i) => {
            if (c === ' ' || c === '\n') return c;
            if (i < iter) return orig[i];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        iter += 1.5;
        if (iter > orig.length) { el.textContent = orig; clearInterval(interval); }
    }, 30);
}
document.querySelectorAll('.section-heading-center').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el));
});

// ================================================================
// TOOL CIRCLES — colored glow on hover
// ================================================================
document.querySelectorAll('.tool-circle').forEach(el => {
    const name  = el.dataset.name;
    const color = el.dataset.color || '#FF5722';
    // tooltip
    const tip = document.createElement('span');
    tip.className = 'tool-tooltip';
    tip.textContent = name || '';
    el.appendChild(tip);

    el.addEventListener('mouseenter', () => {
        el.style.boxShadow    = `0 16px 32px ${color}55`;
        el.style.borderColor  = color;
        el.style.background   = `${color}18`;
        const icon = el.querySelector('i');
        if (icon) icon.style.color = color;
    });
    el.addEventListener('mouseleave', () => {
        el.style.boxShadow   = '';
        el.style.borderColor = '';
        el.style.background  = '';
        const icon = el.querySelector('i');
        if (icon) icon.style.color = '';
    });
});

// ================================================================
// SCROLL REVEAL + STACK-UP
// ================================================================
const revealObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            const delay = e.target.style.getPropertyValue('--stack-delay') || '0s';
            setTimeout(() => {
                e.target.classList.add('visible');
            }, i * 60);
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Section-level stack-up via IntersectionObserver (non-.reveal elements)
const stackObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting && !e.target.closest('.hero')) {
            // If the element itself is a stack-up but NOT a .reveal (hero section items)
            if (!e.target.classList.contains('reveal')) {
                e.target.style.animationPlayState = 'running';
            }
            stackObs.unobserve(e.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.stack-up:not(.reveal)').forEach(el => {
    // Hero elements are always visible (above fold)
    if (!el.closest('.hero')) {
        el.style.animationPlayState = 'paused';
        stackObs.observe(el);
    }
});

// ================================================================
// CONNECT MODAL
// ================================================================
const connectBtn   = document.getElementById('connect-btn');
const connectModal = document.getElementById('connect-modal');

connectBtn?.addEventListener('click', e => {
    e.preventDefault();
    connectModal.classList.add('active');
    body.style.overflow = 'hidden';
});
connectModal?.addEventListener('click', e => {
    if (e.target === connectModal) {
        connectModal.classList.remove('active');
        body.style.overflow = '';
    }
});

// ================================================================
// SNAKE GAME
// ================================================================
const gameBtn    = document.getElementById('open-game-btn');
const gameModal  = document.getElementById('game-modal');
const closeGame  = document.getElementById('close-game');
const canvas     = document.getElementById('snake-canvas');
const ctx        = canvas?.getContext('2d');
const scoreEl    = document.getElementById('game-score');
const bestEl     = document.getElementById('game-best');
const gameOverEl = document.getElementById('game-over-text');
const finalEl    = document.getElementById('final-score');
const pauseBtn   = document.getElementById('pause-game-btn');
const restartBtn = document.getElementById('restart-game-btn');

const CELL = 16, COLS = 20, ROWS = 20;
let snake, food, dx, dy, score, ticker, paused, dead;
let bestScore = parseInt(localStorage.getItem('snakeBest') || '0');

function updateBest() {
    if (bestEl) bestEl.textContent = bestScore;
}
updateBest();

function startGame() {
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dx = 1; dy = 0; score = 0; paused = false; dead = false;
    if (scoreEl) scoreEl.textContent = 0;
    if (gameOverEl) gameOverEl.classList.add('hidden');
    if (pauseBtn) pauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
    placeFood();
    clearInterval(ticker);
    ticker = setInterval(tick, 160);
}

function placeFood() {
    do { food = {x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
    while (snake.some(s=>s.x===food.x&&s.y===food.y));
}

function tick() {
    if (paused || dead) return;
    const h = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(h);
    if (h.x===food.x && h.y===food.y) {
        score += 10;
        if (scoreEl) scoreEl.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('snakeBest', bestScore);
            updateBest();
        }
        placeFood();
    } else { snake.pop(); }
    if (h.x<0||h.x>=COLS||h.y<0||h.y>=ROWS||snake.slice(1).some(s=>s.x===h.x&&s.y===h.y)) {
        dead = true; clearInterval(ticker);
        if (gameOverEl) gameOverEl.classList.remove('hidden');
        if (finalEl) finalEl.textContent = 'Score: ' + score;
    }
    draw();
}

function draw() {
    if (!ctx) return;
    const dark = body.classList.contains('dark-mode');
    ctx.fillStyle = dark ? '#0a0a0a' : '#fffcf3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i=0;i<=COLS;i++) { ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,canvas.height); ctx.stroke(); }
    for (let j=0;j<=ROWS;j++) { ctx.beginPath(); ctx.moveTo(0,j*CELL); ctx.lineTo(canvas.width,j*CELL); ctx.stroke(); }

    // food — pulsing glow effect
    const t = Date.now() / 500;
    const glow = 3 + Math.sin(t) * 2;
    ctx.shadowColor = '#ff5722';
    ctx.shadowBlur = glow * 3;
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // snake
    snake.forEach((s,i) => {
        const t = i/snake.length;
        ctx.fillStyle = i===0 ? '#00c896' : `hsl(${155-t*45},75%,${42+t*18}%)`;
        if (i===0) {
            ctx.shadowColor = '#00c896';
            ctx.shadowBlur = 8;
        }
        const m=2, r=5, x=s.x*CELL+m, y=s.y*CELL+m, w=CELL-m*2, h=CELL-m*2;
        ctx.beginPath();
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function togglePause() {
    if (dead) return;
    paused = !paused;
    if (pauseBtn) pauseBtn.innerHTML = paused ? '<i class="ri-play-line"></i>' : '<i class="ri-pause-line"></i>';
}

function closeGameFn() {
    if (gameModal) gameModal.classList.remove('active');
    body.style.overflow = '';
    paused = true;
    clearInterval(ticker);
}

// Keyboard
document.addEventListener('keydown', e => {
    if (!gameModal?.classList.contains('active')) return;
    const k = e.key;
    if ((k==='ArrowUp'   ||k==='w') && dy===0)  {dx=0;dy=-1;}
    if ((k==='ArrowDown' ||k==='s') && dy===0)  {dx=0;dy=1;}
    if ((k==='ArrowLeft' ||k==='a') && dx===0)  {dx=-1;dy=0;}
    if ((k==='ArrowRight'||k==='d') && dx===0)  {dx=1;dy=0;}
    if (k===' ')   { e.preventDefault(); togglePause(); }
    if (k==='Escape') closeGameFn();
});

gameBtn?.addEventListener('click', () => {
    if (gameModal) gameModal.classList.add('active');
    body.style.overflow = 'hidden';
    startGame();
});
closeGame?.addEventListener('click', closeGameFn);
gameModal?.addEventListener('click', e => { if (e.target===gameModal) closeGameFn(); });
pauseBtn?.addEventListener('click', togglePause);
restartBtn?.addEventListener('click', startGame);

// ================================================================
// CAT — pupil tracking
// ================================================================
const catPupilL = document.querySelector('.cat-pupil-l');
const catPupilR = document.querySelector('.cat-pupil-r');
document.addEventListener('mousemove', e => {
    if (!catPupilL || !catPupilR) return;
    const cat = document.querySelector('.cat-svg');
    if (!cat) return;
    const rect = cat.getBoundingClientRect();
    // Centre of head (roughly top 45% of SVG)
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height * 0.44;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const r = 2;
    catPupilL.setAttribute('cx', 46 + Math.cos(angle) * r);
    catPupilL.setAttribute('cy', 49 + Math.sin(angle) * r);
    catPupilR.setAttribute('cx', 70 + Math.cos(angle) * r);
    catPupilR.setAttribute('cy', 49 + Math.sin(angle) * r);
});
