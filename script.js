const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const toGameBtn = document.getElementById('to-game');
const toMemoriesBtn = document.getElementById('to-memories');
const toMarch8Btn = document.getElementById('to-march8');
const restartGameBtn = document.getElementById('restart-game');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const pairsTotalEl = document.getElementById('pairs-total');
const gameMessageEl = document.getElementById('game-message');
const memoryGridEl = document.getElementById('memory-grid');
const togetherTimerEl = document.getElementById('together-timer');
const introHeartEl = document.getElementById('intro-heart');
const photoModalEl = document.getElementById('photo-modal');
const photoModalImageEl = document.getElementById('photo-modal-image');
const photoModalCloseEl = document.getElementById('photo-modal-close');

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
}

startBtn.addEventListener('click', () => showScreen('screen2'));
toGameBtn.addEventListener('click', () => showScreen('screen3'));
toMemoriesBtn.addEventListener('click', () => showScreen('screen4'));
toMarch8Btn.addEventListener('click', () => showScreen('screen5'));

// Hearts checkbox behavior on screen 2.
document.querySelectorAll('.reason-item .heart-check').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.reason-item');
    const willSelect = !item.classList.contains('selected');

    item.classList.toggle('selected', willSelect);
    button.textContent = willSelect ? '💗' : '🤍';
    button.setAttribute('aria-pressed', String(willSelect));
  });
});

// Memory game.
const baseSymbols = ['🐻', '🌸', '💖', '🎀', '🍓', '💌'];
const compactGameMedia = window.matchMedia('(max-width: 420px)');
let symbols = baseSymbols;
let deck = [];
let openCards = [];
let lockBoard = false;
let moves = 0;
let pairs = 0;

function shuffle(arr) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function setGameText(message) {
  gameMessageEl.textContent = message;
}

function updateStats() {
  movesEl.textContent = String(moves);
  pairsEl.textContent = String(pairs);
}

function closeCard(card) {
  card.classList.remove('open');
  card.textContent = '?';
}

function finishGame() {
  setGameText('Ты нашла все пары. Сюрприз открыт ❤️');
  toMemoriesBtn.disabled = false;
}

function onCardClick(card) {
  if (lockBoard || card.classList.contains('open') || card.classList.contains('matched')) {
    return;
  }

  card.classList.add('open');
  card.textContent = card.dataset.symbol;
  openCards.push(card);

  if (openCards.length < 2) {
    return;
  }

  moves += 1;
  updateStats();

  const [first, second] = openCards;
  const isMatch = first.dataset.symbol === second.dataset.symbol;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    openCards = [];
    pairs += 1;
    updateStats();
    setGameText('Отлично! Это пара.');

    if (pairs === symbols.length) {
      finishGame();
    }
    return;
  }

  lockBoard = true;
  setGameText('Не совпало. Попробуй еще.');

  setTimeout(() => {
    closeCard(first);
    closeCard(second);
    openCards = [];
    lockBoard = false;
  }, 850);
}

function renderGame() {
  deck = shuffle([...symbols, ...symbols]);
  memoryGridEl.innerHTML = '';
  deck.forEach((symbol) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-card-btn';
    card.dataset.symbol = symbol;
    card.textContent = '?';
    card.addEventListener('click', () => onCardClick(card));
    memoryGridEl.appendChild(card);
  });
}

function startGameBoard() {
  symbols = compactGameMedia.matches ? baseSymbols.slice(0, 4) : baseSymbols;
  openCards = [];
  lockBoard = false;
  moves = 0;
  pairs = 0;
  toMemoriesBtn.disabled = true;
  if (pairsTotalEl) pairsTotalEl.textContent = String(symbols.length);
  updateStats();
  setGameText('Открой две карточки.');
  renderGame();
}

restartGameBtn.addEventListener('click', startGameBoard);

// Shows placeholder for missing gallery images.
document.querySelectorAll('.memory-card img').forEach((image) => {
  const wrap = image.closest('.photo-wrap');
  const setLoaded = () => wrap.classList.remove('is-empty');
  const setMissing = () => wrap.classList.add('is-empty');

  image.addEventListener('load', setLoaded);
  image.addEventListener('error', setMissing);

  if (image.complete && image.naturalWidth > 0) {
    setLoaded();
  }
});

