(() => {
  'use strict';

  // ============================================
  // AVAILABILITY WIDGET
  // Reads settings from /availability.json (admin updates these)
  // Falls back to defaults if config can't be loaded.
  // ============================================

  const DEFAULTS = {
    timezone: 'Africa/Cairo',
    startHour: 6,        // 06:00
    endHour: 16,         // 16:00
    locationLabel: 'Cairo',
  };

  // ============================================
  // Helpers
  // ============================================

  function getVisitorTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
      return 'UTC';
    }
  }

  function getVisitorCityLabel(tz) {
    if (!tz) return 'local';
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  }

  // Returns the current hour (0-23, with decimals) in a given IANA timezone.
  function getHourInTimezone(date, timezone) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
    });
    const parts = fmt.formatToParts(date);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
    // "24" can appear in en-US hour12:false – normalize.
    return (hour === 24 ? 0 : hour) + (minute / 60);
  }

  // Format a UTC instant for display in a given timezone, e.g. "6:00 AM"
  function formatTimeInTimezone(date, timezone) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  // Build a Date that represents <yearMonthDay in Yusef tz at hour:00>, as a real UTC instant.
  // We can't construct one directly because JS Date doesn't take an IANA tz argument.
  // Strategy: pick any UTC anchor, walk it forward/back until its tz-local hour matches.
  // For our needs we just need *today's start_hour* and *today's end_hour* converted to visitor tz.
  function getInstantForLocalHour(yusefTz, targetHour) {
    // Start from "now" and find the nearest moment where the tz-local hour == targetHour and minute == 0.
    // We do this by iterating through hours of today/tomorrow in the Yusef timezone.
    const now = new Date();

    // Walk minute-by-minute? Too expensive. Use a smarter approach.
    // 1. Compute current local hour in yusefTz
    // 2. Compute the difference between current local hour and target hour
    // 3. Build candidate by adjusting UTC ms by that diff (approximate)
    // 4. Refine by checking actual local hour and correcting
    const currentLocalHour = getHourInTimezone(now, yusefTz);
    let diffHours = targetHour - currentLocalHour;
    // Pick the *next* occurrence (today if still upcoming, else tomorrow)
    if (diffHours < 0) diffHours += 24;

    let candidate = new Date(now.getTime() + diffHours * 3600 * 1000);

    // Refine: drift by tz/DST might cause off-by-one; correct up to a few times.
    for (let i = 0; i < 3; i++) {
      const localHour = getHourInTimezone(candidate, yusefTz);
      const delta = targetHour - localHour;
      if (Math.abs(delta) < 0.05) break;
      candidate = new Date(candidate.getTime() + delta * 3600 * 1000);
    }

    // Snap to the top of the hour (minute = 0) in local tz.
    // We compute current minute in local tz and subtract.
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: yusefTz,
      hour12: false,
      minute: 'numeric',
    });
    const minute = parseInt(fmt.format(candidate), 10);
    candidate = new Date(candidate.getTime() - minute * 60 * 1000);

    return candidate;
  }

  function isAvailable(config) {
    const now = new Date();
    const localHour = getHourInTimezone(now, config.timezone);
    const { startHour, endHour } = config;
    if (startHour <= endHour) {
      return localHour >= startHour && localHour < endHour;
    } else {
      // Hours wrap past midnight (rare but possible)
      return localHour >= startHour || localHour < endHour;
    }
  }

  // ============================================
  // Render
  // ============================================

  function renderWidget(config) {
    const available = isAvailable(config);

    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    // Header chip (kept for back-compat; hidden in current layout)
    const chip = document.getElementById('availabilityChip');
    if (chip) {
      chip.classList.remove('available', 'unavailable');
      chip.classList.add(available ? 'available' : 'unavailable');
      const chipText = chip.querySelector('.chip-text');
      if (chipText) chipText.textContent = available ? 'Available now' : 'Unavailable';
    }

    if (dot && text) {
      if (available) {
        dot.classList.remove('red'); dot.classList.add('green');
        text.textContent = 'Available now';
      } else {
        dot.classList.remove('green'); dot.classList.add('red');
        text.textContent = 'Unavailable';
      }
    }

    // Optional inline spans (not present in current layout, kept as a hook
    // in case the working-hours text is ever turned dynamic again).
    const hoursStart = document.getElementById('hoursStart');
    const hoursEnd = document.getElementById('hoursEnd');
    if (hoursStart || hoursEnd) {
      const startInstant = getInstantForLocalHour(config.timezone, config.startHour);
      const endInstant = getInstantForLocalHour(config.timezone, config.endHour);
      if (hoursStart) hoursStart.textContent = formatTimeInTimezone(startInstant, config.timezone);
      if (hoursEnd) hoursEnd.textContent = formatTimeInTimezone(endInstant, config.timezone);
    }
  }

  // ============================================
  // Load config & init
  // ============================================

  async function loadConfig() {
    // 1. Prefer localStorage override (set by /admin.html)
    try {
      const local = localStorage.getItem('availability_config');
      if (local) {
        const parsed = JSON.parse(local);
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      // ignore
    }

    // 2. Fall back to /availability.json (committed config)
    try {
      const resp = await fetch('availability.json', { cache: 'no-cache' });
      if (resp.ok) {
        const json = await resp.json();
        return { ...DEFAULTS, ...json };
      }
    } catch (e) {
      // ignore — use defaults
    }

    return DEFAULTS;
  }

  async function init() {
    const config = await loadConfig();
    renderWidget(config);
    // Re-render every minute so status flips at hour boundaries
    setInterval(() => renderWidget(config), 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Screenshot placeholders — show empty state when image is missing
  // ============================================
  function wireScreenshots() {
    document.querySelectorAll('.screenshot-placeholder img').forEach(img => {
      const markEmpty = () => img.closest('.screenshot-placeholder').classList.add('empty');
      // Already failed (e.g. cached 404) before this ran
      if (img.complete && img.naturalWidth === 0) markEmpty();
      img.addEventListener('error', markEmpty);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireScreenshots);
  } else {
    wireScreenshots();
  }

  // ============================================
  // Referral form — submit via Formspree, inline success
  // ============================================
  const referralForm = document.getElementById('referralForm');
  if (referralForm) {
    referralForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = referralForm.querySelector('.btn-submit-ref');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
      const data = new FormData(referralForm);
      try {
        const res = await fetch(referralForm.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          referralForm.outerHTML =
            '<div class="referral-success"><p>Got it. I’ll reach out to them this week. ' +
            'If they sign and pay, your 15% off lands on your next month’s invoice automatically.</p></div>';
        } else {
          if (btn) { btn.textContent = 'Error — try again'; btn.disabled = false; }
        }
      } catch (err) {
        if (btn) { btn.textContent = 'Error — try again'; btn.disabled = false; }
      }
    });
  }
})();
