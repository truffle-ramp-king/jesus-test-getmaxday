(() => {
  'use strict';
  const eventQueue = [];
  const sent = new Set();
  const storagePrefix = 'maxday:rest-v1:';
  const analyticsScript = document.querySelector('script[data-website-id]');

  // Keep campaign attribution, not Facebook click IDs or arbitrary query data.
  const campaignKeys = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
  window.maxdayBeforeSend = (_type, payload) => {
    if (payload.url) {
      const url = new URL(payload.url, location.origin);
      if (url.pathname === '/rest/' || url.pathname === '/rest/index.html') {
        // This short link is reserved for the Facebook rest campaign. Keep
        // explicit campaign tags (including QA) and the existing '/' funnel.
        const defaults = { utm_source: 'facebook', utm_medium: 'organic_social', utm_campaign: 'rest_v1', utm_content: 'first_post' };
        for (const [key, value] of Object.entries(defaults)) {
          if (!url.searchParams.has(key)) url.searchParams.set(key, value);
        }
        url.pathname = '/';
      }
      for (const key of [...url.searchParams.keys()]) {
        if (!campaignKeys.has(key)) url.searchParams.delete(key);
      }
      url.hash = '';
      payload.url = url.href;
    }
    return payload;
  };

  function flushEvents() {
    if (typeof window.umami?.track !== 'function') return;
    while (eventQueue.length) {
      const [name, properties] = eventQueue.shift();
      try { Promise.resolve(window.umami.track(name, properties)).catch(() => {}); }
      catch { /* Analytics must never interrupt the resource. */ }
    }
  }

  // The headline action is recorded at most once in a browser-tab session.
  // Umami's funnel counts visitors; do not use raw event totals as conversions.
  function trackOnce(name, properties = {}) {
    if (sent.has(name)) return;
    try { if (sessionStorage.getItem(storagePrefix + name)) return; }
    catch { /* Private browsing may disallow storage; memory still deduplicates. */ }
    sent.add(name);
    try { sessionStorage.setItem(storagePrefix + name, '1'); } catch {}
    eventQueue.push([name, properties]);
    flushEvents();
  }
  analyticsScript?.addEventListener('load', flushEvents, { once: true });

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer;
  function announce(message) {
    if (!toast || !toastMessage) return;
    clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 16000);
  }
  document.getElementById('toast-close')?.addEventListener('click', () => {
    toast.hidden = true;
    clearTimeout(toastTimer);
  });

  document.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', () => {
      // Real static resource links work even when JavaScript or analytics fails.
      const print = link.dataset.placement === 'print';
      trackOnce(print ? 'print_requested' : 'card_requested', { placement: link.dataset.placement });
      announce(print
        ? 'Your printable page opens in a new tab. Choose Print on that page when you’re ready.'
        : 'If the card opens in a new tab, press and hold the image to save it on your phone. On a computer, use Save image as.');
    });
  });

  document.querySelector('.passage')?.addEventListener('toggle', event => {
    if (event.currentTarget.open) trackOnce('passage_opened');
  });

  const shareButton = document.getElementById('share-button');
  if (shareButton && (navigator.share || navigator.clipboard?.writeText)) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', async () => {
      // New sharing attribution replaces incoming Facebook tags and click IDs.
      const shareUrl = new URL('https://getmaxday.com/');
      shareUrl.search = 'utm_source=share&utm_medium=referral&utm_campaign=rest_v1';
      const shareData = {
        title: 'A Bible verse and prayer for today · MaxDay',
        text: 'A moment of peace, and a Scripture card to keep.',
        url: shareUrl.href,
      };
      if (navigator.share) {
        trackOnce('share_opened');
        try { await navigator.share(shareData); }
        catch (error) {
          if (error.name !== 'AbortError') announce('You can share this reflection by copying the address from your browser.');
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl.href);
        trackOnce('share_link_copied');
        announce('Reflection link copied. You can paste it into a message to someone you love.');
      } catch { announce('You can copy the address from your browser to share this reflection.'); }
    });
  }

  const heroDownload = document.getElementById('hero-download');
  const mobileBar = document.getElementById('mobile-bar');
  if (heroDownload && mobileBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      mobileBar.hidden = entry.isIntersecting || entry.boundingClientRect.top >= 0;
    });
    observer.observe(heroDownload);
  }
})();
