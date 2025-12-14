(function() {
  function initVideoTracking() {
    const url = new URL(window.location.href);
    const userIdRaw = url.searchParams.get('userId') || '';
    const contactIdRaw = url.searchParams.get('contactId') || '';

    // Validate that IDs are numeric only (prevent XSS injection)
    const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
    const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';

    const webinarElement = document.querySelector('#webinar');
    const webinar = webinarElement ? webinarElement.value || '' : '';
    const TRACK_INTERVAL_MS = 15000;

    function isNumeric(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    }

    if (contactId && userId && isNumeric(contactId) && isNumeric(userId)) {
      window._wq = window._wq || [];
      _wq.push({
        _all: function(video) {
          let lastSentPercent = 0;
          let trackingInterval = null;
          let sentFinal = false;

          const videoContainer = video.container;
          const resourceId = videoContainer?.getAttribute('data-resource-id');

          if (!resourceId || !isNumeric(resourceId)) {
            console.warn('[Tracking] ⚠️ No valid data-resource-id on this video');
            return;
          }

          function sendTrackingData(rawPercentWatched) {
            const percentageWatched = Math.floor(rawPercentWatched * 1);
            if (percentageWatched > 100) return;

            const formData = new URLSearchParams({
              resourceId: resourceId,
              contactId: contactId,
              userId: userId,
              percentageWatched: percentageWatched,
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
              body: formData.toString(),
            })
              .then(response => response.json())
              .catch(() => console.warn('[Tracking] ❌ POST failed'));
          }

          video.bind('play', function() {
            sendTrackingData(video.percentWatched());

            if (!trackingInterval) {
              trackingInterval = setInterval(function() {
                const percentWatched = video.percentWatched();
                const floored = Math.floor(percentWatched * 100);
                if (floored > lastSentPercent) {
                  lastSentPercent = floored;
                  sendTrackingData(percentWatched);
                }
              }, TRACK_INTERVAL_MS);
            }
          });

          video.bind('pause', function() {
            clearInterval(trackingInterval);
            trackingInterval = null;
          });

          video.bind('end', function() {
            if (!sentFinal) {
              sendTrackingData(1);
              sentFinal = true;
            }
            clearInterval(trackingInterval);
            trackingInterval = null;
          });
        },
      });
    } else {
      console.warn('[Tracking] 💡 Missing or invalid userId/contactId');
    }
  }

  // ✅ Safe DOM + Wistia readiness
  function safeInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVideoTracking);
    } else {
      initVideoTracking();
    }
  }

  // ✅ Wait until Wistia loader is ready
  if (window._wq) {
    safeInit();
  } else {
    window._wq = [];
    safeInit();
  }
})();
