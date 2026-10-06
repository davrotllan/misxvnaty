/* =========================================================
   Mis XV · Natalia Olivera Jacobo
   Interacciones del prototipo:
     1. Reveal al hacer scroll
     2. Parallax de la imagen del hero
     3. Cuenta regresiva
     4. Acordeón de datos bancarios
     5. Copiar datos de la tarjeta
     6. Guardar la fecha (.ics)
     7. Control de música
   ========================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Reveal + 2. Parallax --------------------------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var heroImg = document.getElementById('heroImg');

  if (reduceMotion) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = null;

    var show = function (el) {
      el.classList.add('is-visible');
      if (observer) observer.unobserve(el);
    };

    var sweep = function () {
      revealItems.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) show(el);
      });
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) show(entry.target);
        });
        sweep();
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

      revealItems.forEach(function (el) { observer.observe(el); });
    }

    sweep();

    var frame = null;
    var onScroll = function () {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        sweep();
        if (!heroImg) return;
        var y = Math.min(window.scrollY, window.innerHeight) * 0.14;
        heroImg.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(1.02)';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* 3. Cuenta regresiva ------------------------------------- */
  var elDays = document.getElementById('cdDays');
  var elHours = document.getElementById('cdHours');
  var elMinutes = document.getElementById('cdMinutes');
  var elSeconds = document.getElementById('cdSeconds');

  if (elDays && elHours && elMinutes && elSeconds) {
    var target = new Date('2026-12-19T17:00:00-06:00').getTime();
    var DAY = 86400000;

    var pad = function (value, length) {
      return String(value).padStart(length, '0');
    };

    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / DAY); diff -= d * DAY;
      var h = Math.floor(diff / 3600000); diff -= h * 3600000;
      var m = Math.floor(diff / 60000); diff -= m * 60000;
      var s = Math.floor(diff / 1000);

      elDays.textContent = pad(d, 3);
      elHours.textContent = pad(h, 2);
      elMinutes.textContent = pad(m, 2);
      elSeconds.textContent = pad(s, 2);
    };

    tick();
    window.setInterval(tick, 1000);
  }

  /* 4. Acordeón de datos bancarios -------------------------- */
  var bankToggle = document.getElementById('bankToggle');
  var bankPanel = document.getElementById('bankPanel');
  var bankLabel = document.getElementById('bankLabel');

  if (bankToggle && bankPanel && bankLabel) {
    bankPanel.hidden = true;

    bankToggle.addEventListener('click', function () {
      var open = bankToggle.getAttribute('aria-expanded') === 'true';
      bankToggle.setAttribute('aria-expanded', String(!open));
      bankPanel.hidden = open;
      bankLabel.textContent = open ? 'Ver datos' : 'Ocultar datos';
    });
  }

  /* 5. Copiar datos de la tarjeta --------------------------- */
  var copyBtn = document.getElementById('copyCard');
  var copyLabel = document.getElementById('copyLabel');
  var copyStatus = document.getElementById('copyStatus');
  var bankNumber = document.getElementById('bankNumber');
  var copyTimer = null;

  if (copyBtn && copyLabel && bankNumber) {
    copyBtn.addEventListener('click', function () {
      var value = bankNumber.textContent.trim();

      var confirmCopy = function () {
        copyLabel.textContent = 'Copiado';
        if (copyStatus) copyStatus.textContent = 'Datos copiados al portapapeles.';
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () {
          copyLabel.textContent = 'Copiar datos';
          if (copyStatus) copyStatus.textContent = '';
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(confirmCopy, function () {
          if (copyStatus) copyStatus.textContent = 'No se pudo copiar. Selecciona los datos manualmente.';
        });
      } else if (copyStatus) {
        copyStatus.textContent = 'No se pudo copiar. Selecciona los datos manualmente.';
      }
    });
  }

  /* 6. Guardar la fecha (.ics) ------------------------------ */
  var calendarBtn = document.getElementById('addToCalendar');

  if (calendarBtn) {
    calendarBtn.addEventListener('click', function () {
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//misxvnaty//ES',
        'BEGIN:VEVENT',
        'UID:xv-natalia-2026@misxvnaty.com',
        'DTSTART:20261219T230000Z',
        'DTEND:20261220T070000Z',
        'SUMMARY:XV Años de Natalia Olivera Jacobo',
        'DESCRIPTION:Ceremonia 5:00 PM - Parroquia de San Pedro Apóstol de Tláhuac. Recepción 6:00 PM - Salón de Eventos El Rosedal.',
        'LOCATION:Avenida Norte del Comercio 429, San Juan Ixtayopan, San Agustín, Tláhuac, 13508 Ciudad de México, CDMX',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      var link = document.createElement('a');
      link.href = url;
      link.download = 'XV-Natalia-19-12-2026.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* 7. Control de música ------------------------------------ */
  var musicBtn = document.getElementById('musicToggle');
  var musicLabel = document.getElementById('musicLabel');
  var musicIconUse = document.getElementById('musicIconUse');
  var track = document.getElementById('track');

  if (musicBtn && musicLabel && musicIconUse && track) {
    var TRACK_TITLE = "Stuck with U — Ariana Grande ft. Justin Bieber";
    var hasSource = Boolean(track.currentSrc || track.getAttribute('src') || track.querySelector('source'));

    var paint = function () {
      var playing = !track.paused && !track.ended;
      musicIconUse.setAttribute('href', playing ? '#i-pause' : '#i-play');
      musicLabel.textContent = playing ? TRACK_TITLE : 'Reproducir música';
      musicBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
      musicBtn.setAttribute('aria-pressed', String(playing));
    };

    if (!hasSource) {
      musicBtn.disabled = true;
      musicBtn.title = 'Música pendiente de integrar';
    }

    track.addEventListener('play', paint);
    track.addEventListener('pause', paint);
    track.addEventListener('ended', paint);

    musicBtn.addEventListener('click', function () {
      if (track.paused) {
        var attempt = track.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () { paint(); });
        }
      } else {
        track.pause();
      }
    });

    var startAudio = function () {
      if (!hasSource || !track.paused) return;
      var attempt = track.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.then(function () {
          paint();
        }).catch(function () {
          var unlockOnInteraction = function () {
            if (track.paused) {
              track.play().then(function () {
                paint();
              }).catch(function () {});
            }
            window.removeEventListener('click', unlockOnInteraction, true);
            window.removeEventListener('touchstart', unlockOnInteraction, true);
            window.removeEventListener('scroll', unlockOnInteraction, true);
            window.removeEventListener('keydown', unlockOnInteraction, true);
          };

          window.addEventListener('click', unlockOnInteraction, { once: true, capture: true });
          window.addEventListener('touchstart', unlockOnInteraction, { once: true, capture: true });
          window.addEventListener('scroll', unlockOnInteraction, { once: true, capture: true });
          window.addEventListener('keydown', unlockOnInteraction, { once: true, capture: true });
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startAudio);
    } else {
      startAudio();
    }

    paint();
  }
})();
