(function() {
  function initButtonDisplay() {
    console.log("[Button Display] Initializing last video watcher");

    window._wq = window._wq || [];
    _wq.push({
      id: "_all",
      onReady: function(video) {
        // Store all videos to identify the last one
        window._allVideos = window._allVideos || [];
        window._allVideos.push(video);

        console.log(`[Button Display] Video detected: ${video.hashedId()}`);
      }
    });

    // After all videos are loaded, set up watcher on the last one
    _wq.push({
      id: "_all",
      onHasData: function() {
        setTimeout(function() {
          setupLastVideoWatcher();
        }, 1000); // Small delay to ensure all videos are registered
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
    console.log(`[Button Display] Watching last video: ${lastVideo.hashedId()}`);

    let buttonShown = false;

    // Watch for 90% completion
    function checkProgress() {
      const percentWatched = lastVideo.percentWatched();
      const percentageValue = percentWatched * 100;

      if (!buttonShown && percentageValue >= 90) {
        showButton();
        buttonShown = true;
      }
    }

    // Bind to play event to start checking
    lastVideo.bind('play', function() {
      console.log("[Button Display] Last video started playing");

      // Check progress every second
      const checkInterval = setInterval(function() {
        if (buttonShown) {
          clearInterval(checkInterval);
          return;
        }
        checkProgress();
      }, 1000);

      // Also check on timechange for more accuracy
      lastVideo.bind('timechange', function() {
        if (!buttonShown) {
          checkProgress();
        }
      });
    });

    // Also handle if video is already playing
    if (lastVideo.state() === 'playing') {
      console.log("[Button Display] Last video is already playing");
      const checkInterval = setInterval(function() {
        if (buttonShown) {
          clearInterval(checkInterval);
          return;
        }
        checkProgress();
      }, 1000);
    }
  }

  function showButton() {
    const button = document.getElementById('videoButton');
    if (button) {
      button.style.display = 'block';
      console.log("[Button Display] ✅ Button is now visible!");
    } else {
      console.warn("[Button Display] ⚠️ Button with ID 'videoButton' not found");
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

  // Wait until Wistia loader is ready
  if (window._wq) {
    safeInit();
  } else {
    window._wq = [];
    safeInit();
  }
})();
