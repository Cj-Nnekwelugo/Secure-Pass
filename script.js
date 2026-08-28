// ==========================================================
// Password Generator App
// Handles generation, strength scoring, history, theme toggle,
// and local storage interactions for a production-style UI.
// ==========================================================

const STORAGE_KEYS = {
  history: 'securepass-history',
  theme: 'securepass-theme',
};

const TYPE_LABELS = {
  uppercase: 'Uppercase',
  lowercase: 'Lowercase',
  numbers: 'Numbers',
  symbols: 'Symbols',
};

const WORD_BANK = [
  'Aurora', 'Harbor', 'Summit', 'Cinder', 'Drift', 'Lunar', 'Velvet', 'Beacon',
  'Raven', 'Frost', 'Comet', 'Solar', 'Breeze', 'Summon', 'Warden', 'Cobalt',
  'Signal', 'Pine', 'Maple', 'Pioneer', 'North', 'Echo', 'Quartz', 'Phantom'
];

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?~',
};

const DEFAULT_SETTINGS = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
  memorable: false,
};

const state = {
  settings: { ...DEFAULT_SETTINGS },
  history: [],
  passwordVisible: false,
};

const elements = {
  body: document.body,
  themeToggle: document.getElementById('theme-toggle'),
  themeText: document.querySelector('.theme-text'),
  themeIcon: document.querySelector('.theme-icon'),
  passwordOutput: document.getElementById('password-output'),
  lengthSlider: document.getElementById('length-slider'),
  lengthValue: document.getElementById('length-value'),
  uppercase: document.getElementById('uppercase'),
  lowercase: document.getElementById('lowercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
  excludeSimilar: document.getElementById('exclude-similar'),
  excludeAmbiguous: document.getElementById('exclude-ambiguous'),
  toggleVisibility: document.getElementById('toggle-visibility'),
  copyPassword: document.getElementById('copy-password'),
  regeneratePassword: document.getElementById('regenerate-password'),
  generatePassword: document.getElementById('generate-password'),
  memorableToggle: document.getElementById('memorable-toggle'),
  strengthLabel: document.getElementById('strength-label'),
  strengthFill: document.getElementById('strength-fill'),
  historyList: document.getElementById('history-list'),
  clearHistory: document.getElementById('clear-history'),
  presetButtons: document.querySelectorAll('.preset-btn'),
  toastContainer: document.getElementById('toast-container'),
};

// ==========================================================
// Utility functions
// ==========================================================

function loadThemeFromStorage() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === 'light') {
    elements.body.classList.add('light');
    elements.themeText.textContent = 'Light';
    elements.themeIcon.textContent = '☀️';
  } else {
    elements.body.classList.remove('light');
    elements.themeText.textContent = 'Dark';
    elements.themeIcon.textContent = '🌙';
  }
}

function saveThemeToStorage(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function getSelectedTypes() {
  return Object.keys(TYPE_LABELS).filter((type) => state.settings[type]);
}

function setLengthValue() {
  elements.lengthValue.textContent = String(state.settings.length);
  elements.lengthSlider.value = String(state.settings.length);
}

function clampLength(value) {
  if (value < 4) {
    return 4;
  }
  if (value > 64) {
    return 64;
  }
  return value;
}

function sanitizeSettings() {
  state.settings.length = clampLength(Number(state.settings.length) || DEFAULT_SETTINGS.length);

  const selectedCount = getSelectedTypes().length;
  if (selectedCount === 0) {
    state.settings.uppercase = true;
    state.settings.lowercase = true;
    state.settings.numbers = true;
    state.settings.symbols = true;
    showToast('At least one character type must remain selected.', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

function updateCheckboxesFromState() {
  elements.uppercase.checked = state.settings.uppercase;
  elements.lowercase.checked = state.settings.lowercase;
  elements.numbers.checked = state.settings.numbers;
  elements.symbols.checked = state.settings.symbols;
  elements.excludeSimilar.checked = state.settings.excludeSimilar;
  elements.excludeAmbiguous.checked = state.settings.excludeAmbiguous;
  elements.memorableToggle.classList.toggle('is-active', state.settings.memorable);
  elements.memorableToggle.textContent = state.settings.memorable ? 'Memorable On' : 'Memorable Mode';
}

function applyPresetHighlight() {
  elements.presetButtons.forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.length) === state.settings.length);
  });
}

