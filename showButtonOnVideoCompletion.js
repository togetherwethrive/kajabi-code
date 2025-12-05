(function() {
  console.log("[Button Display] Script loaded");

  // Get URL parameters
  const parsedUrl = new URL(window.location.href);
  const userId = parsedUrl.searchParams.get('userId');
  const contactId = parsedUrl.searchParams.get('contactId');
  const resourceId = parsedUrl.searchParams.get('resourceId');

  // Helper function to process URL with parameters
  function processUrlWithParams(url) {
    if (!url) return url;

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

  // Check if button exists on page
  function checkButton() {
    const button = document.getElementById('videoButton');
    if (button) {
      console.log("[Button Display] ✓ Button found with ID 'videoButton'");
      return true;
    } else {
      console.warn("[Button Display] ⚠️ Button with ID 'videoButton' not found on page");
      return false;
    }
  }

  function initButtonDisplay() {
    console.log("[Button Display] Initializing...");

    // Check if button exists early
    const hasButton = checkButton();
    if (!hasButton) {
      console.warn("[Button Display] Aborting - no button to display");
      return;
    }

    window._wq = window._wq || [];
    window._allVideos = window._allVideos || [];
    let setupComplete = false;

    _wq.push({
      _all: function(video) {
        console.log(`[Button Display] Video detected: ${video.hashedId()}`);

        // Store video reference
        window._allVideos.push(video);

        // Set up watcher after a short delay to ensure all videos are collected
        if (!setupComplete) {
          setTimeout(function() {
            if (!setupComplete) {
              setupComplete = true;
              setupLastVideoWatcher();
            }
          }, 2000);
        }
      }
    });
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
      showButton();
      buttonShown = true;
      return; // No need to set up watchers
    }

    // Watch for 90% completion
    function checkProgress() {
      const percentWatched = lastVideo.percentWatched();
      const percentageValue = Math.floor(percentWatched * 100);
      console.log(`[Button Display] Progress check: ${percentageValue}%`);

      if (!buttonShown && percentageValue >= 90) {
        console.log(`[Button Display] 90% threshold reached - showing button`);
        showButton(videoId);
        buttonShown = true;
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }
    }

    // Bind to play event to start checking
    lastVideo.bind('play', function() {
      console.log(`[Button Display] Video ${videoId} started playing - monitoring progress`);

      // Clear any existing interval
      if (checkInterval) {
        clearInterval(checkInterval);
      }

      // Check progress every second
      checkInterval = setInterval(function() {
        if (buttonShown) {
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
      if (!buttonShown) {
        console.log(`[Button Display] Video ${videoId} ended - showing button`);
        showButton(videoId);
        buttonShown = true;
      }
    });

    // Check if video is already playing
    if (lastVideo.state() === 'playing') {
      console.log(`[Button Display] Video ${videoId} is already playing`);
      checkInterval = setInterval(function() {
        if (buttonShown) {
          clearInterval(checkInterval);
          checkInterval = null;
          return;
        }
        checkProgress();
      }, 1000);
    }
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
