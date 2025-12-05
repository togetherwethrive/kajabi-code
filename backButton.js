(function() {
  'use strict';

  console.log('[Back Button] Script loaded');

  // Configuration
  const CONFIG = {
    BUTTON_TEXT: 'Previous Lesson',
    BUTTON_COLOR: '#291d5c',
    BUTTON_TEXT_COLOR: '#fff',
    TOP_BUTTON_MARGIN: '20px', // Margin from top of page
    BOTTOM_BUTTON_MARGIN: '30px' // Margin above footer
  };

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

  // Create back buttons
  function createBackButtons() {
    // Create top button
    const topButton = document.createElement('button');
    topButton.id = 'back-button-top';
    topButton.className = 'back-navigation-button';
    topButton.textContent = CONFIG.BUTTON_TEXT;
    topButton.setAttribute('aria-label', 'Go back to previous lesson');
    topButton.addEventListener('click', function() {
      console.log('[Back Button] Top button clicked - navigating back');
      window.history.back();
    });

    // Create bottom button
    const bottomButton = document.createElement('button');
    bottomButton.id = 'back-button-bottom';
    bottomButton.className = 'back-navigation-button';
    bottomButton.textContent = CONFIG.BUTTON_TEXT;
    bottomButton.setAttribute('aria-label', 'Go back to previous lesson');
    bottomButton.addEventListener('click', function() {
      console.log('[Back Button] Bottom button clicked - navigating back');
      window.history.back();
    });

    // Insert top button at the beginning of body
    if (document.body.firstChild) {
      document.body.insertBefore(topButton, document.body.firstChild);
    } else {
      document.body.appendChild(topButton);
    }

    // Insert bottom button before footer or at end of body
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(bottomButton, footer);
    } else {
      document.body.appendChild(bottomButton);
    }

    console.log('[Back Button] Top and bottom buttons created');
    return { topButton, bottomButton };
  }

  // Show both buttons
  function showButtons(buttons) {
    buttons.topButton.style.display = 'block';
    buttons.bottomButton.style.display = 'block';
    console.log('[Back Button] ✅ Both buttons are now visible!');
  }

  // Set up video completion tracking
  function setupVideoTracking(buttons) {
    const videos = getAllVideos();

    if (videos.length === 0) {
      console.log('[Back Button] No videos found on page - buttons will not be shown');
      return;
    }

    console.log(`[Back Button] Found ${videos.length} video(s) on page`);

    window._wq = window._wq || [];
    window._allVideos = window._allVideos || [];
    let setupComplete = false;

    _wq.push({
      _all: function(video) {
        console.log(`[Back Button] Video detected: ${video.hashedId()}`);
        window._allVideos.push(video);

        // Set up watcher after a short delay to ensure all videos are collected
        if (!setupComplete) {
          setTimeout(function() {
            if (!setupComplete) {
              setupComplete = true;
              setupLastVideoWatcher(buttons);
            }
          }, 2000);
        }
      }
    });
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
    console.log('[Back Button] Initializing...');

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        injectStyles();
        const buttons = createBackButtons();
        setupVideoTracking(buttons);
      });
    } else {
      injectStyles();
      const buttons = createBackButtons();
      // Wait a bit for Wistia to load
      setTimeout(function() {
        setupVideoTracking(buttons);
      }, 1000);
    }
  }

  // Start initialization
  init();

})();
