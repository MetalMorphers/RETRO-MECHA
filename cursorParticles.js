// === Initialisation du canvas pour particules ===
const cursorCanvas = document.getElementById('cursorParticles');
const ctx = cursorCanvas.getContext('2d');

// Style global du canvas
cursorCanvas.style.position = 'fixed';
cursorCanvas.style.top = '0';
cursorCanvas.style.left = '0';
cursorCanvas.style.pointerEvents = 'none';
cursorCanvas.style.zIndex = '10'; // Au-dessus du jeu

// Redimensionner le canvas
function resizeCursorCanvas() {
  cursorCanvas.width = window.innerWidth;
  cursorCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCursorCanvas);
resizeCursorCanvas();

// === Variables pour le suivi fluide ===
let cursorTargetX = window.innerWidth / 2;
let cursorTargetY = window.innerHeight / 2;
let cursorCurrentX = cursorTargetX;
let cursorCurrentY = cursorTargetY;
const followSpeed = 0.15;

// === Variables d'inactivité
let isMouseDown = false;
let isTouchActive = false;
let inactivityTimeout = null;

// === Particules ===
const particles = [];
const maxParticles = 40;

function spawnParticle(x, y) {
  particles.push({
    x,
    y,
    size: Math.random() * 3 + 2,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    life: 1
  });

  if (particles.length > maxParticles) particles.shift();
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
  });
}

// === Animation du curseur avec particules ===
function animateCursorParticles() {
  // Suivi fluide
  cursorCurrentX += (cursorTargetX - cursorCurrentX) * followSpeed;
  cursorCurrentY += (cursorTargetY - cursorCurrentY) * followSpeed;

  // Spawn particules au centre
  spawnParticle(cursorCurrentX, cursorCurrentY);
  updateParticles();

  // Effacer le canvas
  ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

  // Dessiner les particules
  particles.forEach(p => {
    if (p.life <= 0) return;
    ctx.fillStyle = `rgba(108, 92, 37, ${p.life})`; // couleur #6c5c25 avec transparence
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });

  requestAnimationFrame(animateCursorParticles);
}
animateCursorParticles();

// === Fonction pour recentrer le curseur
function centerCursor() {
  const rect = canvasViewport.getBoundingClientRect();
  cursorTargetX = rect.left + rect.width / 2;
  cursorTargetY = rect.top + rect.height / 2;
}

// === Gérer inactivité
function resetInactivityTimeout() {
  clearTimeout(inactivityTimeout);
  if (!isMouseDown && !isTouchActive) {
    inactivityTimeout = setTimeout(() => {
      centerCursor();
    }, 500);
  }
}

// === Vérifie si événement est dans le canvas
function isInsideCanvas(event) {
  const rect = canvasViewport.getBoundingClientRect();
  const x = event.clientX || (event.touches && event.touches[0].clientX);
  const y = event.clientY || (event.touches && event.touches[0].clientY);
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// === Mouvements et interactions
canvasViewport.addEventListener('mousemove', e => {
  if (!isInsideCanvas(e)) return;
  cursorTargetX = e.clientX;
  cursorTargetY = e.clientY;
  clearTimeout(inactivityTimeout);
  resetInactivityTimeout();
});

canvasViewport.addEventListener('mousedown', e => {
  if (!isInsideCanvas(e)) return;
  isMouseDown = true;
  cursorTargetX = e.clientX;
  cursorTargetY = e.clientY;
  clearTimeout(inactivityTimeout);
});

canvasViewport.addEventListener('mouseup', e => {
  isMouseDown = false;
  resetInactivityTimeout();
  centerCursor();
});

canvasViewport.addEventListener('touchmove', e => {
  if (!isInsideCanvas(e)) return;
  const touch = e.touches[0];
  cursorTargetX = touch.clientX;
  cursorTargetY = touch.clientY;
  isTouchActive = true;
  resetInactivityTimeout();
});

canvasViewport.addEventListener('touchstart', () => {
  isTouchActive = true;
  clearTimeout(inactivityTimeout);
});

canvasViewport.addEventListener('touchend', () => {
  isTouchActive = false;
  centerCursor();
});

canvasViewport.addEventListener('mouseleave', () => {
  document.body.style.cursor = 'crosshair';
  centerCursor();
});

canvasViewport.addEventListener('mouseenter', () => {
  document.body.style.cursor = 'none';
});

window.addEventListener('load', () => {
  centerCursor();
});
