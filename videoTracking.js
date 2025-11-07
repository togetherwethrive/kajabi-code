document.addEventListener('DOMContentLoaded', function () {
  const url = new URL(window.location.href);
  const userId = url.searchParams.get('userId');
  const contactId = url.searchParams.get('contactId');
  const webinarElement = document.querySelector('#webinar');
  const webinar = webinarElement ? webinarElement.value || '' : '';
  const TRACK_INTERVAL_MS = 15000; //Measured in ms

  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  if (contactId && userId && isNumeric(contactId) && isNumeric(userId)) {
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

        function sendTrackingData(rawPercentWatched) {
          const percentageWatched = Math.floor(rawPercentWatched * 1);
          if (percentageWatched > 100) return;

          console.log(`[Tracking] Sending data for video ${resourceId}: ${percentageWatched}% watched`);

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
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          })
            .then(response => response.json())
            .then(data => console.log('[Tracking] ✅ POST succeeded', data))
            .catch(() => console.warn('[Tracking] ❌ POST failed'));
        }

        video.bind('play', function () {
          console.log('[Tracking] ▶️ Video started');

          sendTrackingData(video.percentWatched());

          if (!trackingInterval) {
            trackingInterval = setInterval(function () {
              const percentWatched = video.percentWatched();
              const floored = Math.floor(percentWatched * 100);

              if (floored > lastSentPercent) {
                lastSentPercent = floored;
                sendTrackingData(percentWatched);
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
});