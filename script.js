// ==========================================================
// Password Generator App
// Handles generation, strength scoring, history, theme toggle,
// and local storage interactions for a production-style UI.
// ==========================================================
let welcome = prompt("Welcome to SecurePass! Please enter your name:");
alert(`Hello, ${welcome || "User"}! Let's generate a secure password for you.`);

let userName = welcome || "User";

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

// Updates the length display and slider with current password length setting
function setLengthValue() {
  elements.lengthValue.textContent = String(state.settings.length);
  elements.lengthSlider.value = String(state.settings.length);
}

// Ensures password length stays within valid bounds (4-64 characters)
function clampLength(value) {
  if (value < 4) {
    return 4;
  }
  if (value > 64) {
    return 64;
  }
  return value;
}

// Validates and corrects password settings
// Ensures at least one character type is selected and length is valid
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

// Displays a temporary notification toast message for user feedback
// Auto-removes after 2.2 seconds
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

// Synchronizes all UI checkboxes and toggles with current state settings
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

// Highlights the preset length button that matches the current password length
function applyPresetHighlight() {
  elements.presetButtons.forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.length) === state.settings.length);
  });
}

// Calculates and updates the password strength indicator
// Considers: length, character type variety, and minimum length thresholds
// Updates the visual bar and strength label with appropriate color
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

  // Detect which character types are present in password
  if (/[A-Z]/.test(password)) charTypes.add('uppercase');
  if (/[a-z]/.test(password)) charTypes.add('lowercase');
  if (/[0-9]/.test(password)) charTypes.add('numbers');
  if (/[^A-Za-z0-9]/.test(password)) charTypes.add('symbols');

  // Calculate strength score based on multiple factors
  score += Math.min(length * 2.5, 40); // Length bonus (capped at 40)
  score += charTypes.size * 14; // Character type variety bonus

  // Extra bonus for reaching length milestones
  if (length >= 12) score += 12;
  if (length >= 16) score += 12;
  if (length >= 20) score += 12;
  if (length >= 32) score += 10;

  // Bonus for having all character types or good variety
  if (charTypes.size === 4 && length >= 14) score += 15;
  if (charTypes.size === 3 && length >= 10) score += 8;

  // Normalize score to 0-100 range
  const normalized = Math.max(0, Math.min(100, score));

  // Determine strength label and color based on normalized score
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

  // Update UI elements with calculated strength
  elements.strengthFill.style.width = `${normalized}%`;
  elements.strengthFill.style.background = `linear-gradient(90deg, ${color}, #7dd3fc)`;
  elements.strengthLabel.textContent = label;
  elements.strengthLabel.style.color = color;
}

