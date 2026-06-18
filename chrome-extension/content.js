(function () {
  'use strict';

  const host = window.location.hostname.toLowerCase();

  if (host !== 'gitlab' && !host.startsWith('gitlab.')) {
    return;
  }

  const BUTTONS = [
    { label: '🟥', title: 'Insert P1 priority (Alt+1)', text: '🟥', key: '1' },
    { label: '🟧', title: 'Insert P2 priority (Alt+2)', text: '🟧', key: '2' },
    { label: '🟨', title: 'Insert P3 priority (Alt+3)', text: '🟨', key: '3' },
    { label: '🟩', title: 'Insert P4 priority (Alt+4)', text: '🟩', key: '4' },
  ];

  const TOOLBAR_SELECTOR = [
    '.md-header li.md-header-toolbar',
    'ul.nav-links > li.md-header-toolbar',
    '.js-vue-markdown-field .gl-markdown-toolbar',
    '.markdown-field .gl-markdown-toolbar',
  ].join(', ');

  const TEXTAREA_SELECTOR = [
    'textarea.js-gfm-input',
    'textarea.note-textarea',
    'textarea[data-testid="textarea"]',
    'textarea',
  ].join(', ');

  const BUTTON_CLASS = 'custom-priority-comment-button';
  const TOOLBAR_DONE_ATTR = 'data-custom-priority-buttons-added';

  function getEditorRoot(toolbar) {
    return (
      toolbar.closest('.markdown-area') ||
      toolbar.closest('.markdown-field') ||
      toolbar.closest('.js-vue-markdown-field') ||
      toolbar.closest('.common-note-form') ||
      toolbar.closest('form') ||
      toolbar.parentElement
    );
  }

  function getTextarea(toolbar) {
    const root = getEditorRoot(toolbar);

    if (root) {
      const textarea = root.querySelector(TEXTAREA_SELECTOR);

      if (textarea) {
        return textarea;
      }
    }

    const form = toolbar.closest('form');
    return form ? form.querySelector(TEXTAREA_SELECTOR) : document.querySelector(TEXTAREA_SELECTOR);
  }

  function insertTextAtCursor(textarea, text) {
    textarea.focus();

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    textarea.value = before + text + after;
    textarea.selectionStart = start + text.length;
    textarea.selectionEnd = start + text.length;

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function makeButton(buttonConfig, toolbar) {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = buttonConfig.label;
    button.title = buttonConfig.title || buttonConfig.label;
    button.setAttribute('aria-label', button.title);
    button.setAttribute('data-container', 'body');
    button.className = `${BUTTON_CLASS} toolbar-btn`;

    button.addEventListener('click', function () {
      const textarea = getTextarea(toolbar);

      if (!textarea) {
        return;
      }

      insertTextAtCursor(textarea, buttonConfig.text);
    });

    return button;
  }

  function addButtonsToToolbar(toolbar) {
    if (toolbar.getAttribute(TOOLBAR_DONE_ATTR) === 'true') {
      return;
    }

    toolbar.setAttribute(TOOLBAR_DONE_ATTR, 'true');

    const group = document.createElement('div');
    group.className = 'custom-priority-comment-buttons';

    if (toolbar.matches('li.md-header-toolbar')) {
      group.className += ' d-inline-block ml-md-2 ml-0';
    } else {
      group.style.display = 'inline-flex';
      group.style.alignItems = 'center';
      group.style.marginLeft = '6px';
      group.style.gap = '2px';
    }

    BUTTONS.forEach(function (buttonConfig) {
      group.appendChild(makeButton(buttonConfig, toolbar));
    });

    toolbar.appendChild(group);
  }

  function addButtonsToLoadedEditors() {
    document.querySelectorAll(TOOLBAR_SELECTOR).forEach(addButtonsToToolbar);
  }

  function isEditableElement(element) {
    return (
      element &&
      (element.matches(TEXTAREA_SELECTOR) ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'INPUT' ||
        element.isContentEditable)
    );
  }

  function getActiveTextarea() {
    if (document.activeElement && document.activeElement.matches(TEXTAREA_SELECTOR)) {
      return document.activeElement;
    }

    return document.querySelector(TEXTAREA_SELECTOR);
  }

  function handlePriorityHotkey(event) {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) {
      return;
    }

    const buttonConfig = BUTTONS.find(function (config) {
      return config.key === event.key;
    });

    if (!buttonConfig || !isEditableElement(document.activeElement)) {
      return;
    }

    const textarea = getActiveTextarea();

    if (!textarea) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    insertTextAtCursor(textarea, buttonConfig.text);
  }

  function start() {
    addButtonsToLoadedEditors();
    document.addEventListener('keydown', handlePriorityHotkey, true);

    const observer = new MutationObserver(addButtonsToLoadedEditors);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