// "How long together" timer.
function updateTogetherTimer() {
  if (!togetherTimerEl) return;
  const startDateRaw = togetherTimerEl.dataset.startDate || '';
  const match = startDateRaw.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return;

  const [, y, m, d, hh, mm, ss = '0'] = match;
  // Build local datetime explicitly to avoid browser parsing quirks.
  const startDate = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss)
  );

  const now = new Date();
  const diffMs = Math.max(now.getTime() - startDate.getTime(), 0);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  document.getElementById('timer-days').textContent = String(days);
}

updateTogetherTimer();
setInterval(updateTogetherTimer, 30000);

// Intro heart animation.
function hideIntroHeart() {
  if (!introHeartEl) return;
  introHeartEl.classList.add('is-hidden');
  setTimeout(() => introHeartEl.remove(), 450);
}

const introReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(hideIntroHeart, introReduceMotion ? 300 : 1400);

// Polaroid photo viewer.
function openPhotoModal(image) {
  if (!photoModalEl || !photoModalImageEl || !image?.src) return;
  photoModalImageEl.src = image.src;
  photoModalImageEl.alt = image.alt || 'Фото';
  photoModalEl.classList.add('is-open');
  photoModalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closePhotoModal() {
  if (!photoModalEl || !photoModalImageEl) return;
  photoModalEl.classList.remove('is-open');
  photoModalEl.setAttribute('aria-hidden', 'true');
  photoModalImageEl.removeAttribute('src');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.photo-wrap img').forEach((image) => {
  image.addEventListener('click', () => {
    if (image.closest('.photo-wrap').classList.contains('is-empty')) return;
    openPhotoModal(image);
  });
});

if (photoModalCloseEl && photoModalEl) {
  photoModalCloseEl.addEventListener('click', closePhotoModal);
  photoModalEl.addEventListener('click', (event) => {
    if (event.target === photoModalEl) closePhotoModal();
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePhotoModal();
});

// Falling hearts in background on all screens.
const heartRain = document.getElementById('heart-rain');
const mobileMedia = window.matchMedia('(max-width: 700px)');
const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

let isMobile = mobileMedia.matches;
let reduceMotion = motionMedia.matches;
let maxHearts = isMobile ? 22 : 40;
let heartSpawnRate = isMobile ? 340 : 240;
let heartIntervalId = null;

function canAnimateHearts() {
  return !reduceMotion && !document.hidden;
}

function spawnHeart() {
  if (!canAnimateHearts()) return;
  if (heartRain.childElementCount >= maxHearts) return;

  const heart = document.createElement('span');
  heart.className = 'bg-heart';
  heart.textContent = Math.random() > 0.86 ? '💖' : '💗';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${isMobile ? 12 + Math.random() * 9 : 14 + Math.random() * 14}px`;
  heart.style.animationDuration = `${isMobile ? 7 + Math.random() * 5 : 6 + Math.random() * 5}s`;
  heart.style.setProperty('--drift', `${-24 + Math.random() * 48}px`);
  heartRain.appendChild(heart);

  heart.addEventListener('animationend', () => {
    heart.remove();
  });
}

function startHearts() {
  if (heartIntervalId) clearInterval(heartIntervalId);
  if (!canAnimateHearts()) return;
  heartIntervalId = setInterval(spawnHeart, heartSpawnRate);
}

document.addEventListener('visibilitychange', startHearts);
const onMobileMediaChange = (event) => {
  isMobile = event.matches;
  maxHearts = isMobile ? 22 : 40;
  heartSpawnRate = isMobile ? 340 : 240;
  startHearts();
};
const onMotionMediaChange = (event) => {
  reduceMotion = event.matches;
  startHearts();
};

if (mobileMedia.addEventListener) {
  mobileMedia.addEventListener('change', onMobileMediaChange);
  motionMedia.addEventListener('change', onMotionMediaChange);
  compactGameMedia.addEventListener('change', startGameBoard);
} else {
  mobileMedia.addListener(onMobileMediaChange);
  motionMedia.addListener(onMotionMediaChange);
  compactGameMedia.addListener(startGameBoard);
}

startHearts();
for (let i = 0; i < (isMobile ? 10 : 18); i += 1) {
  setTimeout(spawnHeart, i * (isMobile ? 190 : 140));
}

startGameBoard();
showScreen('screen1');
