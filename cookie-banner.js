(function () {
  'use strict';

  // ─── Helpers ───────────────────────────────────────────────
  var STORAGE_KEY = 'whelper_cookie_consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function saveConsent(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.classList.add('hidden');
  }

  function hideModal() {
    var m = document.getElementById('cookie-modal-overlay');
    if (m) m.classList.add('hidden');
  }

  // ─── Google Analytics loader ────────────────────────────────
  // Замінити GA_MEASUREMENT_ID на свій реальний ID (наприклад G-XXXXXXXXXX)
  var GA_ID = 'G-GLT40PVKBS';

  function loadGA() {
    if (document.getElementById('ga-script')) return;
    var s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function applyConsent(consent) {
    if (consent && consent.analytics) {
      loadGA();
    }
  }

  // ─── Build banner HTML ──────────────────────────────────────
  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Налаштування cookies');
    banner.innerHTML = [
      '<div class="cookie-banner-top">',
        '<div class="cookie-banner-icon" aria-hidden="true">🍪</div>',
        '<div class="cookie-banner-text">',
          '<h3>Цей сайт використовує cookies</h3>',
          '<p>Ми використовуємо Google Analytics для аналізу відвідуваності. Ви можете прийняти всі cookies, відхилити або вибрати самостійно. <a href="/privacy">Детальніше</a></p>',
        '</div>',
      '</div>',
      '<div class="cookie-banner-btns">',
        '<button class="cookie-btn cookie-btn-accept" id="cookie-accept-all">Прийняти все</button>',
        '<button class="cookie-btn cookie-btn-reject" id="cookie-reject-all">Відхилити</button>',
        '<button class="cookie-btn cookie-btn-settings" id="cookie-open-settings">Налаштувати</button>',
      '</div>'
    ].join('');
    document.body.appendChild(banner);
  }

  // ─── Build modal HTML ───────────────────────────────────────
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.id = 'cookie-modal-overlay';
    overlay.classList.add('hidden');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Налаштування cookies');
    overlay.innerHTML = [
      '<div class="cookie-modal">',
        '<div class="cookie-modal-header">',
          '<h3>Налаштування cookies</h3>',
          '<button class="cookie-modal-close" id="cookie-modal-close" aria-label="Закрити">✕</button>',
        '</div>',
        '<div class="cookie-modal-body">',

          // Необхідні
          '<div class="cookie-toggle-row">',
            '<div class="cookie-toggle-info">',
              '<h4>Необхідні cookies</h4>',
              '<p>Забезпечують базову роботу сайту. Не можуть бути вимкнені.</p>',
              '<span class="required-badge">Завжди активні</span>',
            '</div>',
            '<label class="cookie-toggle">',
              '<input type="checkbox" id="toggle-necessary" checked disabled>',
              '<span class="cookie-toggle-slider"></span>',
            '</label>',
          '</div>',

          // Аналітика
          '<div class="cookie-toggle-row">',
            '<div class="cookie-toggle-info">',
              '<h4>Аналітичні cookies</h4>',
              '<p>Google Analytics — допомагає розуміти, які матеріали цікаві читачам і звідки приходить трафік. Дані анонімізовані.</p>',
            '</div>',
            '<label class="cookie-toggle">',
              '<input type="checkbox" id="toggle-analytics">',
              '<span class="cookie-toggle-slider"></span>',
            '</label>',
          '</div>',

        '</div>',
        '<div class="cookie-modal-footer">',
          '<button class="cookie-btn cookie-btn-reject" id="cookie-modal-reject">Відхилити все</button>',
          '<button class="cookie-btn cookie-btn-accept" id="cookie-modal-save">Зберегти вибір</button>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
  }

  // ─── Event handlers ─────────────────────────────────────────
  function bindEvents() {
    // Прийняти все
    document.getElementById('cookie-accept-all').addEventListener('click', function () {
      var consent = { necessary: true, analytics: true };
      saveConsent(consent);
      applyConsent(consent);
      hideBanner();
    });

    // Відхилити все
    document.getElementById('cookie-reject-all').addEventListener('click', function () {
      var consent = { necessary: true, analytics: false };
      saveConsent(consent);
      hideBanner();
    });

    // Відкрити налаштування
    document.getElementById('cookie-open-settings').addEventListener('click', function () {
      var existing = getConsent();
      if (existing) {
        document.getElementById('toggle-analytics').checked = !!existing.analytics;
      }
      document.getElementById('cookie-modal-overlay').classList.remove('hidden');
    });

    // Закрити модалку
    document.getElementById('cookie-modal-close').addEventListener('click', function () {
      hideModal();
    });

    // Клік на оверлей — закрити
    document.getElementById('cookie-modal-overlay').addEventListener('click', function (e) {
      if (e.target === this) hideModal();
    });

    // Відхилити все з модалки
    document.getElementById('cookie-modal-reject').addEventListener('click', function () {
      var consent = { necessary: true, analytics: false };
      saveConsent(consent);
      hideModal();
      hideBanner();
    });

    // Зберегти вибір з модалки
    document.getElementById('cookie-modal-save').addEventListener('click', function () {
      var consent = {
        necessary: true,
        analytics: document.getElementById('toggle-analytics').checked
      };
      saveConsent(consent);
      applyConsent(consent);
      hideModal();
      hideBanner();
    });

    // Escape — закрити модалку
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideModal();
    });
  }

  // ─── Init ────────────────────────────────────────────────────
  function init() {
    var existing = getConsent();

    if (existing) {
      // Вже є збережений вибір — застосовуємо і не показуємо банер
      applyConsent(existing);
      return;
    }

    // Показуємо банер
    buildBanner();
    buildModal();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
