(function() {
  'use strict';

  console.log('[Back Button] Script loaded');

  // Configuration
  const CONFIG = {
    BUTTON_POSITION: 'bottom-left', // Options: 'bottom-left', 'bottom-right', 'top-left', 'top-right'
    BUTTON_TEXT: 'Previous Lesson',
    BUTTON_COLOR: '#291d5c',
    BUTTON_TEXT_COLOR: '#fff',
    SHOW_ONLY_INTERNAL: false, // Set to true to only show for same-domain referrers
    ALLOWED_DOMAINS: [], // Add domains here to allow specific external referrers
    EXCLUDED_REFERRERS: ['google.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com'] // Don't show button from these domains
  };

  // Check if user came from another page
  function hasValidReferrer() {
    const referrer = document.referrer;

    if (!referrer) {
      console.log('[Back Button] No referrer found - user likely typed URL directly or came from bookmark');
      return false;
    }

    console.log('[Back Button] Referrer detected:', referrer);

    try {
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);

      // Check if referrer is in excluded list
      const isExcluded = CONFIG.EXCLUDED_REFERRERS.some(domain =>
        referrerUrl.hostname.includes(domain)
      );

      if (isExcluded) {
        console.log('[Back Button] Referrer is excluded (search engine or social media)');
        return false;
      }

      // If show only internal, check if same domain
      if (CONFIG.SHOW_ONLY_INTERNAL) {
        const isSameDomain = referrerUrl.hostname === currentUrl.hostname;
        console.log('[Back Button] Same domain check:', isSameDomain);
        return isSameDomain;
      }

      // If allowed domains specified, check if referrer is in the list
      if (CONFIG.ALLOWED_DOMAINS.length > 0) {
        const isAllowed = CONFIG.ALLOWED_DOMAINS.some(domain =>
          referrerUrl.hostname.includes(domain)
        );
        console.log('[Back Button] Allowed domain check:', isAllowed);
        return isAllowed;
      }

      // Default: show button for any referrer that's not excluded
      return true;

    } catch (e) {
      console.warn('[Back Button] Error parsing referrer URL:', e);
      return false;
    }
  }

  // Create and inject styles
  function injectStyles() {
    if (document.getElementById('back-button-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'back-button-styles';

    // Position classes
    const positions = {
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;'
    };

    const positionStyle = positions[CONFIG.BUTTON_POSITION] || positions['bottom-left'];

    styles.textContent = `
      .back-navigation-button {
        position: fixed;
        ${positionStyle}
        background: ${CONFIG.BUTTON_COLOR};
        color: ${CONFIG.BUTTON_TEXT_COLOR};
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 25px;
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .back-navigation-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        opacity: 0.9;
      }

      .back-navigation-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 768px) {
        .back-navigation-button {
          padding: 10px 20px;
          font-size: 14px;
          top: 15px;
          left: 15px;
          bottom: auto;
          right: auto;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('[Back Button] Styles injected');
  }

  // Create the back button
  function createBackButton() {
    const button = document.createElement('button');
    button.className = 'back-navigation-button';
    button.innerHTML = CONFIG.BUTTON_TEXT;
    button.setAttribute('aria-label', 'Go back to previous page');

    button.addEventListener('click', function() {
      console.log('[Back Button] Back button clicked, navigating to previous page');
      window.history.back();
    });

    document.body.appendChild(button);
    console.log('[Back Button] ✓ Back button created and added to page');
  }

  // Initialize the back button
  function init() {
    console.log('[Back Button] Initializing...');

    if (!hasValidReferrer()) {
      console.log('[Back Button] No valid referrer - back button will not be shown');
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        injectStyles();
        createBackButton();
      });
    } else {
      injectStyles();
      createBackButton();
    }
  }

  // Start initialization
  init();

})();
