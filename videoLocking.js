(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    UNLOCK_THRESHOLD: 90, // Percentage watched to unlock next video
    STORAGE_KEY: 'kajabi_video_progress',
    CHECK_INTERVAL: 2000, // Check for new videos every 2 seconds
    API_ENDPOINT: 'https://my.rapidfunnel.com/landing/resource/get-progress'
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
    console.warn('[VideoLock] 💡 Missing or invalid userId - locking disabled');
    return;
  }

  // In-memory fallback for Safari private mode
  let memoryStorage = {};
  let localStorageAvailable = true;

  // Test if localStorage is available
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    console.warn('[VideoLock] localStorage not available (possibly Safari private mode), using in-memory storage');
    localStorageAvailable = false;
  }

  // Storage management
  const VideoProgress = {
    get: function(resourceId) {
      try {
        if (localStorageAvailable) {
          const data = localStorage.getItem(CONFIG.STORAGE_KEY);
          const progress = data ? JSON.parse(data) : {};
          return progress[resourceId] || 0;
        } else {
          return memoryStorage[resourceId] || 0;
        }
      } catch (e) {
        console.warn('[VideoLock] Error reading progress, using memory fallback:', e);
        return memoryStorage[resourceId] || 0;
      }
    },

    set: function(resourceId, percentage) {
      try {
        // Always update memory storage
        memoryStorage[resourceId] = Math.max(memoryStorage[resourceId] || 0, percentage);

        // Try to update localStorage if available
        if (localStorageAvailable) {
          const data = localStorage.getItem(CONFIG.STORAGE_KEY);
          const progress = data ? JSON.parse(data) : {};
          progress[resourceId] = Math.max(progress[resourceId] || 0, percentage);
          localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progress));
        }
      } catch (e) {
        console.warn('[VideoLock] Error saving progress to localStorage, using memory only:', e);
        localStorageAvailable = false;
      }
    },

    isCompleted: function(resourceId) {
      return this.get(resourceId) >= CONFIG.UNLOCK_THRESHOLD;
    }
  };

  // Get all video containers sorted by DOM order
  function getAllVideos() {
    const videos = [];
    const wistiaContainers = document.querySelectorAll('[class*="wistia_embed"]');

    console.log(`[VideoLock] Found ${wistiaContainers.length} Wistia container(s) in DOM`);

    wistiaContainers.forEach((container, domIndex) => {
      const resourceId = container.getAttribute('data-resource-id');
      const lockVideo = container.getAttribute('data-lock-video');

      console.log(`[VideoLock]   Container #${domIndex}: resourceId = ${resourceId}, data-lock-video = ${lockVideo}`);

      if (resourceId && isNumeric(resourceId)) {
        // Check if video should be exempt from locking
        const isAlwaysUnlocked = lockVideo === 'false';

        videos.push({
          container: container,
          resourceId: resourceId,
          index: videos.length,
          isAlwaysUnlocked: isAlwaysUnlocked
        });

        if (isAlwaysUnlocked) {
          console.log(`[VideoLock]     ✓ Added as video #${videos.length - 1} (ALWAYS UNLOCKED - data-lock-video="false")`);
        } else {
          console.log(`[VideoLock]     ✓ Added as video #${videos.length - 1} (normal locking behavior)`);
        }
      } else {
        console.warn(`[VideoLock]     ✗ Skipped (missing or invalid resourceId)`);
      }
    });

    console.log(`[VideoLock] Total videos with valid resourceId: ${videos.length}`);
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
  }

  // Lock a video
  function lockVideo(videoData) {
    const container = videoData.container;
    console.log(`[VideoLock] 🔒 lockVideo called for resourceId: ${videoData.resourceId}`);

    // Make sure container is positioned relatively
    if (!container.closest('.video-container-wrapper')) {
      console.log(`[VideoLock]   - Creating wrapper for container`);
      const wrapper = document.createElement('div');
      wrapper.className = 'video-container-wrapper';
      container.parentNode.insertBefore(wrapper, container);
      wrapper.appendChild(container);
    }

    // Add overlay if not present
    const existingOverlay = container.querySelector('.video-lock-overlay');
    if (!existingOverlay) {
      console.log(`[VideoLock]   - Creating and appending overlay`);
      const overlay = createLockOverlay(videoData);
      container.appendChild(overlay);
      console.log(`[VideoLock]   ✓ Overlay added successfully`);
    } else {
      console.log(`[VideoLock]   - Overlay already exists, skipping`);
    }
  }

  // Unlock a video
  function unlockVideo(videoData) {
    const container = videoData.container;
    const overlay = container.querySelector('.video-lock-overlay');

    if (overlay) {
      console.log(`[VideoLock] 🔓 Removing overlay for resourceId: ${videoData.resourceId}`);
      overlay.remove();
      addUnlockedBadge(container);
      // Mark container as unlocked to prevent re-locking
      container.setAttribute('data-video-unlocked', 'true');
    }
  }

  // Check if previous videos are completed
  function isPreviousVideosCompleted(videos, currentIndex) {
    if (currentIndex === 0) return true;

    for (let i = 0; i < currentIndex; i++) {
      // Skip videos that are always unlocked (data-lock-video="false")
      // They don't need to be completed for sequential unlocking
      if (videos[i].isAlwaysUnlocked) {
        console.log(`[VideoLock] Checking video #${i} (resourceId: ${videos[i].resourceId}) - SKIPPED (data-lock-video="false")`);
        continue;
      }

      const progress = VideoProgress.get(videos[i].resourceId);
      const isCompleted = VideoProgress.isCompleted(videos[i].resourceId);
      console.log(`[VideoLock] Checking video #${i} (resourceId: ${videos[i].resourceId}) - Progress: ${progress}%, Completed: ${isCompleted}`);

      if (!isCompleted) {
        console.log(`[VideoLock] Video #${i} not completed, video #${currentIndex} should remain locked`);
        return false;
      }
    }
    console.log(`[VideoLock] All previous videos completed for video #${currentIndex}`);
    return true;
  }

  // Initialize video locking
  function initializeVideoLocking() {
    const videos = getAllVideos();
    if (videos.length === 0) return;

    console.log(`[VideoLock] ===== Initializing ${videos.length} video(s) =====`);

    // Process each video
    videos.forEach((videoData, index) => {
      const container = videoData.container;
      const isCurrentlyLocked = container.querySelector('.video-lock-overlay') !== null;
      const wasExplicitlyUnlocked = container.getAttribute('data-video-unlocked') === 'true';

      console.log(`[VideoLock] Processing video #${index} (resourceId: ${videoData.resourceId})`);
      console.log(`[VideoLock]   - Currently locked: ${isCurrentlyLocked}`);
      console.log(`[VideoLock]   - Was explicitly unlocked: ${wasExplicitlyUnlocked}`);
      console.log(`[VideoLock]   - Always unlocked (data-lock-video="false"): ${videoData.isAlwaysUnlocked}`);

      // Check if video should always be unlocked (data-lock-video="false")
      if (videoData.isAlwaysUnlocked) {
        console.log(`[VideoLock]   ✓ Keeping unlocked (data-lock-video="false" - exempt from locking)`);
        // Remove overlay if it exists
        if (isCurrentlyLocked) {
          console.log(`[VideoLock]   → ACTION: Removing overlay from always-unlocked video`);
          unlockVideo(videoData);
        }
        return;
      }

      // Never re-lock a video that was explicitly unlocked
      if (wasExplicitlyUnlocked) {
        console.log(`[VideoLock]   ✓ Keeping unlocked (was explicitly unlocked before)`);
        return;
      }

      const shouldBeUnlocked = isPreviousVideosCompleted(videos, index);
      console.log(`[VideoLock]   - Should be unlocked: ${shouldBeUnlocked}`);

      // Determine action
      if (shouldBeUnlocked && isCurrentlyLocked) {
        // Video should be unlocked but is currently locked
        console.log(`[VideoLock]   → ACTION: Unlocking video #${index}`);
        unlockVideo(videoData);
      } else if (!shouldBeUnlocked && !isCurrentlyLocked) {
        // Video should be locked but is currently unlocked
        console.log(`[VideoLock]   → ACTION: Locking video #${index}`);
        lockVideo(videoData);
      } else {
        console.log(`[VideoLock]   → ACTION: No change needed (already in correct state)`);
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
            console.log(`[VideoLock] Video ${resourceId} reached ${percentage}% - checking if next video should unlock`);
            const nextVideoIndex = videoData.index + 1;
            if (nextVideoIndex < videos.length) {
              const nextVideo = videos[nextVideoIndex];
              if (isPreviousVideosCompleted(videos, nextVideoIndex)) {
                console.log(`[VideoLock] Unlocking next video (index ${nextVideoIndex})`);
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
