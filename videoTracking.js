(function() {
  function initVideoTracking() {
    console.log('[Tracking] Initializing video tracking...');

    const url = new URL(window.location.href);
    const userId = url.searchParams.get('userId');
    const contactId = url.searchParams.get('contactId');
    const webinarElement = document.getElementById('webinar');
    const webinar = webinarElement ? (webinarElement.value || '') : '';
    const TRACK_INTERVAL_MS = 5000; //Measured in ms

    function isNumeric(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    }

    if (
      contactId && userId &&
      isNumeric(contactId) &&
      isNumeric(userId)
    ) {

      // ✅ Prevent multiple initializations
      if (window.__videoTrackingInitialized) {
        console.log('[Tracking] Skipping duplicate tracking initialization');
        return;
      }
      window.__videoTrackingInitialized = true;

      window._wq = window._wq || [];
      _wq.push({
        _all: function (video) {
          console.log("[Tracking] Wistia video is ready");

          let lastSentPercent = 0;
          let trackingInterval = null;
          let sentFinal = false;

          const videoContainer = video.container;
          const resourceId = videoContainer?.getAttribute('data-resource-id');

          if (!resourceId || !isNumeric(resourceId)) {
            console.warn('[Tracking] ⚠️ No valid data-resource-id on this video');
            return;
          }

          function getCurrentProgress() {
            const currentTime = video.time();
            const duration = video.duration();

            if (!duration || duration === 0) {
              console.warn('[Tracking] ⚠️ Duration is 0 or undefined');
              return 0;
            }

            const progress = currentTime / duration;
            const displayPercent = progress * 100;
            console.log(`[Tracking] 📊 currentTime=${currentTime.toFixed(2)}s, duration=${duration.toFixed(2)}s, progress=${displayPercent.toFixed(2)}%`);
            return progress;
          }

          function sendTrackingData(progressDecimal) {
            let percentToSend = Math.floor(progressDecimal * 100);
            if (percentToSend > 100) percentToSend = 100;

            console.log(`[Tracking] Sending data for video ${resourceId}: ${percentToSend}% watched`);

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

            fetch('https://my.rapidfunnel.com/landing/resource/push-to-sqs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formData.toString()
            })
              .then(response => response.json())
              .then(data => console.log('[Tracking] ✅ POST succeeded', data))
              .catch(error => console.warn('[Tracking] ❌ POST failed', error));
          }

          video.bind('play', function () {
            console.log('[Tracking] ▶️ Video started');

            const initialPercent = getCurrentProgress();
            sendTrackingData(initialPercent);

            if (!trackingInterval) {
              trackingInterval = setInterval(function () {
                const currentPercent = getCurrentProgress();
                const floored = Math.floor(currentPercent * 100);

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
              sendTrackingData(1);
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

  if (document.readyState === 'loading') {
    console.log('[Tracking] Waiting for DOM to be ready...');
    document.addEventListener('DOMContentLoaded', initVideoTracking);
  } else {
    initVideoTracking();
  }
})();
