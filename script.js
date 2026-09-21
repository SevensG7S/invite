// --- State Management ---
const state = {
  selectedDate: null,
  selectedTime: '17:30',
  wish: '',
  comment: '',
  noEvadeCount: 0
};

// Phrases for the runaway "No" button
const noPhrases = [
  "Нет 🙈",
  "Уверена? 🥺",
  "Подумай еще разок!",
  "Кнопка сломалась 🙃",
  "Так просто не сдашься!",
  "Только ДА! ❤️"
];

const hints = [
  "",
  "Хм, кажется, эта кнопка не хочет нажиматься... ✨",
  "Она постоянно убегает! Может, это знак? 😉",
  "Остался единственный правильный выбор! 🌸",
  "Ну всё, кнопка сдалась и исчезла! 🥰"
];

// --- DOM Elements ---
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const buttonsArea = document.getElementById('buttons-area');
const noHint = document.getElementById('no-hint');

const datesContainer = document.getElementById('dates-container');
const timeChips = document.querySelectorAll('.chip-btn');
const customTimeBtn = document.getElementById('custom-time-btn');
const customTimeWrap = document.getElementById('custom-time-wrap');
const customTimeInput = document.getElementById('custom-time-input');

const wishInput = document.getElementById('wish-input');
const commentInput = document.getElementById('comment-input');

const btnConfirm = document.getElementById('btn-confirm');
const sumDate = document.getElementById('sum-date');
const sumTime = document.getElementById('sum-time');
const sumWish = document.getElementById('sum-wish');
const sumComment = document.getElementById('sum-comment');
const sumWishWrap = document.getElementById('sum-wish-wrap');
const sumCommentWrap = document.getElementById('sum-comment-wrap');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  createBackgroundHearts();
  generateDynamicDates(11); // ~1.5 weeks ahead
  setupEventListeners();
});

