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
  const STORAGE_KEY = 'kajabi_button_unlocked';

  // Storage management for button unlock state
  const ButtonStorage = {
    get: function(videoId) {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const unlocked = data ? JSON.parse(data) : {};
        return unlocked[videoId] || false;
      } catch (e) {
        console.warn('[Button Display] Error reading unlock state:', e);
        return false;
      }
    },

    set: function(videoId, unlocked) {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const unlockedStates = data ? JSON.parse(data) : {};
        unlockedStates[videoId] = unlocked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedStates));
        console.log(`[Button Display] Button unlock state saved for video: ${videoId}`);
      } catch (e) {
        console.warn('[Button Display] Error saving unlock state:', e);
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

    // Get the last video
    const lastVideo = window._allVideos[window._allVideos.length - 1];
    const videoId = lastVideo.hashedId();

    console.log(`[Button Display] ✓ Identified last video: ${videoId} (${window._allVideos.length} total videos on page)`);

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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initButtonDisplay);
    } else {
      initButtonDisplay();
    }
  }

  // Start initialization
  safeInit();
})();
