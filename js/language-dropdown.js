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
      selected.textContent = option.textContent;
      optionItems.forEach(o => o.setAttribute('aria-selected', 'false'));
      option.setAttribute('aria-selected', 'true');
      customSelect.classList.remove('open');
      selected.setAttribute('aria-expanded', 'false');
    });
  });
})();
