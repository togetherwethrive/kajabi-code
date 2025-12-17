(function() {
  console.log("[Button Display] Script loaded");

  // Get URL parameters - SANITIZED to prevent XSS
  const parsedUrl = new URL(window.location.href);
  const userIdRaw = parsedUrl.searchParams.get('userId') || '';
  const contactIdRaw = parsedUrl.searchParams.get('contactId') || '';
  const resourceIdRaw = parsedUrl.searchParams.get('resourceId') || '';

  // Validate that IDs are numeric only (prevent XSS injection)
  const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
  const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';
  const resourceId = resourceIdRaw.match(/^\d+$/) ? resourceIdRaw : '';

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
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      const hostname = urlObj.hostname;

      const isAllowed = ALLOWED_REDIRECT_DOMAINS.some(domain => {
        return hostname === domain || hostname.endsWith('.' + domain);
      });

      if (!isAllowed) {
        console.warn('[Button Display] Redirect blocked - domain not in whitelist:', hostname);
      }
      return isAllowed;
    } catch (e) {
      console.warn('[Button Display] Invalid URL format:', url);
      return false;
    }
  }

  // Helper function to process URL with parameters
  function processUrlWithParams(url) {
    if (!url) return url;

    // SECURITY: Validate URL against whitelist before processing
    if (!isUrlAllowed(url)) {
      console.error('[Button Display] URL blocked by security policy:', url);
      return '#';
    }

    console.log('[Button Display] Processing URL:', url);
    console.log('[Button Display] Available params - userId:', userId, 'contactId:', contactId, 'resourceId:', resourceId);

    let processedUrl = url;
    let hasPlaceholder = false;

    // Check and replace square bracket placeholders [user-id], [userId], [contactId], [resourceId]
    if (userId) {
      if (processedUrl.includes('[user-id]') || processedUrl.includes('[userId]')) {
        processedUrl = processedUrl.replace(/\[user-id\]/g, userId);
        processedUrl = processedUrl.replace(/\[userId\]/g, userId);
        hasPlaceholder = true;
      }
    }

    if (contactId) {
      if (processedUrl.includes('[contactId]')) {
        processedUrl = processedUrl.replace(/\[contactId\]/g, contactId);
        hasPlaceholder = true;
      }
    }

    if (resourceId) {
      if (processedUrl.includes('[resourceId]')) {
        processedUrl = processedUrl.replace(/\[resourceId\]/g, resourceId);
        hasPlaceholder = true;
      }
    }

    // Check and replace curly brace placeholders {userId}, {contactId}, {resourceId}
    if (userId && processedUrl.includes('{userId}')) {
      processedUrl = processedUrl.replace(/\{userId\}/g, userId);
      hasPlaceholder = true;
    }

    if (contactId && processedUrl.includes('{contactId}')) {
      processedUrl = processedUrl.replace(/\{contactId\}/g, contactId);
      hasPlaceholder = true;
    }

    if (resourceId && processedUrl.includes('{resourceId}')) {
      processedUrl = processedUrl.replace(/\{resourceId\}/g, resourceId);
      hasPlaceholder = true;
    }

    // If no placeholders were found, append as query parameters
    if (!hasPlaceholder) {
      try {
        const urlObj = new URL(processedUrl);

        if (userId) {
          urlObj.searchParams.set('userId', userId);
        }

        if (contactId) {
          urlObj.searchParams.set('contactId', contactId);
        }

        // Only append resourceId if the URL doesn't already contain a numeric resourceId in the path
        const hasResourceIdInPath = /\/\d{4,}\//.test(processedUrl);
        if (resourceId && !hasResourceIdInPath) {
          urlObj.searchParams.set('resourceId', resourceId);
        }

        processedUrl = urlObj.toString();
      } catch (e) {
        console.warn("[Button Display] Invalid URL format:", processedUrl, e);
      }
    }

    console.log('[Button Display] Processed URL:', processedUrl);
    return processedUrl;
  }

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'kajabi_button_unlocked',
    SESSION_STORAGE_KEY: 'kajabi_button_unlocked_session',
    COOKIE_STORAGE_KEY: 'kjb_btn',
    COOKIE_MAX_AGE_DAYS: 365
  };

  // Detect Apple devices and Safari
  const isAppleDevice = /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Multi-tier storage availability flags
  let localStorageAvailable = true;
  let sessionStorageAvailable = true;
  let cookieStorageAvailable = true;

  // In-memory fallback
  let memoryStorage = {};

  // Test localStorage availability
  try {
    if (!window.localStorage) {
      throw new Error('localStorage is not defined');
    }

    const testKey = '__button_test__';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (testValue !== 'test') {
      throw new Error('localStorage read/write test failed');
    }

    // Pre-populate memory storage with existing localStorage data
    const existingData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (existingData) {
      memoryStorage = Object.assign({}, JSON.parse(existingData));
      console.log('[Button Display] ✓ localStorage available - loaded existing state');
    }
  } catch (e) {
    console.warn('[Button Display] localStorage not available:', e.message);
    localStorageAvailable = false;
  }

  // Test sessionStorage availability (Safari private mode fallback)
  try {
    if (!window.sessionStorage) {
      throw new Error('sessionStorage is not defined');
    }

    const testKey = '__button_session_test__';
    sessionStorage.setItem(testKey, 'test');
    const testValue = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);

    if (testValue !== 'test') {
      throw new Error('sessionStorage read/write test failed');
    }

    // If localStorage failed but sessionStorage works, load from session
    if (!localStorageAvailable) {
      const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
      if (sessionData) {
        memoryStorage = Object.assign({}, JSON.parse(sessionData));
        console.log('[Button Display] ✓ sessionStorage available - loaded session state');
      }
    }
  } catch (e) {
    console.warn('[Button Display] sessionStorage not available:', e.message);
    sessionStorageAvailable = false;
  }

  // Cookie storage helper
  const CookieStorage = {
    save: function(videoId, unlocked) {
      try {
        if (unlocked) {
          const maxAge = CONFIG.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
          const cookieName = CONFIG.COOKIE_STORAGE_KEY + '_' + videoId;
          document.cookie = cookieName + '=1; max-age=' + maxAge + '; path=/; SameSite=Lax';
        }
      } catch (e) {
        // Cookie write failed, silently ignore
      }
    },

    get: function(videoId) {
      try {
        const cookieName = CONFIG.COOKIE_STORAGE_KEY + '_' + videoId;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.indexOf(cookieName + '=') === 0) {
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    },

    loadAll: function() {
      try {
        const unlocked = {};
        const cookies = document.cookie.split(';');
        const prefix = CONFIG.COOKIE_STORAGE_KEY + '_';

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.indexOf(prefix) === 0) {
            const parts = cookie.split('=');
            if (parts.length === 2) {
              const videoId = parts[0].substring(prefix.length);
              unlocked[videoId] = true;
            }
          }
        }
        return unlocked;
      } catch (e) {
        return {};
      }
    }
  };

  // Test cookie availability
  try {
    document.cookie = '__button_cookie_test__=test; max-age=60; SameSite=Lax';
    const cookieWorks = document.cookie.indexOf('__button_cookie_test__=test') !== -1;
    document.cookie = '__button_cookie_test__=; max-age=0'; // Delete test cookie

    if (!cookieWorks) {
      throw new Error('Cookies are disabled');
    }

    // If both storages failed, try loading from cookie
    if (!localStorageAvailable && !sessionStorageAvailable) {
      const cookieData = CookieStorage.loadAll();
      if (Object.keys(cookieData).length > 0) {
        memoryStorage = Object.assign({}, cookieData);
        console.log('[Button Display] ✓ Cookie storage available - loaded cookie state');
      }
    }
  } catch (e) {
    console.warn('[Button Display] Cookies not available:', e.message);
    cookieStorageAvailable = false;
  }

  // Report storage status
  if (!localStorageAvailable && !sessionStorageAvailable && !cookieStorageAvailable) {
    console.warn('[Button Display] ⚠️ All storage methods unavailable - using memory only (state will not persist)');
  } else {
    const availableMethods = [];
    if (localStorageAvailable) availableMethods.push('localStorage');
    if (sessionStorageAvailable) availableMethods.push('sessionStorage');
    if (cookieStorageAvailable) availableMethods.push('cookies');
    console.log('[Button Display] Available storage methods:', availableMethods.join(', '));
  }

  // Storage management for button unlock state (multi-tier with fallbacks)
  const ButtonStorage = {
    get: function(videoId) {
      try {
        // Check all available storage methods and return true if found in any

        // Check memory storage
        if (memoryStorage[videoId]) {
          return true;
        }

        // Check localStorage
        if (localStorageAvailable) {
          try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            const unlocked = data ? JSON.parse(data) : {};
            if (unlocked[videoId]) {
              return true;
            }
          } catch (e) {
            // Ignore read errors
          }
        }

        // Check sessionStorage (Safari private mode)
        if (sessionStorageAvailable) {
          try {
            const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
            const sessionUnlocked = sessionData ? JSON.parse(sessionData) : {};
            if (sessionUnlocked[videoId]) {
              return true;
            }
          } catch (e) {
            // Ignore read errors
          }
        }

        // Check cookies (last resort)
        if (cookieStorageAvailable) {
          if (CookieStorage.get(videoId)) {
            return true;
          }
        }

        return false;
      } catch (e) {
        console.warn('[Button Display] Error reading unlock state:', e.message);
        return memoryStorage[videoId] || false;
      }
    },

    set: function(videoId, unlocked) {
      try {
        // Always update memory storage first (guaranteed to work)
        memoryStorage[videoId] = unlocked;

        // PRIORITY 1: Try localStorage (best option - persists across sessions)
        if (localStorageAvailable) {
          try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            const unlockedStates = data ? JSON.parse(data) : {};
            unlockedStates[videoId] = unlocked;
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(unlockedStates));
          } catch (storageError) {
            if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
              console.warn('[Button Display] localStorage quota exceeded - switching to fallback storage');
            } else {
              console.warn('[Button Display] localStorage error:', storageError.message);
            }
            localStorageAvailable = false;
          }
        }

        // PRIORITY 2: Try sessionStorage (Safari private mode - persists during session)
        if (sessionStorageAvailable) {
          try {
            const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
            const sessionUnlocked = sessionData ? JSON.parse(sessionData) : {};
            sessionUnlocked[videoId] = unlocked;
            sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionUnlocked));
          } catch (sessionError) {
            console.warn('[Button Display] sessionStorage error:', sessionError.message);
            sessionStorageAvailable = false;
          }
        }

        // PRIORITY 3: Try cookies (works even when storage APIs fail)
        if (cookieStorageAvailable) {
          CookieStorage.save(videoId, unlocked);
        }

        console.log(`[Button Display] Button unlock state saved for video: ${videoId}`);
      } catch (e) {
        console.warn('[Button Display] Error saving unlock state:', e.message);
      }
    }
  };

  // Check if button exists on page (with retry mechanism)
  function checkButton(retryCount) {
    retryCount = retryCount || 0;
    const button = document.getElementById('videoButton');

    if (button) {
      console.log("[Button Display] ✓ Button found with ID 'videoButton'");
      return true;
    } else {
      console.warn(`[Button Display] ⚠️ Button with ID 'videoButton' not found (attempt ${retryCount + 1}/5)`);

      // Retry up to 5 times with 1 second delay
      if (retryCount < 4) {
        setTimeout(function() {
          if (!document.getElementById('videoButton')) {
            checkButton(retryCount + 1);
          } else {
            console.log("[Button Display] ✓ Button found on retry - continuing initialization");
            // Button appeared, continue with initialization
            continueInitialization();
          }
        }, 1000);
      } else {
        console.error("[Button Display] ❌ Button still not found after 5 attempts - aborting");
      }
      return false;
    }
  }

  let initStarted = false;

  function continueInitialization() {
    if (initStarted) return; // Prevent duplicate initialization
    initStarted = true;

    console.log("[Button Display] Continuing with video detection...");
    setupVideoDetection();
  }

  function initButtonDisplay() {
    console.log("[Button Display] Initializing...");

    // Check if button exists with retry mechanism
    const hasButton = checkButton(0);
    if (hasButton) {
      // Button found immediately, continue
      continueInitialization();
    }
    // If button not found, checkButton will retry automatically
  }

  function setupVideoDetection() {
    window._wq = window._wq || [];
    window._allVideos = window._allVideos || [];
    let setupComplete = false;
    let videoDetectionTimeout = null;

    _wq.push({
      _all: function(video) {
        console.log(`[Button Display] Video detected: ${video.hashedId()}`);

        // Store video reference
        window._allVideos.push(video);

        // Clear any existing timeout
        if (videoDetectionTimeout) {
          clearTimeout(videoDetectionTimeout);
        }

        // Set up watcher after a delay to ensure all videos are collected
        // Use longer delay (3 seconds) to be more reliable
        if (!setupComplete) {
          videoDetectionTimeout = setTimeout(function() {
            if (!setupComplete) {
              setupComplete = true;
              console.log(`[Button Display] Video detection complete - found ${window._allVideos.length} video(s)`);
              setupLastVideoWatcher();
            }
          }, 3000);
        }
      }
    });

    // Fallback: If no videos detected after 5 seconds, log error
    setTimeout(function() {
      if (!setupComplete && window._allVideos.length === 0) {
        console.error("[Button Display] ❌ No videos detected after 5 seconds");
        console.error("[Button Display] Make sure Wistia videos exist on the page with proper embed code");
      }
    }, 5000);
  }

  function setupLastVideoWatcher() {
    if (!window._allVideos || window._allVideos.length === 0) {
      console.warn("[Button Display] No videos found on page");
      return;
    }

    // CRITICAL: Sort videos by DOM order to ensure we get the actual last video on the page
    // Safari may load videos asynchronously in different order than they appear in DOM
    const sortedVideos = window._allVideos.slice().sort(function(a, b) {
      const containerA = a.container;
      const containerB = b.container;

      // Use compareDocumentPosition to determine DOM order
      const position = containerA.compareDocumentPosition(containerB);

      // DOCUMENT_POSITION_FOLLOWING means containerB comes after containerA in DOM
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1; // A comes before B
      }
      // DOCUMENT_POSITION_PRECEDING means containerB comes before containerA in DOM
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1; // A comes after B
      }
      return 0; // Same position (shouldn't happen)
    });

    console.log(`[Button Display] Videos sorted by DOM order (total: ${sortedVideos.length})`);
    sortedVideos.forEach(function(video, index) {
      console.log(`[Button Display] Position ${index + 1}: ${video.hashedId()}`);
    });

    // Get the last video based on DOM order
    const lastVideo = sortedVideos[sortedVideos.length - 1];
    const videoId = lastVideo.hashedId();

    console.log(`[Button Display] ✓ Identified last video (by DOM position): ${videoId}`);

    let buttonShown = false;
    let checkInterval = null;

    // Check if button was already unlocked (from cache)
    if (ButtonStorage.get(videoId)) {
      console.log(`[Button Display] Button was previously unlocked for video: ${videoId}`);
      showButton(videoId);
      buttonShown = true;
      return; // No need to set up watchers
    }

    // Watch for 90% completion
    function checkProgress() {
      if (buttonShown) return; // Already shown, no need to check

      const percentWatched = lastVideo.percentWatched();
      const percentageValue = Math.floor(percentWatched * 100);
      console.log(`[Button Display] Progress check: ${percentageValue}%`);

      if (percentageValue >= 90) {
        console.log(`[Button Display] 90% threshold reached - showing button`);
        showButton(videoId);
        buttonShown = true;
        stopChecking();
      }
    }

    // Function to stop checking
    function stopChecking() {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
        console.log('[Button Display] Progress checking stopped');
      }
    }

    // Function to start checking
    function startChecking() {
      if (buttonShown) return; // Don't start if button already shown

      // Clear any existing interval
      stopChecking();

      // Check progress every second
      checkInterval = setInterval(function() {
        if (buttonShown) {
          stopChecking();
          return;
        }
        checkProgress();
      }, 1000);

      console.log('[Button Display] Progress checking started');
    }

    // Bind to play event to start checking
    lastVideo.bind('play', function() {
      console.log(`[Button Display] Video ${videoId} started playing - monitoring progress`);
      startChecking();
    });

    // Bind to pause - DON'T stop checking completely, just pause the interval
    // Resume will be handled by play event
    lastVideo.bind('pause', function() {
      console.log(`[Button Display] Video ${videoId} paused`);
      // Check progress one more time in case they paused after 90%
      checkProgress();
      stopChecking();
    });

    // Bind to end event - IMPORTANT for reliability
    lastVideo.bind('end', function() {
      console.log(`[Button Display] Video ${videoId} ended event fired`);
      if (!buttonShown) {
        console.log(`[Button Display] Showing button on video end`);
        showButton(videoId);
        buttonShown = true;
        stopChecking();
      }
    });

    // IMPORTANT: Check current progress immediately
    // Video might already be past 90% when script initializes
    const currentPercent = Math.floor(lastVideo.percentWatched() * 100);
    console.log(`[Button Display] Initial video progress: ${currentPercent}%`);

    if (currentPercent >= 90) {
      console.log(`[Button Display] Video already past 90% - showing button immediately`);
      showButton(videoId);
      buttonShown = true;
      return; // No need to set up watchers
    }

    // Check if video is currently playing
    const currentState = lastVideo.state();
    console.log(`[Button Display] Current video state: ${currentState}`);

    if (currentState === 'playing') {
      console.log(`[Button Display] Video is already playing - starting progress checks`);
      startChecking();
    } else if (currentState === 'ended') {
      console.log(`[Button Display] Video already ended - showing button`);
      showButton(videoId);
      buttonShown = true;
    }

    // Add a safety fallback: Check progress every 5 seconds regardless of events
    // This catches edge cases where events might not fire properly
    const safetyInterval = setInterval(function() {
      if (buttonShown) {
        clearInterval(safetyInterval);
        return;
      }

      const percent = Math.floor(lastVideo.percentWatched() * 100);
      if (percent >= 90) {
        console.log(`[Button Display] Safety check: ${percent}% reached - showing button`);
        showButton(videoId);
        buttonShown = true;
        clearInterval(safetyInterval);
        stopChecking();
      }
    }, 5000);
  }

  function showButton(videoId) {
    console.log(`[Button Display] showButton() called with videoId: ${videoId}`);
    const button = document.getElementById('videoButton');

    if (button) {
      console.log(`[Button Display] Button element found, current display: ${button.style.display}`);

      // Process URL parameters in onclick handler
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr) {
        console.log('[Button Display] Found onclick handler, processing URL parameters');

        // Extract URL from onclick (handles both href='' and href="")
        const urlMatch = onclickAttr.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (urlMatch && urlMatch[1]) {
          const originalUrl = urlMatch[1];
          const processedUrl = processUrlWithParams(originalUrl);

          // Update onclick with processed URL
          const newOnclick = onclickAttr.replace(originalUrl, processedUrl);
          button.setAttribute('onclick', newOnclick);
          console.log('[Button Display] ✓ URL parameters replaced in onclick handler');
        }
      }

      // Also check and process href attribute if it exists
      const href = button.getAttribute('href');
      if (href) {
        const processedHref = processUrlWithParams(href);
        button.setAttribute('href', processedHref);
        console.log('[Button Display] ✓ URL parameters replaced in href attribute');
      }

      button.style.display = 'inline-block';
      console.log("[Button Display] ✅ Button is now visible!");

      // Save unlock state to cache if videoId is provided
      if (videoId) {
        ButtonStorage.set(videoId, true);
      }
    } else {
      console.warn("[Button Display] ⚠️ Button with id 'videoButton' not found in DOM");
    }
  }

  // Safe initialization
  function safeInit() {
    console.log('[Button Display] Safari optimized - using multi-tier storage');

    // Safari-specific: Sync all storage tiers before unload
    window.addEventListener('beforeunload', function() {
      try {
        // Force sync memory to all available storage methods
        Object.keys(memoryStorage).forEach(function(videoId) {
          const unlocked = memoryStorage[videoId];

          // Write to all available storage tiers
          if (localStorageAvailable) {
            try {
              const data = localStorage.getItem(CONFIG.STORAGE_KEY);
              const unlockedStates = data ? JSON.parse(data) : {};
              unlockedStates[videoId] = unlocked;
              localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(unlockedStates));
            } catch (e) {
              // Ignore
            }
          }

          if (sessionStorageAvailable) {
            try {
              const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
              const sessionUnlocked = sessionData ? JSON.parse(sessionData) : {};
              sessionUnlocked[videoId] = unlocked;
              sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionUnlocked));
            } catch (e) {
              // Ignore
            }
          }

          if (cookieStorageAvailable) {
            CookieStorage.save(videoId, unlocked);
          }
        });
        console.log('[Button Display] State synced before unload');
      } catch (e) {
        console.warn('[Button Display] Error during unload sync:', e.message);
      }
    });

    // Safari iOS: Handle page going to background
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        console.log('[Button Display] Page hidden - syncing state');
        // Same sync logic as beforeunload
        try {
          Object.keys(memoryStorage).forEach(function(videoId) {
            const unlocked = memoryStorage[videoId];

            if (localStorageAvailable) {
              try {
                const data = localStorage.getItem(CONFIG.STORAGE_KEY);
                const unlockedStates = data ? JSON.parse(data) : {};
                unlockedStates[videoId] = unlocked;
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(unlockedStates));
              } catch (e) {
                // Ignore
              }
            }

            if (sessionStorageAvailable) {
              try {
                const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
                const sessionUnlocked = sessionData ? JSON.parse(sessionData) : {};
                sessionUnlocked[videoId] = unlocked;
                sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionUnlocked));
              } catch (e) {
                // Ignore
              }
            }

            if (cookieStorageAvailable) {
              CookieStorage.save(videoId, unlocked);
            }
          });
        } catch (e) {
          console.warn('[Button Display] Error during visibility sync:', e.message);
        }
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initButtonDisplay);
    } else {
      initButtonDisplay();
    }
  }

  // Start initialization
  safeInit();
})();