function updateStrengthIndicator(password) {
  if (!password) {
    elements.strengthLabel.textContent = 'Very Weak';
    elements.strengthLabel.style.color = 'var(--strength-0)';
    elements.strengthFill.style.width = '0%';
    return;
  }

  let score = 0;
  const length = password.length;
  const charTypes = new Set();

  if (/[A-Z]/.test(password)) charTypes.add('uppercase');
  if (/[a-z]/.test(password)) charTypes.add('lowercase');
  if (/[0-9]/.test(password)) charTypes.add('numbers');
  if (/[^A-Za-z0-9]/.test(password)) charTypes.add('symbols');

  score += Math.min(length * 2.5, 40);
  score += charTypes.size * 14;

  if (length >= 12) score += 12;
  if (length >= 16) score += 12;
  if (length >= 20) score += 12;
  if (length >= 32) score += 10;

  if (charTypes.size === 4 && length >= 14) score += 15;
  if (charTypes.size === 3 && length >= 10) score += 8;

  const normalized = Math.max(0, Math.min(100, score));

  let label = 'Very Weak';
  let color = 'var(--strength-0)';

  if (normalized >= 85) {
    label = 'Very Strong';
    color = 'var(--strength-4)';
  } else if (normalized >= 70) {
    label = 'Strong';
    color = 'var(--strength-3)';
  } else if (normalized >= 50) {
    label = 'Medium';
    color = 'var(--strength-2)';
  } else if (normalized >= 30) {
    label = 'Weak';
    color = 'var(--strength-1)';
  }

  elements.strengthFill.style.width = `${normalized}%`;
  elements.strengthFill.style.background = `linear-gradient(90deg, ${color}, #7dd3fc)`;
  elements.strengthLabel.textContent = label;
  elements.strengthLabel.style.color = color;
}

