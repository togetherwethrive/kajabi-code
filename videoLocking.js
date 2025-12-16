(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    UNLOCK_THRESHOLD: 90, // Percentage watched to unlock next video
    STORAGE_KEY: 'kajabi_video_progress',
    CHECK_INTERVAL: 2000, // Check for new videos every 2 seconds
    SESSION_STORAGE_KEY: 'kajabi_video_progress_session', // Fallback for Safari private mode
    COOKIE_STORAGE_KEY: 'kjb_vp', // Cookie fallback for critical progress
    COOKIE_MAX_AGE_DAYS: 365 // Keep cookie for 1 year
  };

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const contactId = urlParams.get('contactId');

  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  // Check if we have valid user credentials
  if (!userId || !isNumeric(userId)) {
    console.warn('[VideoLock] Missing or invalid userId - locking disabled');
    return;
  }

  // Detect Apple devices
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

    const testKey = '__videolock_test__';
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
      console.log('[VideoLock] ✓ localStorage available - loaded existing progress');
    }
  } catch (e) {
    console.warn('[VideoLock] localStorage not available:', e.message);
    localStorageAvailable = false;
  }

  // Test sessionStorage availability (Safari private mode fallback)
  try {
    if (!window.sessionStorage) {
      throw new Error('sessionStorage is not defined');
    }

    const testKey = '__videolock_session_test__';
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
        console.log('[VideoLock] ✓ sessionStorage available - loaded session progress');
      }
    }
  } catch (e) {
    console.warn('[VideoLock] sessionStorage not available:', e.message);
    sessionStorageAvailable = false;
  }

  // Cookie storage helper (for critical progress only due to size limits)
  const CookieStorage = {
    save: function(resourceId, percentage) {
      try {
        // Store only completed videos in cookies to save space (4KB limit)
        if (percentage >= CONFIG.UNLOCK_THRESHOLD) {
          const maxAge = CONFIG.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
          const cookieName = CONFIG.COOKIE_STORAGE_KEY + '_' + resourceId;
          document.cookie = cookieName + '=' + percentage + '; max-age=' + maxAge + '; path=/; SameSite=Lax';
        }
      } catch (e) {
        // Cookie write failed, silently ignore
      }
    },

    get: function(resourceId) {
      try {
        const cookieName = CONFIG.COOKIE_STORAGE_KEY + '_' + resourceId;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.indexOf(cookieName + '=') === 0) {
            const value = cookie.substring(cookieName.length + 1);
            return parseInt(value, 10) || 0;
          }
        }
        return 0;
      } catch (e) {
        return 0;
      }
    },

    loadAll: function() {
      try {
        const progress = {};
        const cookies = document.cookie.split(';');
        const prefix = CONFIG.COOKIE_STORAGE_KEY + '_';

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.indexOf(prefix) === 0) {
            const parts = cookie.split('=');
            if (parts.length === 2) {
              const resourceId = parts[0].substring(prefix.length);
              const percentage = parseInt(parts[1], 10) || 0;
              progress[resourceId] = percentage;
            }
          }
        }
        return progress;
      } catch (e) {
        return {};
      }
    }
  };

  // Test cookie availability
  try {
    document.cookie = '__videolock_cookie_test__=test; max-age=60; SameSite=Lax';
    const cookieWorks = document.cookie.indexOf('__videolock_cookie_test__=test') !== -1;
    document.cookie = '__videolock_cookie_test__=; max-age=0'; // Delete test cookie

    if (!cookieWorks) {
      throw new Error('Cookies are disabled');
    }

    // If both storages failed, try loading from cookie
    if (!localStorageAvailable && !sessionStorageAvailable) {
      const cookieData = CookieStorage.loadAll();
      if (Object.keys(cookieData).length > 0) {
        memoryStorage = Object.assign({}, cookieData);
        console.log('[VideoLock] ✓ Cookie storage available - loaded cookie progress');
      }
    }
  } catch (e) {
    console.warn('[VideoLock] Cookies not available:', e.message);
    cookieStorageAvailable = false;
  }

  // Report storage status
  if (!localStorageAvailable && !sessionStorageAvailable && !cookieStorageAvailable) {
    console.warn('[VideoLock] ⚠️ All storage methods unavailable - using memory only (session will not persist)');
  } else {
    const availableMethods = [];
    if (localStorageAvailable) availableMethods.push('localStorage');
    if (sessionStorageAvailable) availableMethods.push('sessionStorage');
    if (cookieStorageAvailable) availableMethods.push('cookies');
    console.log('[VideoLock] Available storage methods:', availableMethods.join(', '));
  }

  // Storage management (multi-tier with fallbacks)
  const VideoProgress = {
    get: function(resourceId) {
      try {
        let progress = 0;

        // Check all available storage methods and use the highest value
        // This handles cases where data might be in different places

        // Check memory storage
        progress = Math.max(progress, memoryStorage[resourceId] || 0);

        // Check localStorage
        if (localStorageAvailable) {
          try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            const localProgress = data ? JSON.parse(data) : {};
            progress = Math.max(progress, localProgress[resourceId] || 0);
          } catch (e) {
            // Ignore read errors
          }
        }

        // Check sessionStorage (Safari private mode)
        if (sessionStorageAvailable) {
          try {
            const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
            const sessionProgress = sessionData ? JSON.parse(sessionData) : {};
            progress = Math.max(progress, sessionProgress[resourceId] || 0);
          } catch (e) {
            // Ignore read errors
          }
        }

        // Check cookies (last resort)
        if (cookieStorageAvailable) {
          const cookieProgress = CookieStorage.get(resourceId);
          progress = Math.max(progress, cookieProgress || 0);
        }

        return progress;
      } catch (e) {
        console.warn('[VideoLock] Error reading progress:', e.message);
        return memoryStorage[resourceId] || 0;
      }
    },

    set: function(resourceId, percentage) {
      try {
        // Always update memory storage first (guaranteed to work)
        memoryStorage[resourceId] = Math.max(memoryStorage[resourceId] || 0, percentage);

        // PRIORITY 1: Try localStorage (best option - persists across sessions)
        if (localStorageAvailable) {
          try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            const progress = data ? JSON.parse(data) : {};
            progress[resourceId] = Math.max(progress[resourceId] || 0, percentage);
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progress));
          } catch (storageError) {
            if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
              console.warn('[VideoLock] localStorage quota exceeded - switching to fallback storage');
            } else {
              console.warn('[VideoLock] localStorage error:', storageError.message);
            }
            localStorageAvailable = false;
          }
        }

        // PRIORITY 2: Try sessionStorage (Safari private mode - persists during session)
        if (sessionStorageAvailable) {
          try {
            const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
            const sessionProgress = sessionData ? JSON.parse(sessionData) : {};
            sessionProgress[resourceId] = Math.max(sessionProgress[resourceId] || 0, percentage);
            sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionProgress));
          } catch (sessionError) {
            console.warn('[VideoLock] sessionStorage error:', sessionError.message);
            sessionStorageAvailable = false;
          }
        }

        // PRIORITY 3: Try cookies (works even when storage APIs fail, but has size limits)
        if (cookieStorageAvailable) {
          CookieStorage.save(resourceId, percentage);
        }
      } catch (e) {
        console.warn('[VideoLock] Error saving progress:', e.message);
      }
    },

    isCompleted: function(resourceId) {
      const progress = this.get(resourceId);
      return progress >= CONFIG.UNLOCK_THRESHOLD;
    },

    // Diagnostic function for debugging storage issues
    diagnostics: function() {
      console.log('=== VideoLock Storage Diagnostics ===');
      console.log('Device Info:');
      console.log('  - Is Apple Device:', isAppleDevice);
      console.log('  - Is Safari:', isSafari);
      console.log('  - User Agent:', navigator.userAgent);
      console.log('\nStorage Status:');
      console.log('  - localStorage Available:', localStorageAvailable);
      console.log('  - sessionStorage Available:', sessionStorageAvailable);
      console.log('  - Cookies Available:', cookieStorageAvailable);
      console.log('\nMemory Storage:');
      console.log('  - Keys Count:', Object.keys(memoryStorage).length);
      console.log('  - Data:', memoryStorage);

      if (localStorageAvailable) {
        console.log('\nlocalStorage Data:');
        try {
          const data = localStorage.getItem(CONFIG.STORAGE_KEY);
          console.log('  ', data ? JSON.parse(data) : 'empty');
        } catch (e) {
          console.log('  - Read Error:', e.message);
        }
      }

      if (sessionStorageAvailable) {
        console.log('\nsessionStorage Data:');
        try {
          const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
          console.log('  ', sessionData ? JSON.parse(sessionData) : 'empty');
        } catch (e) {
          console.log('  - Read Error:', e.message);
        }
      }

      if (cookieStorageAvailable) {
        console.log('\nCookie Data:');
        console.log('  ', CookieStorage.loadAll());
      }

      console.log('====================================');
    }
  };

  // Expose diagnostics function to window for console debugging
  window.videoLockDiagnostics = VideoProgress.diagnostics;

  // Get all video containers sorted by DOM order
  function getAllVideos() {
    const videos = [];
    const wistiaContainers = document.querySelectorAll('[class*="wistia_embed"]');

    wistiaContainers.forEach((container) => {
      const resourceId = container.getAttribute('data-resource-id');
      const lockVideo = container.getAttribute('data-lock-video');

      if (resourceId && isNumeric(resourceId)) {
        const isAlwaysUnlocked = lockVideo === 'false';
        videos.push({
          container: container,
          resourceId: resourceId,
          index: videos.length,
          isAlwaysUnlocked: isAlwaysUnlocked
        });
      }
    });

    return videos;
  }

  // Create lock overlay
  function createLockOverlay(videoData) {
    const overlay = document.createElement('div');
    overlay.className = 'video-lock-overlay';
    overlay.setAttribute('data-video-index', videoData.index);

    overlay.innerHTML = `
      <div class="video-lock-content">
        <div class="video-lock-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="video-lock-message">
          <h3>Video Locked</h3>
          <p>Complete the previous video to unlock</p>
        </div>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('video-lock-styles')) {
      const styles = document.createElement('style');
      styles.id = 'video-lock-styles';
      styles.textContent = `
        .video-lock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(41, 29, 92, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: not-allowed;
          backdrop-filter: blur(5px);
        }

        .video-lock-content {
          text-align: center;
          color: #fff !important;
          padding: 20px;
        }

        .video-lock-icon {
          margin-bottom: 20px;
          opacity: 0.9;
        }

        .video-lock-icon svg {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        .video-lock-message h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 600;
          color: #fff !important;
          opacity: 1 !important;
        }

        .video-lock-message p {
          margin: 0;
          font-size: 16px;
          color: #fff !important;
          opacity: 0.9 !important;
        }

        .video-unlocked-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #10b981;
          color: #fff;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 1;
          transition: opacity 0.5s ease-out;
        }

        .video-unlocked-badge.fade-out {
          opacity: 0;
        }

        .video-container-wrapper {
          position: relative;
        }
      `;
      document.head.appendChild(styles);
    }

    return overlay;
  }

  // Add unlocked badge to video
  function addUnlockedBadge(container) {
    if (container.querySelector('.video-unlocked-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'video-unlocked-badge';
    badge.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Unlocked</span>
    `;

    container.style.position = 'relative';
    container.appendChild(badge);

    // Auto-hide badge after 3 seconds (fade out + remove)
    setTimeout(function() {
      badge.classList.add('fade-out');
      setTimeout(function() {
        if (badge.parentNode) {
          badge.remove();
        }
      }, 500);
    }, 3000);
  }

  // Lock a video
  function lockVideo(videoData) {
    const container = videoData.container;

    // Make sure container is positioned relatively
    if (!container.closest('.video-container-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'video-container-wrapper';
      container.parentNode.insertBefore(wrapper, container);
      wrapper.appendChild(container);
    }

    // Add overlay if not present
    const existingOverlay = container.querySelector('.video-lock-overlay');
    if (!existingOverlay) {
      const overlay = createLockOverlay(videoData);
      container.appendChild(overlay);
    }
  }

  // Unlock a video
  function unlockVideo(videoData) {
    const container = videoData.container;
    const overlay = container.querySelector('.video-lock-overlay');

    if (overlay) {
      overlay.remove();
      addUnlockedBadge(container);
    }

    // Mark container as unlocked to prevent re-locking
    container.setAttribute('data-video-unlocked', 'true');
  }

  // Check if previous videos are completed
  function isPreviousVideosCompleted(videos, currentIndex) {
    if (currentIndex === 0) return true;

    for (let i = 0; i < currentIndex; i++) {
      // Skip videos that are always unlocked (data-lock-video="false")
      if (videos[i].isAlwaysUnlocked) {
        continue;
      }

      if (!VideoProgress.isCompleted(videos[i].resourceId)) {
        return false;
      }
    }
    return true;
  }

  // Initialize video locking
  function initializeVideoLocking() {
    const videos = getAllVideos();
    if (videos.length === 0) return;

    // Process each video
    videos.forEach((videoData, index) => {
      const container = videoData.container;
      const isCurrentlyLocked = container.querySelector('.video-lock-overlay') !== null;
      const wasExplicitlyUnlocked = container.getAttribute('data-video-unlocked') === 'true';

      // Check if video should always be unlocked (data-lock-video="false")
      if (videoData.isAlwaysUnlocked) {
        if (isCurrentlyLocked) {
          unlockVideo(videoData);
        }
        return;
      }

      // Never re-lock a video that was explicitly unlocked
      if (wasExplicitlyUnlocked) {
        return;
      }

      const shouldBeUnlocked = isPreviousVideosCompleted(videos, index);

      // Determine action
      if (shouldBeUnlocked && isCurrentlyLocked) {
        // Video should be unlocked but is currently locked
        unlockVideo(videoData);
      } else if (shouldBeUnlocked && !isCurrentlyLocked) {
        // Video should be unlocked and isn't locked - mark it to prevent future re-locking
        unlockVideo(videoData);
      } else if (!shouldBeUnlocked && !isCurrentlyLocked) {
        // Video should be locked but is currently unlocked
        lockVideo(videoData);
      }
    });

    // Set up Wistia video tracking for progress updates (only once)
    setupWistiaTracking(videos);
  }

  // Track Wistia videos and update progress
  let trackingSetup = false;
  function setupWistiaTracking(videos) {
    // Only set up tracking once to prevent duplicate event bindings
    if (trackingSetup) return;
    trackingSetup = true;

    window._wq = window._wq || [];

    _wq.push({
      _all: function(video) {
        const container = video.container;
        const resourceId = container?.getAttribute('data-resource-id');

        if (!resourceId || !isNumeric(resourceId)) return;

        const videoData = videos.find(v => v.resourceId === resourceId);
        if (!videoData) return;

        // Update progress on various events
        video.bind('percentwatchedchanged', function(percent) {
          const percentage = Math.floor(percent * 100);
          VideoProgress.set(resourceId, percentage);

          // Check if we should unlock next video
          if (percentage >= CONFIG.UNLOCK_THRESHOLD) {
            const nextVideoIndex = videoData.index + 1;
            if (nextVideoIndex < videos.length) {
              const nextVideo = videos[nextVideoIndex];
              if (isPreviousVideosCompleted(videos, nextVideoIndex)) {
                unlockVideo(nextVideo);
              }
            }
          }
        });

        video.bind('end', function() {
          VideoProgress.set(resourceId, 100);

          // Unlock next video
          const nextVideoIndex = videoData.index + 1;
          if (nextVideoIndex < videos.length) {
            unlockVideo(videos[nextVideoIndex]);
          }
        });
      }
    });
  }

  // Initialize when DOM is ready
  function init() {
    console.log('[VideoLock] Initializing video locking system...');
    console.log('[VideoLock] Safari optimized - using multi-tier storage');

    // Safari-specific: Sync all storage tiers before unload
    window.addEventListener('beforeunload', function() {
      try {
        // Force sync memory to all available storage methods
        Object.keys(memoryStorage).forEach(function(resourceId) {
          const progress = memoryStorage[resourceId];

          // Write to all available storage tiers
          if (localStorageAvailable) {
            try {
              const data = localStorage.getItem(CONFIG.STORAGE_KEY);
              const progressData = data ? JSON.parse(data) : {};
              progressData[resourceId] = progress;
              localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progressData));
            } catch (e) {
              // Ignore
            }
          }

          if (sessionStorageAvailable) {
            try {
              const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
              const sessionProgress = sessionData ? JSON.parse(sessionData) : {};
              sessionProgress[resourceId] = progress;
              sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionProgress));
            } catch (e) {
              // Ignore
            }
          }

          if (cookieStorageAvailable) {
            CookieStorage.save(resourceId, progress);
          }
        });
        console.log('[VideoLock] Progress synced before unload');
      } catch (e) {
        console.warn('[VideoLock] Error during unload sync:', e.message);
      }
    });

    // Safari iOS: Handle page going to background
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        console.log('[VideoLock] Page hidden - syncing progress');
        // Same sync logic as beforeunload
        try {
          Object.keys(memoryStorage).forEach(function(resourceId) {
            const progress = memoryStorage[resourceId];

            if (localStorageAvailable) {
              try {
                const data = localStorage.getItem(CONFIG.STORAGE_KEY);
                const progressData = data ? JSON.parse(data) : {};
                progressData[resourceId] = progress;
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progressData));
              } catch (e) {
                // Ignore
              }
            }

            if (sessionStorageAvailable) {
              try {
                const sessionData = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
                const sessionProgress = sessionData ? JSON.parse(sessionData) : {};
                sessionProgress[resourceId] = progress;
                sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(sessionProgress));
              } catch (e) {
                // Ignore
              }
            }

            if (cookieStorageAvailable) {
              CookieStorage.save(resourceId, progress);
            }
          });
        } catch (e) {
          console.warn('[VideoLock] Error during visibility sync:', e.message);
        }
      }
    });

    // Start initializing video locking
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeVideoLocking);
    } else {
      // Wait a bit for Wistia to load
      setTimeout(initializeVideoLocking, 1000);
    }

    // Re-check periodically for dynamically added videos
    setInterval(initializeVideoLocking, CONFIG.CHECK_INTERVAL);
  }

  init();

})();
