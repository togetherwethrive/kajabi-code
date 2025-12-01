(function() {
  console.log("[Button Display] Script loaded");

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

    // Watch for 90% completion
    function checkProgress() {
      const percentWatched = lastVideo.percentWatched();
      const percentageValue = Math.floor(percentWatched * 100);

      if (!buttonShown && percentageValue >= 90) {
        showButton();
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
        showButton();
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

  function showButton() {
    const button = document.getElementById('videoButton');
    if (button) {
      button.style.display = 'inline-block';
      console.log("[Button Display] ✅ Button is now visible!");
    } else {
      console.warn("[Button Display] ⚠️ Button disappeared from DOM");
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
