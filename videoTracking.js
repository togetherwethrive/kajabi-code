// Initialize video tracking (no jQuery dependency)
(function() {
  function initVideoTracking() {
    console.log('[Tracking] Initializing video tracking...');

    const url = new URL(window.location.href);
    const userId = url.searchParams.get('userId');
    const contactId = url.searchParams.get('contactId');
    const webinarElement = document.getElementById('webinar');
    const webinar = webinarElement ? (webinarElement.value || '') : '';
    const TRACK_INTERVAL_MS = 5000; //Measured in ms

    // Helper function to check if value is numeric
    function isNumeric(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    }

    if (
      contactId && userId &&
      isNumeric(contactId) &&
      isNumeric(userId)
    ) {
    window._wq = window._wq || [];
    _wq.push({
      _all: function (video) {
        console.log("[Tracking] Wistia video is ready");

        let lastSentPercent = 0;
        let trackingInterval = null;
        let sentFinal = false;

        // ✅ Dynamically fetch correct resourceId from this specific video's element
        const videoContainer = video.container;
        const resourceId = videoContainer?.getAttribute('data-resource-id');

        // Skip if no resourceId found on the video that triggered play
        if (!resourceId || !isNumeric(resourceId)) {
          console.warn('[Tracking] ⚠️ No valid data-resource-id on this video');
          return;
        }

        // Calculate percentage based on current time and duration
        function getCurrentPercentage() {
          const currentTime = video.time();
          const duration = video.duration();

          if (!duration || duration === 0) {
            console.warn('[Tracking] ⚠️ Duration is 0 or undefined');
            return 0;
          }

          const percentage = (currentTime / duration) * 1;
          console.log(`[Tracking] 📊 currentTime=${currentTime.toFixed(2)}s, duration=${duration.toFixed(2)}s, calculated=${percentage.toFixed(2)}%`);
          return percentage;
        }

        function sendTrackingData(percentageWatched) {
          const percentToSend = Math.floor(percentageWatched);
          if (percentToSend > 100) return;

          console.log(`[Tracking] Sending data for video ${resourceId}: ${percentToSend}% watched`);

          // Prepare form data for POST request
          const formData = new URLSearchParams({
            resourceId: resourceId,
            contactId: contactId,
            userId: userId,
            percentageWatched: percentToSend,
            mediaHash: video.hashedId(),
            duration: video.duration(),
            visitorKey: video.visitorKey(),
            eventKey: video.eventKey(),
            delayProcess: 1,
            webinar: webinar,
          });

          // Use fetch instead of jQuery.ajax
          fetch('https://my.rapidfunnel.com/landing/resource/push-to-sqs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
          })
            .then(response => response.json())
            .then(data => {
              console.log('[Tracking] ✅ POST succeeded', data);
            })
            .catch(error => {
              console.warn('[Tracking] ❌ POST failed', error);
            });
        }

        video.bind('play', function () {
          console.log('[Tracking] ▶️ Video started');

          // Send initial tracking data
          const initialPercent = getCurrentPercentage();
          sendTrackingData(initialPercent);

          // Start interval tracking if not already running
          if (!trackingInterval) {
            trackingInterval = setInterval(function () {
              const currentPercent = getCurrentPercentage();
              const floored = Math.floor(currentPercent);

              console.log(`[Tracking] 🔄 Check: current=${floored}%, lastSent=${lastSentPercent}%`);

              if (floored > lastSentPercent) {
                lastSentPercent = floored;
                sendTrackingData(currentPercent);
              }
            }, TRACK_INTERVAL_MS);
          }
        });

        video.bind('pause', function () {
          console.log('[Tracking] ⏸️ Video paused → stop tracking');
          clearInterval(trackingInterval);
          trackingInterval = null;
        });

        video.bind('end', function () {
          console.log('[Tracking] ⏹️ Video ended → final 100% posted');
          if (!sentFinal) {
            sendTrackingData(100);
            sentFinal = true;
          }
          clearInterval(trackingInterval);
          trackingInterval = null;
        });
      }
    });
    } else {
      console.warn('[Tracking] 💡 Missing or invalid userId/contactId');
    }

    console.log('[Tracking] ✅ Video tracking initialized successfully');
  }

  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    console.log('[Tracking] Waiting for DOM to be ready...');
    document.addEventListener('DOMContentLoaded', initVideoTracking);
  } else {
    // DOM is already ready, initialize immediately
    initVideoTracking();
  }
})();