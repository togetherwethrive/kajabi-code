(function() {
  'use strict';

  console.log('[Back Button] Script loaded');

  // Configuration
  const CONFIG = {
    BUTTON_TEXT: 'Previous Lesson',
    BUTTON_COLOR: '#291d5c',
    BUTTON_TEXT_COLOR: '#fff',
    TOP_BUTTON_MARGIN: '20px', // Margin from top of page
    BOTTOM_BUTTON_MARGIN: '30px', // Margin above footer
    STORAGE_KEY: 'kajabi_back_button_data',
    ALWAYS_SHOW_ATTRIBUTE: 'data-show-back-button' // Attribute to check for always-visible buttons
  };

  // Get URL parameters for unique storage key - SANITIZED to prevent XSS
  const urlParams = new URLSearchParams(window.location.search);
  const resourceIdRaw = urlParams.get('resourceId') || '';
  const userIdRaw = urlParams.get('userId') || '';
  const contactIdRaw = urlParams.get('contactId') || '';

  // Validate that IDs are numeric only (prevent XSS injection)
  const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
  const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';
  // Fall back to pathname if no valid resourceId
  const resourceId = resourceIdRaw.match(/^\d+$/) ? resourceIdRaw : window.location.pathname;

  // Storage management for back button data (visibility + referrer)
  const BackButtonStorage = {
    get: function(pageId) {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        const pages = data ? JSON.parse(data) : {};
        return pages[pageId] || { shown: false, referrer: null };
      } catch (e) {
        console.warn('[Back Button] Error reading button data:', e);
        return { shown: false, referrer: null };
      }
    },

    set: function(pageId, isShown, referrerUrl) {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        const pages = data ? JSON.parse(data) : {};

        // Preserve existing referrer if not provided
        const existingData = pages[pageId] || {};
        pages[pageId] = {
          shown: isShown !== undefined ? isShown : existingData.shown,
          referrer: referrerUrl !== undefined ? referrerUrl : existingData.referrer
        };

        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(pages));
        console.log(`[Back Button] Data saved for page: ${pageId}`, pages[pageId]);
      } catch (e) {
        console.warn('[Back Button] Error saving button data:', e);
      }
    },

    getReferrer: function(pageId) {
      const data = this.get(pageId);
      return data.referrer;
    },

    isShown: function(pageId) {
      const data = this.get(pageId);
      return data.shown;
    }
  };

  // Check if user came from another page
  const hasReferrer = document.referrer && document.referrer !== '' && document.referrer !== window.location.href;

  // Save referrer URL when page loads (if we have one)
  if (hasReferrer) {
    console.log('[Back Button] Saving referrer URL:', document.referrer);
    BackButtonStorage.set(resourceId, undefined, document.referrer);
  } else {
    console.log('[Back Button] No referrer detected (direct navigation or same page)');
  }

  // Helper function to check if buttons should be shown at all
  function shouldShowBackButton() {
    // PRIORITY 1: Check if explicitly forced to show
    const forceShow = document.body.getAttribute('data-show-back-button') === 'true';
    if (forceShow) {
      console.log('[Back Button] Force show enabled via data-show-back-button="true"');
      return true;
    }

    // PRIORITY 2: Check if window.previousLessonStart is set
    if (typeof window.previousLessonStart !== 'undefined' && window.previousLessonStart) {
      console.log('[Back Button] Force show enabled via window.previousLessonStart');
      return true;
    }

    // PRIORITY 3: Check if custom back URL is defined
    const backButtonDiv = document.getElementById('back-button-url');
    if (backButtonDiv && backButtonDiv.getAttribute('data-url')) {
      console.log('[Back Button] Custom back URL defined - showing buttons');
      return true;
    }

    const bodyBackUrl = document.body.getAttribute('data-back-button-url');
    if (bodyBackUrl && bodyBackUrl.trim() !== '') {
      console.log('[Back Button] Custom back URL in body attribute - showing buttons');
      return true;
    }

    // PRIORITY 4: Check if user came from another page
    if (hasReferrer) {
      console.log('[Back Button] User came from another page - showing buttons');
      return true;
    }

    // PRIORITY 5: Check if there's a saved referrer from previous visit
    const savedReferrer = BackButtonStorage.getReferrer(resourceId);
    if (savedReferrer) {
      console.log('[Back Button] Saved referrer found - showing buttons');
      return true;
    }

    // No valid reason to show back button
    console.log('[Back Button] ⚠️ No referrer or custom URL detected - buttons will NOT be shown');
    console.log('[Back Button] User appears to have navigated directly to this page');
    return false;
  }

  // Check if Wistia videos exist on page
  function getAllVideos() {
    const videos = [];
    const wistiaContainers = document.querySelectorAll('[class*="wistia_embed"]');

    wistiaContainers.forEach(container => {
      videos.push(container);
    });

    return videos;
  }

  // Inject button styles
  function injectStyles() {
    if (document.getElementById('back-button-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'back-button-styles';
    styles.textContent = `
      .back-navigation-button {
        background-color: ${CONFIG.BUTTON_COLOR};
        color: ${CONFIG.BUTTON_TEXT_COLOR};
        min-width: 100px;
        border: 2px solid ${CONFIG.BUTTON_COLOR};
        border-radius: 4px;
        padding: 12px 30px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        font-family: 'Montserrat', sans-serif;
        display: none;
        text-align: center;
        text-decoration: none;
        margin-left: auto;
        margin-right: auto;
        width: fit-content;
      }

      .back-navigation-button:hover {
        background-color: ${CONFIG.BUTTON_TEXT_COLOR};
        color: ${CONFIG.BUTTON_COLOR};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .back-navigation-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      #back-button-top {
        margin-top: ${CONFIG.TOP_BUTTON_MARGIN};
        margin-bottom: 20px;
      }

      #back-button-bottom {
        margin-top: ${CONFIG.BOTTOM_BUTTON_MARGIN};
        margin-bottom: 20px;
      }

      @media (max-width: 768px) {
        .back-navigation-button {
          padding: 10px 20px;
          font-size: 14px;
          width: calc(100% - 40px);
          max-width: 300px;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('[Back Button] Styles injected');
  }

  // Allowed redirect domains - SECURITY: Whitelist to prevent open redirects
  const ALLOWED_REDIRECT_DOMAINS = [
    'rapidfunnel.com',
    'my.rapidfunnel.com',
    'app.rapidfunnel.com',
    'apiv2.rapidfunnel.com',
    'thrivewithtwtapp.com',
    'kajabi.com',
    'twtmentorship.com'
  ];

  // Helper function to validate URL against whitelist
  function isUrlAllowed(url) {
    if (!url) return false;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      const hostname = urlObj.hostname;

      const isAllowed = ALLOWED_REDIRECT_DOMAINS.some(domain => {
        return hostname === domain || hostname.endsWith('.' + domain);
      });

      if (!isAllowed) {
        console.warn('[Back Button] URL blocked - domain not in whitelist:', hostname);
      }
      return isAllowed;
    } catch (e) {
      console.warn('[Back Button] Invalid URL format:', url);
      return false;
    }
  }

  // Helper function to process URL with parameters
  function processUrlWithParams(url) {
    if (!url) return url;

    let processedUrl = url;
    let hasPlaceholder = false;

    // STEP 1: Check and replace placeholders first
    if (userId) {
      if (processedUrl.includes('{userId}') || processedUrl.includes('[userId]') || processedUrl.includes('[user-id]')) {
        processedUrl = processedUrl.replace(/\{userId\}/g, userId);
        processedUrl = processedUrl.replace(/\[userId\]/g, userId);
        processedUrl = processedUrl.replace(/\[user-id\]/g, userId);
        hasPlaceholder = true;
      }
    }

    if (contactId) {
      if (processedUrl.includes('{contactId}') || processedUrl.includes('[contactId]')) {
        processedUrl = processedUrl.replace(/\{contactId\}/g, contactId);
        processedUrl = processedUrl.replace(/\[contactId\]/g, contactId);
        hasPlaceholder = true;
      }
    }

    if (resourceId) {
      if (processedUrl.includes('{resourceId}') || processedUrl.includes('[resourceId]')) {
        processedUrl = processedUrl.replace(/\{resourceId\}/g, resourceId);
        processedUrl = processedUrl.replace(/\[resourceId\]/g, resourceId);
        hasPlaceholder = true;
      }
    }

    // STEP 2: If no placeholders were found, append parameters as query string
    if (!hasPlaceholder) {
      try {
        const urlObj = new URL(processedUrl);

        // SECURITY: Parameters are already validated as numeric at the top of the file
        // URLSearchParams.set() automatically encodes values
        if (userId) {
          urlObj.searchParams.set('userId', userId);
        }

        if (contactId) {
          urlObj.searchParams.set('contactId', contactId);
        }

        if (resourceId) {
          urlObj.searchParams.set('resourceId', resourceId);
        }

        processedUrl = urlObj.toString();
      } catch (e) {
        console.warn('[Back Button] Invalid URL format:', processedUrl, e);
      }
    }

    return processedUrl;
  }

  // Navigate back function
  function navigateBack() {
    // PRIORITY 1: Check for URL in designated div element
    const backButtonDiv = document.getElementById('back-button-url');
    if (backButtonDiv) {
      let backUrl = backButtonDiv.getAttribute('data-url');
      if (backUrl && backUrl.trim() !== '') {
        // Process URL parameters (replace placeholders)
        backUrl = processUrlWithParams(backUrl);

        if (isUrlAllowed(backUrl)) {
          console.log('[Back Button] Navigating to URL from #back-button-url div:', backUrl);
          window.location.href = backUrl;
          return;
        } else {
          console.error('[Back Button] URL in div blocked by security policy:', backUrl);
        }
      }
    }

    // PRIORITY 2: Check for data-back-button-url attribute on body (fallback for backward compatibility)
    let bodyBackUrl = document.body.getAttribute('data-back-button-url');
    if (bodyBackUrl && bodyBackUrl.trim() !== '') {
      // Process URL parameters (replace placeholders)
      bodyBackUrl = processUrlWithParams(bodyBackUrl);

      if (isUrlAllowed(bodyBackUrl)) {
        console.log('[Back Button] Navigating to URL from body attribute:', bodyBackUrl);
        window.location.href = bodyBackUrl;
        return;
      } else {
        console.error('[Back Button] body data-back-button-url blocked by security policy:', bodyBackUrl);
      }
    }

    // PRIORITY 3: Check for saved referrer from localStorage
    const savedReferrer = BackButtonStorage.getReferrer(resourceId);
    if (savedReferrer && isUrlAllowed(savedReferrer)) {
      console.log('[Back Button] Navigating to saved referrer:', savedReferrer);
      window.location.href = savedReferrer;
      return;
    }

    // PRIORITY 4: Fall back to browser history
    console.log('[Back Button] No valid URL found, using browser history');
    window.history.back();
  }

  // Create back buttons
  function createBackButtons() {
    console.log('[Back Button] Creating buttons...');

    // Check if buttons already exist
    if (document.getElementById('back-button-top') || document.getElementById('back-button-bottom')) {
      console.log('[Back Button] Buttons already exist, removing old ones');
      const oldTop = document.getElementById('back-button-top');
      const oldBottom = document.getElementById('back-button-bottom');
      if (oldTop) oldTop.remove();
      if (oldBottom) oldBottom.remove();
    }

    // Create top button
    const topButton = document.createElement('button');
    topButton.id = 'back-button-top';
    topButton.className = 'back-navigation-button';
    topButton.textContent = CONFIG.BUTTON_TEXT;
    topButton.setAttribute('aria-label', 'Go back to previous lesson');
    topButton.addEventListener('click', function() {
      console.log('[Back Button] Top button clicked');
      navigateBack();
    });

    // Create bottom button
    const bottomButton = document.createElement('button');
    bottomButton.id = 'back-button-bottom';
    bottomButton.className = 'back-navigation-button';
    bottomButton.textContent = CONFIG.BUTTON_TEXT;
    bottomButton.setAttribute('aria-label', 'Go back to previous lesson');
    bottomButton.addEventListener('click', function() {
      console.log('[Back Button] Bottom button clicked');
      navigateBack();
    });

    // Insert top button at the beginning of body
    if (document.body.firstChild) {
      document.body.insertBefore(topButton, document.body.firstChild);
      console.log('[Back Button] Top button inserted at beginning of body');
    } else {
      document.body.appendChild(topButton);
      console.log('[Back Button] Top button appended to body');
    }

    // Insert bottom button before footer or at end of body
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(bottomButton, footer);
      console.log('[Back Button] Bottom button inserted before footer');
    } else {
      document.body.appendChild(bottomButton);
      console.log('[Back Button] Bottom button appended to end of body');
    }

    console.log('[Back Button] ✓ Top and bottom buttons created and inserted into DOM');
    console.log('[Back Button] Buttons are hidden by default (display: none), will show after last video completion');
    return { topButton, bottomButton };
  }

  // Show both buttons
  function showButtons(buttons, saveState = true) {
    // IMPORTANT: Check if buttons should actually be shown
    if (!shouldShowBackButton()) {
      console.log('[Back Button] ⚠️ Buttons will NOT be displayed - no valid navigation source');
      console.log('[Back Button] Reasons buttons might not show:');
      console.log('[Back Button] - User navigated directly to page (no referrer)');
      console.log('[Back Button] - No custom back URL defined');
      console.log('[Back Button] - Not forced to show via data-show-back-button');
      return; // Don't show buttons
    }

    buttons.topButton.style.display = 'block';
    buttons.bottomButton.style.display = 'block';
    console.log('[Back Button] ✅ Both buttons are now visible!');

    // Save visibility state to localStorage
    if (saveState) {
      BackButtonStorage.set(resourceId, true);
      console.log('[Back Button] State saved to localStorage');
    }
  }

  // Set up video completion tracking
  function setupVideoTracking(buttons) {
    console.log('[Back Button] Setting up video tracking...');

    // FIRST: Check if buttons should be shown at all
    if (!shouldShowBackButton()) {
      console.log('[Back Button] ⚠️ Back buttons will not be shown - no valid navigation source');
      console.log('[Back Button] Skipping video tracking setup');
      return; // Don't set up watchers if buttons won't be shown anyway
    }

    // Check if page has attribute to always show buttons
    const alwaysShow = document.body.getAttribute(CONFIG.ALWAYS_SHOW_ATTRIBUTE);
    if (alwaysShow === 'true') {
      console.log(`[Back Button] ✓ Found ${CONFIG.ALWAYS_SHOW_ATTRIBUTE}="true" on page - showing buttons immediately`);
      showButtons(buttons, true); // Show and save state
      return; // No need to set up watchers
    }

    // Check if page has previousLessonStart constant defined
    if (typeof window.previousLessonStart !== 'undefined' && window.previousLessonStart) {
      console.log('[Back Button] ✓ Found window.previousLessonStart constant - showing buttons immediately');
      showButtons(buttons, true); // Show and save state
      return; // No need to set up watchers
    }

    // Check if buttons were already shown (from cache)
    if (BackButtonStorage.isShown(resourceId)) {
      console.log('[Back Button] Buttons were previously shown for this page (from cache)');
      const savedReferrer = BackButtonStorage.getReferrer(resourceId);
      console.log('[Back Button] Saved referrer URL:', savedReferrer || 'None');
      showButtons(buttons, false); // Show without re-saving (will still check shouldShowBackButton)
      return; // No need to set up watchers
    }

    const videos = getAllVideos();

    if (videos.length === 0) {
      console.warn('[Back Button] ⚠️ No Wistia video containers found on page');
      console.log('[Back Button] Checking if Wistia API is available...');
      console.log('[Back Button] window._wq exists:', typeof window._wq !== 'undefined');
      console.log('[Back Button] Will wait for Wistia videos to load...');
    } else {
      console.log(`[Back Button] Found ${videos.length} Wistia video container(s) on page`);
    }

    window._wq = window._wq || [];
    window._allVideos = window._allVideos || [];
    let setupComplete = false;

    _wq.push({
      _all: function(video) {
        console.log(`[Back Button] ✓ Wistia video detected: ${video.hashedId()}`);
        window._allVideos.push(video);

        // Set up watcher after a short delay to ensure all videos are collected
        if (!setupComplete) {
          setTimeout(function() {
            if (!setupComplete) {
              setupComplete = true;
              console.log(`[Back Button] Setting up watcher for last video (total: ${window._allVideos.length})`);
              setupLastVideoWatcher(buttons);
            }
          }, 2000);
        }
      }
    });

    // Fallback: Check again after 5 seconds if no videos detected
    setTimeout(function() {
      if (!setupComplete && window._allVideos.length === 0) {
        console.warn('[Back Button] ⚠️ No Wistia videos detected after 5 seconds');
        console.log('[Back Button] This could mean:');
        console.log('[Back Button] 1. Wistia API not loaded yet');
        console.log('[Back Button] 2. No videos on this page');
        console.log('[Back Button] 3. Videos are embedded differently');
      }
    }, 5000);
  }

  // Watch the last video for completion
  function setupLastVideoWatcher(buttons) {
    if (!window._allVideos || window._allVideos.length === 0) {
      console.warn("[Back Button] No videos found after initialization");
      return;
    }

    // Get the last video
    const lastVideo = window._allVideos[window._allVideos.length - 1];
    const videoId = lastVideo.hashedId();

    console.log(`[Back Button] ✓ Watching last video: ${videoId} (${window._allVideos.length} total videos)`);

    let buttonsShown = false;
    let checkInterval = null;

    // Watch for 90% completion
    function checkProgress() {
      const percentWatched = lastVideo.percentWatched();
      const percentageValue = Math.floor(percentWatched * 100);

      if (!buttonsShown && percentageValue >= 90) {
        console.log(`[Back Button] Last video reached ${percentageValue}% - showing buttons`);
        showButtons(buttons);
        buttonsShown = true;
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }
    }

    // Bind to play event to start checking
    lastVideo.bind('play', function() {
      console.log(`[Back Button] Last video started playing - monitoring progress`);

      // Clear any existing interval
      if (checkInterval) {
        clearInterval(checkInterval);
      }

      // Check progress every second
      checkInterval = setInterval(function() {
        if (buttonsShown) {
          clearInterval(checkInterval);
          checkInterval = null;
          return;
        }
        checkProgress();
      }, 1000);
    });

    // Bind to pause to stop checking
    lastVideo.bind('pause', function() {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    });

    // Bind to end event
    lastVideo.bind('end', function() {
      if (!buttonsShown) {
        console.log(`[Back Button] Last video ended - showing buttons`);
        showButtons(buttons);
        buttonsShown = true;
      }
    });

    // Check if video is already playing
    if (lastVideo.state() === 'playing') {
      console.log(`[Back Button] Last video is already playing`);
      checkInterval = setInterval(function() {
        if (buttonsShown) {
          clearInterval(checkInterval);
          checkInterval = null;
          return;
        }
        checkProgress();
      }, 1000);
    }
  }

  // Initialize
  function init() {
    console.log('[Back Button] ========================================');
    console.log('[Back Button] Script Initializing...');
    console.log('[Back Button] Document ready state:', document.readyState);
    console.log('[Back Button] ========================================');

    if (document.readyState === 'loading') {
      console.log('[Back Button] Waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', function() {
        console.log('[Back Button] DOMContentLoaded fired');
        injectStyles();
        const buttons = createBackButtons();
        setupVideoTracking(buttons);
      });
    } else {
      console.log('[Back Button] DOM already loaded, proceeding immediately');
      injectStyles();
      const buttons = createBackButtons();
      // Wait a bit for Wistia to load
      console.log('[Back Button] Waiting 1 second for Wistia API to load...');
      setTimeout(function() {
        setupVideoTracking(buttons);
      }, 1000);
    }
  }

  // Start initialization
  init();

})();