// --- Dynamic Date Generator (~1.5 weeks) ---
function generateDynamicDates(daysCount = 11) {
  datesContainer.innerHTML = '';
  const today = new Date();

  const dayNamesShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNames = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    let dayTitle;
    if (i === 0) dayTitle = 'Сегодня';
    else if (i === 1) dayTitle = 'Завтра';
    else dayTitle = dayNamesShort[d.getDay()];

    const dayNum = d.getDate();
    const monthStr = monthNames[d.getMonth()];

    // Format full value for summary (e.g. "Пятница, 25 сен")
    const fullDayName = d.toLocaleDateString('ru-RU', { weekday: 'long' });
    const fullFormatted = `${capitalize(dayTitle === 'Сегодня' || dayTitle === 'Завтра' ? `${dayTitle} (${fullDayName})` : fullDayName)}, ${dayNum} ${monthStr}`;

    const chip = document.createElement('div');
    chip.className = `date-chip ${i === 1 ? 'active' : ''}`; // Default to "Завтра" or today if weekend
    chip.dataset.dateValue = fullFormatted;

    chip.innerHTML = `
      <span class="day-name">${dayTitle}</span>
      <span class="day-num">${dayNum}</span>
      <span class="month-name">${monthStr}</span>
    `;

    chip.addEventListener('click', () => {
      document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedDate = chip.dataset.dateValue;
      createMiniSparkle(chip);
    });

    datesContainer.appendChild(chip);

    if (i === 1 || (i === 0 && !state.selectedDate)) {
      state.selectedDate = fullFormatted;
    }
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Runaway "No" Button Logic ---
function setupRunawayButton() {
  const evade = (e) => {
    e.preventDefault();
    state.noEvadeCount++;

    // Change button phrase
    const phraseIdx = Math.min(state.noEvadeCount, noPhrases.length - 1);
    btnNo.querySelector('span').innerText = noPhrases[phraseIdx];

    // Show funny hint
    const hintIdx = Math.min(state.noEvadeCount, hints.length - 1);
    noHint.innerText = hints[hintIdx];
    noHint.style.opacity = '1';

    // Spawn tiny heart particles at current position
    createMiniHeartsAt(btnNo);

    // If tried 5 times, fade out and disappear
    if (state.noEvadeCount >= 5) {
      btnNo.style.transform = 'scale(0) rotate(180deg)';
      btnNo.style.opacity = '0';
      btnNo.style.pointerEvents = 'none';
      setTimeout(() => {
        btnNo.style.display = 'none';
        btnYes.style.transform = 'scale(1.1)';
        btnYes.style.boxShadow = '0 0 35px rgba(255, 107, 139, 0.8)';
      }, 300);
      return;
    }

    // Calculate boundary within container
    const containerRect = buttonsArea.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Random safe offsets
    const maxOffsetLeft = 80;
    const maxOffsetTop = 50;

    const randomX = (Math.random() - 0.5) * (maxOffsetLeft * 2);
    const randomY = (Math.random() - 0.5) * (maxOffsetTop * 2);

    btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.92)`;
  };

  // Works on both desktop hover and mobile touch/pointer
  btnNo.addEventListener('mouseenter', evade);
  btnNo.addEventListener('touchstart', evade, { passive: false });
  btnNo.addEventListener('pointerdown', evade);
  btnNo.addEventListener('click', evade);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  setupRunawayButton();

  // Yes button -> Go to Step 2
  btnYes.addEventListener('click', () => {
    triggerConfetti(0.4);
    switchStep(step1, step2);
  });

  // Time Chips Selection
  timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      timeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      if (chip.id === 'custom-time-btn') {
        customTimeWrap.classList.remove('hidden');
        customTimeInput.focus();
        state.selectedTime = customTimeInput.value || '19:00';
      } else {
        customTimeWrap.classList.add('hidden');
        state.selectedTime = chip.dataset.time;
      }
    });
  });

  customTimeInput.addEventListener('input', (e) => {
    state.selectedTime = e.target.value;
  });

  // Confirm Selection -> Step 3
  btnConfirm.addEventListener('click', async () => {
    state.wish = wishInput.value.trim();
    state.comment = commentInput.value.trim();

    // Fill summary values
    sumDate.innerText = state.selectedDate || 'В любой удобный день';
    sumTime.innerText = state.selectedTime || '17:30';

    if (state.wish) {
      sumWish.innerText = state.wish;
      sumWishWrap.style.display = 'flex';
    } else {
      sumWishWrap.style.display = 'none';
    }

    if (state.comment) {
      sumComment.innerText = state.comment;
      sumCommentWrap.style.display = 'flex';
    } else {
      sumCommentWrap.style.display = 'none';
    }

    switchStep(step2, step3);
    triggerBigCelebration();

    // Disable button to prevent double-clicks
    btnConfirm.disabled = true;
    btnConfirm.style.pointerEvents = 'none';
    btnConfirm.style.opacity = '0.7';

    // Send payload directly to Google Sheets (single reliable request)
    const payload = {
      date: state.selectedDate,
      time: state.selectedTime,
      wish: state.wish,
      comment: state.comment,
      timestamp: new Date().toLocaleString('ru-RU')
    };

    try {
      fetch('https://script.google.com/macros/s/AKfycbwsZLU4J0bWaag7JCk3t4aunWfaFxWgvDRgGeiE1m5qPwREnI4weY-ipnTeYBiJWTGydw/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  });
}

// --- Helper Functions ---
function switchStep(fromStep, toStep) {
  fromStep.classList.remove('active');
  setTimeout(() => {
    toStep.classList.add('active');
  }, 200);
}

function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Subtle background hearts
function createBackgroundHearts() {
  const container = document.getElementById('hearts-container');
  const symbols = ['🤍', '🌸', '✨', '💖', '🧸', '🌷'];

  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${5 + Math.random() * 6}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    heart.style.fontSize = `${0.9 + Math.random() * 1.2}rem`;
    container.appendChild(heart);
  }
}

function createMiniHeartsAt(element) {
  const rect = element.getBoundingClientRect();
  const heart = document.createElement('span');
  heart.innerText = '💨';
  heart.style.position = 'fixed';
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top}px`;
  heart.style.fontSize = '1.2rem';
  heart.style.pointerEvents = 'none';
  heart.style.transition = 'all 0.6s ease-out';
  heart.style.zIndex = '999';
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.transform = `translateY(-30px) scale(1.4)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => heart.remove(), 600);
}

function createMiniSparkle(element) {
  const rect = element.getBoundingClientRect();
  const sparkle = document.createElement('span');
  sparkle.innerText = '✨';
  sparkle.style.position = 'fixed';
  sparkle.style.left = `${rect.left + rect.width / 2 - 8}px`;
  sparkle.style.top = `${rect.top - 10}px`;
  sparkle.style.fontSize = '1.2rem';
  sparkle.style.pointerEvents = 'none';
  sparkle.style.transition = 'all 0.5s ease-out';
  sparkle.style.zIndex = '999';
  document.body.appendChild(sparkle);

  requestAnimationFrame(() => {
    sparkle.style.transform = `translateY(-20px) scale(1.3)`;
    sparkle.style.opacity = '0';
  });

  setTimeout(() => sparkle.remove(), 500);
}

// Confetti effects
function triggerConfetti(durationMultiplier = 1) {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: Math.floor(60 * durationMultiplier),
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#ff758c', '#ff7eb3', '#fbc2eb', '#ffffff']
  });
}

function triggerBigCelebration() {
  if (typeof confetti !== 'function') return;
  
  const end = Date.now() + 2.5 * 1000;
  const colors = ['#ff758c', '#ff7eb3', '#ffd166', '#a18cd1', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: colors
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