function getFilteredCharset(type) {
  let chars = CHAR_SETS[type];

  if (state.settings.excludeSimilar) {
    const similarChars = {
      uppercase: 'O0I1l',
      lowercase: 'oO0l1iI',
      numbers: '01Il',
      symbols: '',
    };
    chars = chars.split('').filter((char) => !similarChars[type]?.includes(char)).join('');
  }

  if (state.settings.excludeAmbiguous) {
    const ambiguous = /[0OIl1{}()\[\]/\\|`~'"<>]/g;
    chars = chars.split('').filter((char) => !ambiguous.test(char)).join('');
  }

  return chars;
}

function secureRandomInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function pickRandomChar(chars) {
  if (!chars || chars.length === 0) {
    return '';
  }

  return chars[secureRandomInt(chars.length)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateFromCharacterSets() {
  const selectedTypes = getSelectedTypes();
  if (selectedTypes.length === 0) {
    showToast('No character types selected. Please enable at least one option.', 'error');
    return '';
  }

  const requiredChars = [];
  const pool = [];

  selectedTypes.forEach((type) => {
    const charset = getFilteredCharset(type);
    const chosen = pickRandomChar(charset);
    if (!chosen) {
      return;
    }
    requiredChars.push(chosen);
    pool.push(...charset.split(''));
  });

  if (requiredChars.length === 0) {
    showToast('Unable to generate password with the current settings.', 'error');
    return '';
  }

  const finalChars = [...requiredChars];
  const remainingLength = state.settings.length - finalChars.length;

  for (let i = 0; i < remainingLength; i += 1) {
    const randomSource = pool.length > 0 ? pool : selectedTypes.flatMap((type) => getFilteredCharset(type).split(''));
    const nextChar = pickRandomChar(randomSource.join(''));
    if (!nextChar) {
      continue;
    }
    finalChars.push(nextChar);
  }

  return shuffleArray(finalChars).join('');
}

function generateMemorablePassword() {
  const targetLength = state.settings.length;
  const parts = [];
  const wordCount = Math.min(3, Math.max(2, Math.round(targetLength / 6)));

  for (let i = 0; i < wordCount; i += 1) {
    const word = WORD_BANK[secureRandomInt(WORD_BANK.length)];
    parts.push(i === 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
  }

  const number = String(secureRandomInt(99) + 10);
  const symbol = pickRandomChar('!@#$%^&*') || '#';
  const memoryPassword = parts.join('') + number + symbol;
  const padded = memoryPassword.slice(0, targetLength);

  if (padded.length < targetLength) {
    const filler = 'Aa1!'.repeat(8).split('');
    for (let i = padded.length; i < targetLength; i += 1) {
      padded += filler[secureRandomInt(filler.length)];
    }
  }

  return padded.slice(0, targetLength);
}

function generatePassword() {
  sanitizeSettings();
  setLengthValue();
  applyPresetHighlight();
  updateCheckboxesFromState();

  let newPassword = '';

  if (state.settings.memorable) {
    newPassword = generateMemorablePassword();
  } else {
    newPassword = generateFromCharacterSets();
  }

  if (!newPassword) {
    return;
  }

  elements.passwordOutput.value = newPassword;
  elements.passwordOutput.type = state.passwordVisible ? 'text' : 'password';
  updateStrengthIndicator(newPassword);
  showToast('New password generated.', 'success');
}

function updatePasswordVisibility() {
  state.passwordVisible = !state.passwordVisible;
  elements.passwordOutput.type = state.passwordVisible ? 'text' : 'password';
  elements.toggleVisibility.innerHTML = state.passwordVisible ? '<span aria-hidden="true">🙈</span>' : '<span aria-hidden="true">👁</span>';
}

async function copyPassword(value) {
  try {
    if (!value) {
      throw new Error('Password is empty.');
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const temp = document.createElement('textarea');
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }

    showToast('Password copied to clipboard.', 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Copy failed. Please try again.', 'error');
  }
}

function saveHistory(password) {
  const trimmedPassword = String(password).trim();
  if (!trimmedPassword) {
    return;
  }

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  const filtered = existing.filter((entry) => entry !== trimmedPassword);
  filtered.unshift(trimmedPassword);

  const history = filtered.slice(0, 8);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  state.history = history;
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    state.history = Array.isArray(saved) ? saved : [];
  } catch (error) {
    state.history = [];
    console.error('History load failed:', error);
  }
}

function renderHistory() {
  if (!state.history.length) {
    elements.historyList.innerHTML = '<li class="empty-history">No passwords saved yet. Generate one to start building your history.</li>';
    return;
  }

  elements.historyList.innerHTML = state.history
    .map(
      (password, index) => `
        <li class="history-item" data-index="${index}">
          <span class="history-password">${password}</span>
          <div class="history-actions">
            <button type="button" class="copy-history-btn" data-password="${password}">Copy</button>
            <button type="button" class="delete-history-btn" data-index="${index}" aria-label="Delete password from history">Delete</button>
          </div>
        </li>
      `
    )
    .join('');
}

function addCurrentPasswordToHistory() {
  const password = elements.passwordOutput.value.trim();
  if (!password) {
    return;
  }

  saveHistory(password);
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.history);
  state.history = [];
  renderHistory();
  showToast('Password history cleared.', 'info');
}

function deleteHistoryItem(index) {
  const nextHistory = [...state.history];
  nextHistory.splice(index, 1);
  state.history = nextHistory;
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory));
  renderHistory();
  showToast('Password deleted from history.', 'info');
}

function bindEvents() {
  elements.themeToggle.addEventListener('click', () => {
    const isLight = elements.body.classList.toggle('light');
    const theme = isLight ? 'light' : 'dark';
    elements.themeText.textContent = isLight ? 'Light' : 'Dark';
    elements.themeIcon.textContent = isLight ? '☀️' : '🌙';
    saveThemeToStorage(theme);
  });

  elements.lengthSlider.addEventListener('input', (event) => {
    state.settings.length = clampLength(Number(event.target.value));
    setLengthValue();
    applyPresetHighlight();
    generatePassword();
  });

  elements.uppercase.addEventListener('change', () => {
    state.settings.uppercase = elements.uppercase.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.uppercase = true;
      elements.uppercase.checked = true;
    }
    generatePassword();
  });

  elements.lowercase.addEventListener('change', () => {
    state.settings.lowercase = elements.lowercase.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.lowercase = true;
      elements.lowercase.checked = true;
    }
    generatePassword();
  });

  elements.numbers.addEventListener('change', () => {
    state.settings.numbers = elements.numbers.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.numbers = true;
      elements.numbers.checked = true;
    }
    generatePassword();
  });

  elements.symbols.addEventListener('change', () => {
    state.settings.symbols = elements.symbols.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.symbols = true;
      elements.symbols.checked = true;
    }
    generatePassword();
  });

  elements.excludeSimilar.addEventListener('change', () => {
    state.settings.excludeSimilar = elements.excludeSimilar.checked;
    generatePassword();
  });

  elements.excludeAmbiguous.addEventListener('change', () => {
    state.settings.excludeAmbiguous = elements.excludeAmbiguous.checked;
    generatePassword();
  });

  elements.generatePassword.addEventListener('click', () => {
    generatePassword();
    addCurrentPasswordToHistory();
  });

  elements.regeneratePassword.addEventListener('click', () => {
    generatePassword();
    addCurrentPasswordToHistory();
  });

  elements.copyPassword.addEventListener('click', () => {
    copyPassword(elements.passwordOutput.value);
  });

  elements.toggleVisibility.addEventListener('click', updatePasswordVisibility);

  elements.memorableToggle.addEventListener('click', () => {
    state.settings.memorable = !state.settings.memorable;
    updateCheckboxesFromState();
    generatePassword();
    addCurrentPasswordToHistory();
  });

  elements.presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.settings.length = Number(button.dataset.length);
      setLengthValue();
      applyPresetHighlight();
      generatePassword();
      addCurrentPasswordToHistory();
    });
  });

  elements.clearHistory.addEventListener('click', () => {
    if (!state.history.length) {
      showToast('History is already empty.', 'info');
      return;
    }
    clearHistory();
  });

  elements.historyList.addEventListener('click', (event) => {
    const target = event.target;

    if (target instanceof HTMLElement && target.classList.contains('copy-history-btn')) {
      const { password } = target.dataset;
      copyPassword(password || '');
    }

    if (target instanceof HTMLElement && target.classList.contains('delete-history-btn')) {
      const { index } = target.dataset;
      if (index === undefined) {
        return;
      }
      deleteHistoryItem(Number(index));
    }
  });
}

// ==========================================================
// Initialization
// ==========================================================
function initializeApp() {
  loadThemeFromStorage();
  loadHistory();
  renderHistory();
  setLengthValue();
  updateCheckboxesFromState();
  bindEvents();
  generatePassword();
}

initializeApp();
