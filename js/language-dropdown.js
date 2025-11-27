// Language custom dropdown logic
(function() {
  const customSelect = document.getElementById('language-custom-select');
  if (!customSelect) return;
  const selected = customSelect.querySelector('.selected');
  const options = customSelect.querySelector('.options');
  const optionItems = options.querySelectorAll('li');

  // Toggle dropdown
  selected.addEventListener('click', function(e) {
    customSelect.classList.toggle('open');
    selected.setAttribute('aria-expanded', customSelect.classList.contains('open'));
  });

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('open');
      selected.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard accessibility
  selected.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      customSelect.classList.toggle('open');
      selected.setAttribute('aria-expanded', customSelect.classList.contains('open'));
    } else if (e.key === 'Escape') {
      customSelect.classList.remove('open');
      selected.setAttribute('aria-expanded', 'false');
    }
  });

  // Option selection
  optionItems.forEach(function(option) {
    option.addEventListener('click', function() {
      const lang = option.dataset.value;
      if (window.i18n && lang) {
        window.i18n.changeLanguage(lang);
      }
      selected.textContent = option.textContent;
      optionItems.forEach(o => o.setAttribute('aria-selected', 'false'));
      option.setAttribute('aria-selected', 'true');
      customSelect.classList.remove('open');
      selected.setAttribute('aria-expanded', 'false');
    });
  });

  // Update selected text on language change (from i18n.js)
  window.addEventListener('languageChanged', (event) => {
    const newLang = event.detail.language;
    const currentOption = customSelect.querySelector(`li[data-value="${newLang}"]`);
    if (currentOption) {
      selected.textContent = currentOption.textContent;
      optionItems.forEach(o => o.setAttribute('aria-selected', 'false'));
      currentOption.setAttribute('aria-selected', 'true');
    }
  });

  // Initial setup of selected text based on current language
  if (window.i18n) {
    const initialLang = window.i18n.currentLang;
    const initialOption = customSelect.querySelector(`li[data-value="${initialLang}"]`);
    if (initialOption) {
      selected.textContent = initialOption.textContent;
      initialOption.setAttribute('aria-selected', 'true');
    }
  }
})();