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
  if (!contactId || !userId || !isNumeric(contactId) || !isNumeric(userId)) {
    console.warn('[VideoLock] 💡 Missing or invalid userId/contactId - locking disabled');
    return;
  }

  // Storage management
  const VideoProgress = {
    get: function(resourceId) {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        const progress = data ? JSON.parse(data) : {};
        return progress[resourceId] || 0;
      } catch (e) {
        console.warn('[VideoLock] Error reading progress:', e);
        return 0;
      }
    },

    set: function(resourceId, percentage) {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        const progress = data ? JSON.parse(data) : {};
        progress[resourceId] = Math.max(progress[resourceId] || 0, percentage);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn('[VideoLock] Error saving progress:', e);
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

    wistiaContainers.forEach(container => {
      const resourceId = container.getAttribute('data-resource-id');
      if (resourceId && isNumeric(resourceId)) {
        videos.push({
          container: container,
          resourceId: resourceId,
          index: videos.length
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
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="video-lock-message">
          <h3>Vídeo Bloqueado</h3>
          <p>Complete o vídeo anterior para desbloquear</p>
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
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: not-allowed;
          backdrop-filter: blur(5px);
        }

        .video-lock-content {
          text-align: center;
          color: white;
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
        }

        .video-lock-message p {
          margin: 0;
          font-size: 16px;
          opacity: 0.8;
        }

        .video-unlocked-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #10b981;
          color: white;
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
      <span>Desbloqueado</span>
    `;

    container.style.position = 'relative';
    container.appendChild(badge);
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
    if (!container.querySelector('.video-lock-overlay')) {
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
  }

  // Check if previous videos are completed
  function isPreviousVideosCompleted(videos, currentIndex) {
    if (currentIndex === 0) return true;

    for (let i = 0; i < currentIndex; i++) {
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
      const shouldBeUnlocked = isPreviousVideosCompleted(videos, index);

      if (shouldBeUnlocked) {
        unlockVideo(videoData);
      } else {
        lockVideo(videoData);
      }
    });

    // Set up Wistia video tracking for progress updates
    setupWistiaTracking(videos);
  }

  // Track Wistia videos and update progress
  function setupWistiaTracking(videos) {
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
