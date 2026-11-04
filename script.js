function initDictionary() {
  // Проверка существования элементов до обращения к их свойствам и событиям.
  const elements = {
    root: document.querySelector('html'),
    themeButton: document.querySelector('#theme-toggle'),
    form: document.getElementById('word-form'),
    word: document.getElementById('word-input'),
    translation: document.getElementById('translation-input'),
    body: document.getElementById('dictionary-body'),
    panel: document.getElementById('dictionary-panel'),
    toggle: document.getElementById('dictionary-toggle'),
    clear: document.getElementById('clear-dictionary'),
    empty: document.getElementById('dictionary-empty'),
    count: document.getElementById('word-count'),
    status: document.getElementById('dictionary-status'),
    storageWarning: document.getElementById('storage-warning'),
    languageSwitch: document.getElementById('language-switch'),
    avatar: document.getElementById('avatar')
  };
  const missing = Object.keys(elements).filter((key) => !elements[key]);
  if (missing.length > 0) {
    console.error('Не найдены элементы словаря:', missing.join(', '));
    return;
  }

  const messages = {
    ru: {
      pageTitle: 'Личный словарь — Юрий Ильчук | Лабораторная №5',
      description: 'Личный словарь Юрия Ильчука. Лабораторная работа №5, вариант 17: DOM и localStorage.',
      student: 'Юрий Ильчук · Группа 932403', title: 'Личный словарь',
      intro: 'Собирайте новые слова и их переводы. Словарь и настройки сохраняются в этом браузере.',
      darkTheme: 'Тёмная тема', languageLabel: 'Язык интерфейса',
      avatarAlt: 'Иллюстрированный аватар с книгой',
      addTitle: 'Добавить слово', wordLabel: 'Слово', translationLabel: 'Перевод',
      wordPlaceholder: 'Например, hello', translationPlaceholder: 'Например, привет',
      addWord: 'Добавить слово', dictionaryTitle: 'Мой словарь', wordCount: 'Слов в словаре:',
      hideDictionary: 'Скрыть словарь', showDictionary: 'Показать словарь',
      clearDictionary: 'Очистить словарь', tableCaption: 'Слова и их переводы', actions: 'Действия',
      remove: 'Удалить', removeWord: 'Удалить слово',
      empty: 'Словарь пока пуст. Добавьте первое слово с переводом.',
      added: 'Слово добавлено.', removed: 'Слово удалено.', cleared: 'Словарь очищен.',
      invalid: 'Заполните оба поля: до 80 символов в слове и до 160 в переводе.',
      duplicate: 'Такое слово с этим переводом уже есть в словаре.',
      storageUnavailable: 'Не удалось сохранить данные в браузере. Последние изменения могут не восстановиться после перезагрузки.',
      storageInvalid: 'Сохранённые данные повреждены. Открыт пустой словарь; добавьте слова заново.',
      copyright: '© 2026 Юрий Ильчук'
    },
    en: {
      pageTitle: 'Personal dictionary — Yuriy Ilchuk | Lab 5',
      description: 'Yuriy Ilchuk’s personal dictionary. Lab 5, variant 17: DOM and localStorage.',
      student: 'Yuriy Ilchuk · Group 932403', title: 'Personal dictionary',
      intro: 'Collect new words and their translations. Your dictionary and settings are saved in this browser.',
      darkTheme: 'Dark theme', languageLabel: 'Interface language',
      avatarAlt: 'Illustrated avatar holding a book',
      addTitle: 'Add a word', wordLabel: 'Word', translationLabel: 'Translation',
      wordPlaceholder: 'For example, hello', translationPlaceholder: 'For example, a greeting',
      addWord: 'Add word', dictionaryTitle: 'My dictionary', wordCount: 'Words in dictionary:',
      hideDictionary: 'Hide dictionary', showDictionary: 'Show dictionary',
      clearDictionary: 'Clear dictionary', tableCaption: 'Words and their translations', actions: 'Actions',
      remove: 'Delete', removeWord: 'Delete word',
      empty: 'Your dictionary is empty. Add your first word and translation.',
      added: 'Word added.', removed: 'Word deleted.', cleared: 'Dictionary cleared.',
      invalid: 'Complete both fields: up to 80 characters for the word and 160 for the translation.',
      duplicate: 'This word and translation are already in the dictionary.',
      storageUnavailable: 'Could not save data in this browser. Recent changes may not be restored after reloading.',
      storageInvalid: 'The saved data is damaged. An empty dictionary has been opened; please add your words again.',
      copyright: '© 2026 Yuriy Ilchuk'
    }
  };
  const storageKey = '932403.ilchuk.yuriy.lab5.state.v1';
  let storageIssue = '';
  let lastMessage = null;

  function validState(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.words)) return false;
    if (!['light', 'dark'].includes(value.theme) || !['ru', 'en'].includes(value.language)) return false;
    if (typeof value.dictionaryHidden !== 'boolean') return false;
    const ids = new Set();
    return value.words.every((entry) => {
      if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)) return false;
      if (typeof entry.word !== 'string' || !entry.word.trim() || entry.word.length > 80) return false;
      if (typeof entry.translation !== 'string' || !entry.translation.trim() || entry.translation.length > 160) return false;
      ids.add(entry.id);
      return true;
    });
  }

  function loadState() {
    const fallback = { words: [], theme: 'light', language: 'ru', dictionaryHidden: false };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === null) return fallback;
      const parsed = JSON.parse(saved);
      if (!validState(parsed)) {
        storageIssue = 'storageInvalid';
        return fallback;
      }
      return parsed;
    } catch (error) {
      storageIssue = error instanceof SyntaxError ? 'storageInvalid' : 'storageUnavailable';
      return fallback;
    }
  }

  const state = loadState();
  const text = () => messages[state.language];

  function renderFeedback() {
    elements.status.textContent = lastMessage ? text()[lastMessage.key] : '';
    elements.status.classList.toggle('is-error', Boolean(lastMessage && lastMessage.isError));
    elements.storageWarning.hidden = !storageIssue;
    elements.storageWarning.textContent = storageIssue ? text()[storageIssue] : '';
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      storageIssue = '';
    } catch (error) {
      storageIssue = 'storageUnavailable';
    }
    renderFeedback();
  }

  function setStatus(key, isError = false) {
    lastMessage = { key, isError };
    renderFeedback();
  }

  function updateSummary() {
    elements.count.textContent = `${text().wordCount} ${state.words.length}`;
    elements.empty.hidden = state.words.length > 0;
    elements.clear.disabled = state.words.length === 0;
    elements.panel.hidden = state.dictionaryHidden;
    elements.toggle.textContent = state.dictionaryHidden ? text().showDictionary : text().hideDictionary;
    elements.toggle.setAttribute('aria-expanded', String(!state.dictionaryHidden));
  }

  function appendWordRow(entry) {
    const row = document.createElement('tr');
    row.dataset.wordId = entry.id;
    const wordCell = document.createElement('td');
    const translationCell = document.createElement('td');
    const actionCell = document.createElement('td');
    const button = document.createElement('button');
    // textContent сохраняет введённые символы как текст, не интерпретируя их как HTML.
    wordCell.textContent = entry.word;
    translationCell.textContent = entry.translation;
    button.type = 'button';
    button.classList.add('danger-button');
    button.dataset.removeId = entry.id;
    button.textContent = text().remove;
    button.setAttribute('aria-label', `${text().removeWord}: ${entry.word}`);
    actionCell.append(button);
    row.append(wordCell, translationCell, actionCell);
    elements.body.append(row);
  }

  function renderPage() {
    elements.root.lang = state.language;
    elements.root.classList.toggle('dark-theme', state.theme === 'dark');
    elements.themeButton.setAttribute('aria-pressed', String(state.theme === 'dark'));
    document.title = text().pageTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', text().description);
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = text()[element.dataset.i18n];
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === state.language));
    });
    elements.languageSwitch.setAttribute('aria-label', text().languageLabel);
    elements.avatar.setAttribute('alt', text().avatarAlt);
    elements.word.setAttribute('placeholder', text().wordPlaceholder);
    elements.translation.setAttribute('placeholder', text().translationPlaceholder);
    elements.body.replaceChildren();
    state.words.forEach(appendWordRow);
    updateSummary();
    renderFeedback();
  }

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const word = elements.word.value.trim();
    const translation = elements.translation.value.trim();
    const wordInvalid = !word || word.length > 80;
    const translationInvalid = !translation || translation.length > 160;
    elements.word.setAttribute('aria-invalid', String(wordInvalid));
    elements.translation.setAttribute('aria-invalid', String(translationInvalid));
    if (wordInvalid || translationInvalid) {
      setStatus('invalid', true);
      (wordInvalid ? elements.word : elements.translation).focus();
      return;
    }
    const duplicate = state.words.some((entry) => entry.word.toLowerCase() === word.toLowerCase()
      && entry.translation.toLowerCase() === translation.toLowerCase());
    if (duplicate) {
      setStatus('duplicate', true);
      return;
    }
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, word, translation };
    state.words.push(entry);
    appendWordRow(entry);
    updateSummary();
    setStatus('added');
    saveState();
    elements.form.reset();
    elements.word.focus();
  });

  elements.body.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-remove-id]');
    if (!button || !elements.body.contains(button)) return;
    const row = button.closest('tr');
    if (!row) return;
    state.words = state.words.filter((entry) => entry.id !== button.dataset.removeId);
    row.remove();
    updateSummary();
    setStatus('removed');
    saveState();
    (elements.body.querySelector('button') || elements.word).focus();
  });

  elements.clear.addEventListener('click', () => {
    state.words = [];
    elements.body.replaceChildren();
    updateSummary();
    setStatus('cleared');
    saveState();
    elements.word.focus();
  });

  elements.themeButton.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    renderPage();
    saveState();
  });

  elements.toggle.addEventListener('click', () => {
    state.dictionaryHidden = !state.dictionaryHidden;
    updateSummary();
    saveState();
  });

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      state.language = button.dataset.language;
      renderPage();
      saveState();
    });
  });

  renderPage();
}

initDictionary();