// Returns a filtered character set based on user exclusion preferences
// Optionally removes similar-looking characters (O/0/I/1/l)
// Optionally removes visually ambiguous characters
function getFilteredCharset(type) {
  let chars = CHAR_SETS[type];

  // Remove similar-looking characters if option is enabled
  if (state.settings.excludeSimilar) {
    const similarChars = {
      uppercase: 'O0I1l',
      lowercase: 'oO0l1iI',
      numbers: '01Il',
      symbols: '',
    };
    chars = chars.split('').filter((char) => !similarChars[type]?.includes(char)).join('');
  }

  // Remove ambiguous characters if option is enabled
  if (state.settings.excludeAmbiguous) {
    const ambiguous = /[0OIl1{}()\[\]/\\|`~'"<>]/g;
    chars = chars.split('').filter((char) => !ambiguous.test(char)).join('');
  }

  return chars;
}

// Generates a cryptographically secure random integer between 0 and max-1
function secureRandomInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

// Picks a random character from the provided string using secure randomization
function pickRandomChar(chars) {
  if (!chars || chars.length === 0) {
    return '';
  }

  return chars[secureRandomInt(chars.length)];
}

// Fisher-Yates shuffle algorithm for cryptographically secure array shuffling
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Generates a random password from selected character sets
// Ensures at least one character from each selected type, then fills remainder
// Shuffles final result to randomize character positions
function generateFromCharacterSets() {
  const selectedTypes = getSelectedTypes();
  if (selectedTypes.length === 0) {
    showToast('No character types selected. Please enable at least one option.', 'error');
    return '';
  }

  const requiredChars = []; // Will hold one char from each selected type
  const pool = []; // Full pool of available characters for remaining slots

  // Pick one character from each selected type and build pool
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

  // Fill the rest of the password with random characters from the pool
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

  // Shuffle to ensure guaranteed types are not in predictable positions
  return shuffleArray(finalChars).join('');
}

// Generates a memorable password using dictionary words, numbers, and symbols
// Format: Word1Word2Number!Symbol - easier to remember but still secure
function generateMemorablePassword() {
  const targetLength = state.settings.length;
  const parts = []; // Will store selected words
  // Calculate number of words needed (2-3 words depending on target length)
  const wordCount = Math.min(3, Math.max(2, Math.round(targetLength / 6)));

  // Select random words from word bank, capitalize first word only
  for (let i = 0; i < wordCount; i += 1) {
    const word = WORD_BANK[secureRandomInt(WORD_BANK.length)];
    parts.push(i === 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
  }

  // Add random number (10-99) and symbol for extra security
  const number = String(secureRandomInt(99) + 10);
  const symbol = pickRandomChar('!@#$%^&*') || '#';
  const memoryPassword = parts.join('') + number + symbol;
  const padded = memoryPassword.slice(0, targetLength);

  // If password is shorter than target length, pad with varied characters
  if (padded.length < targetLength) {
    const filler = 'Aa1!'.repeat(8).split(''); // Repeating pattern of varied chars
    for (let i = padded.length; i < targetLength; i += 1) {
      padded += filler[secureRandomInt(filler.length)];
    }
  }

  // Return final password, trimmed to exact target length
  return padded.slice(0, targetLength);
}

// Main password generation function
// Validates settings, generates password using selected mode, updates UI
function generatePassword({ notify = false } = {}) {
  sanitizeSettings(); // Ensure valid settings
  setLengthValue(); // Update length display
  applyPresetHighlight(); // Highlight active preset
  updateCheckboxesFromState(); // Sync checkbox states

  let newPassword = '';

  // Generate password using selected mode (memorable or character sets)
  if (state.settings.memorable) {
    newPassword = generateMemorablePassword();
  } else {
    newPassword = generateFromCharacterSets();
  }

  if (!newPassword) {
    return;
  }

  // Display new password and update strength indicator
  elements.passwordOutput.value = newPassword;
  elements.passwordOutput.type = state.passwordVisible ? 'text' : 'password';
  updateStrengthIndicator(newPassword);

  if (notify) {
    showToast('New password generated.', 'success');
  }
}

// Toggles password visibility between masked (•••) and plain text display
// Updates button icon to reflect current state
function updatePasswordVisibility() {
  state.passwordVisible = !state.passwordVisible;
  elements.passwordOutput.type = state.passwordVisible ? 'text' : 'password';
  elements.toggleVisibility.innerHTML = state.passwordVisible ? '<span aria-hidden="true">🙈</span>' : '<span aria-hidden="true">👁</span>';
}

// Copies password to clipboard using modern API or fallback method
// Modern: Uses Clipboard API if available (HTTPS contexts)
// Fallback: Uses deprecated execCommand for older browsers or HTTP contexts
async function copyPassword(value) {
  try {
    if (!value) {
      throw new Error('Password is empty.');
    }

    // Try modern Clipboard API first (preferred, requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      // Fallback method for older browsers or non-HTTPS contexts
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

// Saves password to browser history (max 8 entries)
// Avoids duplicates by removing existing entries before adding new one at top
function saveHistory(password) {
  const trimmedPassword = String(password).trim();
  if (!trimmedPassword) {
    return;
  }

  // Load existing history and remove duplicate if present
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  const filtered = existing.filter((entry) => entry !== trimmedPassword);
  filtered.unshift(trimmedPassword); // Add new password at beginning

  // Keep only 8 most recent passwords
  const history = filtered.slice(0, 8);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  state.history = history;
}

// Loads password history from browser storage on app initialization
// Falls back to empty array if storage is empty or corrupted
function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    state.history = Array.isArray(saved) ? saved : [];
  } catch (error) {
    state.history = [];
    console.error('History load failed:', error);
  }
}

// Renders password history list in the UI with copy and delete buttons
// Shows empty state message if no history exists
function renderHistory() {
  if (!state.history.length) {
    elements.historyList.innerHTML = '<li class="empty-history">No passwords saved yet. Generate one to start building your history.</li>';
    return;
  }

  // Create list item for each password with action buttons
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

// Convenience function to save current displayed password to history
// Called after password generation or preset selection
function addCurrentPasswordToHistory() {
  const password = elements.passwordOutput.value.trim();
  if (!password) {
    return;
  }

  saveHistory(password);
  renderHistory(); // Refresh history display
}

// Clears all saved password history from storage and UI
function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.history);
  state.history = []; // Clear memory state
  renderHistory(); // Update UI to show empty state
  showToast('Password history cleared.', 'info');
}

// Removes a single password entry from history by index
function deleteHistoryItem(index) {
  const nextHistory = [...state.history];
  nextHistory.splice(index, 1); // Remove item at index
  state.history = nextHistory;
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory)); // Persist change
  renderHistory(); // Update UI
  showToast('Password deleted from history.', 'info');
}

// ==========================================================
// Event Binding
// ==========================================================
// Attaches all event listeners to UI elements
function bindEvents() {
  // Theme toggle button - switches between light and dark modes
  elements.themeToggle.addEventListener('click', () => {
    const isLight = elements.body.classList.toggle('light');
    const theme = isLight ? 'light' : 'dark';
    elements.themeText.textContent = isLight ? 'Light' : 'Dark';
    elements.themeIcon.textContent = isLight ? '☀️' : '🌙';
    saveThemeToStorage(theme); // Persist theme preference
  });

  // Length slider - updates password length in real-time
  elements.lengthSlider.addEventListener('input', (event) => {
    state.settings.length = clampLength(Number(event.target.value));
    setLengthValue(); // Update display
    applyPresetHighlight(); // Highlight matching preset if any
    generatePassword(); // Generate a new password with the updated length but no toast
  });

  // Uppercase checkbox - toggle uppercase letters in password
  elements.uppercase.addEventListener('change', () => {
    state.settings.uppercase = elements.uppercase.checked;
    // Prevent unchecking if it's the last option
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.uppercase = true;
      elements.uppercase.checked = true;
    }
    generatePassword(); // Regenerate with new settings without a success toast
  });

  // Lowercase checkbox - toggle lowercase letters in password
  elements.lowercase.addEventListener('change', () => {
    state.settings.lowercase = elements.lowercase.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.lowercase = true;
      elements.lowercase.checked = true;
    }
    generatePassword();
  });

  // Numbers checkbox - toggle numbers in password
  elements.numbers.addEventListener('change', () => {
    state.settings.numbers = elements.numbers.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.numbers = true;
      elements.numbers.checked = true;
    }
    generatePassword();
  });

  // Symbols checkbox - toggle special characters in password
  elements.symbols.addEventListener('change', () => {
    state.settings.symbols = elements.symbols.checked;
    if (!state.settings.uppercase && !state.settings.lowercase && !state.settings.numbers && !state.settings.symbols) {
      showToast('At least one option must remain enabled.', 'error');
      state.settings.symbols = true;
      elements.symbols.checked = true;
    }
    generatePassword();
  });

  // Exclude similar characters checkbox - removes O/0/I/1/l lookalikes
  elements.excludeSimilar.addEventListener('change', () => {
    state.settings.excludeSimilar = elements.excludeSimilar.checked;
    generatePassword();
  });

  // Exclude ambiguous characters checkbox - removes visually confusing symbols
  elements.excludeAmbiguous.addEventListener('change', () => {
    state.settings.excludeAmbiguous = elements.excludeAmbiguous.checked;
    generatePassword();
  });

  // Generate password button - creates new password and saves to history
  elements.generatePassword.addEventListener('click', () => {
    generatePassword({ notify: true });
    addCurrentPasswordToHistory();
  });

  // Regenerate button (refresh icon) - creates new password and saves to history
  elements.regeneratePassword.addEventListener('click', () => {
    generatePassword({ notify: true });
    addCurrentPasswordToHistory();
  });

  // Copy button - copies current password to clipboard
  elements.copyPassword.addEventListener('click', () => {
    copyPassword(elements.passwordOutput.value);
  });

  // Eye icon button - toggles password visibility
  elements.toggleVisibility.addEventListener('click', updatePasswordVisibility);

  // Memorable mode toggle - switches between memorable and random mode
  elements.memorableToggle.addEventListener('click', () => {
    state.settings.memorable = !state.settings.memorable;
    updateCheckboxesFromState(); // Update UI to reflect mode change
    generatePassword({ notify: true });
    addCurrentPasswordToHistory();
  });

  // Preset length buttons (8, 12, 16, 20, 24 chars) - quick length selection
  elements.presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.settings.length = Number(button.dataset.length);
      setLengthValue(); // Update display
      applyPresetHighlight(); // Highlight selected preset
      generatePassword({ notify: true });
      addCurrentPasswordToHistory();
    });
  });

  // Clear history button - removes all saved passwords
  elements.clearHistory.addEventListener('click', () => {
    if (!state.history.length) {
      showToast('History is already empty.', 'info');
      return;
    }
    clearHistory();
  });

  // History list - handles copy and delete actions via event delegation
  elements.historyList.addEventListener('click', (event) => {
    const target = event.target;

    // Copy button in history item
    if (target instanceof HTMLElement && target.classList.contains('copy-history-btn')) {
      const { password } = target.dataset;
      copyPassword(password || '');
    }

    // Delete button in history item
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
// Sets up the entire application on page load
function initializeApp() {
  loadThemeFromStorage(); // Apply saved theme preference
  loadHistory(); // Load previously saved passwords
  renderHistory(); // Display history in UI
  setLengthValue(); // Update length display
  updateCheckboxesFromState(); // Sync all checkboxes with state
  bindEvents(); // Attach all event listeners
  generatePassword(); // Generate initial password without a success toast
}

// Start the app when DOM is ready
initializeApp();
