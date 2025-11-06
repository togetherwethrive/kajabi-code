jQuery(function ($) {
  const url = new URL(window.location.href);
  const userId = url.searchParams.get('userId');
  const contactId = url.searchParams.get('contactId');
  const webinar = $('#webinar').val() || '';
  const TRACK_INTERVAL_MS = 15000; //Measured in ms

  if (
    contactId && userId &&
    $.isNumeric(contactId) &&
    $.isNumeric(userId)
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
        if (!resourceId || !$.isNumeric(resourceId)) {
          console.warn('[Tracking] ⚠️ No valid data-resource-id on this video');
          return;
        }

        function sendTrackingData(rawPercentWatched) {
          const percentageWatched = Math.floor(rawPercentWatched * 100);
          if (percentageWatched > 100) return;

          console.log(`[Tracking] Sending data for video ${resourceId}: ${percentageWatched}% watched`);

          $.ajax({
            type: 'POST',
            url: 'https://my.rapidfunnel.com/landing/resource/push-to-sqs',
            dataType: 'json',
            async: true,
            data: {
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
            },
            success: function (response) {
              console.log('[Tracking] ✅ POST succeeded', response);
            },
            error: function () {
              console.warn('[Tracking] ❌ POST failed');
            }
          });
        }

        video.bind('play', function () {
          console.log('[Tracking] ▶️ Video started');

          sendTrackingData(video.percentWatched());

          if (!trackingInterval) {
            trackingInterval = setInterval(function () {
              const percentWatched = video.percentWatched();
              const floored = Math.floor(percentWatched * 100);

              console.log(`[Tracking] 📊 Interval check: percentWatched=${percentWatched}, floored=${floored}%, lastSent=${lastSentPercent}%`);

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
        });
      }
    });
  } else {
    console.warn('[Tracking] 💡 Missing or invalid userId/contactId');
  }
});