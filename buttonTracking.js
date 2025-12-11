jQuery(function ($) {
  // Parse the URL to extract userId and contactId
  const parsedUrl = new URL(window.location.href);
  const userId = parsedUrl.searchParams.get('userId');
  const contactId = parsedUrl.searchParams.get('contactId');
  const resourceId = parsedUrl.searchParams.get('resourceId');
  const pageName = document.title || "Unknown Page";

  // Cache selector results to improve performance
  const $ctaTrackingButtons = $('[id^="ctaTrackingButton"]');

  // Helper function to process URL with parameters
  function processUrlWithParams(url) {
    if (!url) return url;

    console.log('[Button Tracking] Processing URL:', url);
    console.log('[Button Tracking] Available params - userId:', userId, 'contactId:', contactId, 'resourceId:', resourceId);

    let processedUrl = url;
    let hasPlaceholder = false;

    // STEP 1: Check and replace ALL placeholders first
    // This allows the API to control the URL format through placeholders

    // Replace square bracket placeholders: [user-id], [userId], [contactId], [resourceId]
    if (processedUrl.includes('[user-id]') || processedUrl.includes('[userId]')) {
      if (userId) {
        processedUrl = processedUrl.replace(/\[user-id\]/g, userId);
        processedUrl = processedUrl.replace(/\[userId\]/g, userId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced [userId] placeholder with:', userId);
      }
    }

    if (processedUrl.includes('[contactId]')) {
      if (contactId) {
        processedUrl = processedUrl.replace(/\[contactId\]/g, contactId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced [contactId] placeholder with:', contactId);
      }
    }

    if (processedUrl.includes('[resourceId]')) {
      if (resourceId) {
        processedUrl = processedUrl.replace(/\[resourceId\]/g, resourceId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced [resourceId] placeholder with:', resourceId);
      }
    }

    // Replace curly brace placeholders: {userId}, {contactId}, {resourceId}
    if (processedUrl.includes('{userId}')) {
      if (userId) {
        processedUrl = processedUrl.replace(/\{userId\}/g, userId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced {userId} placeholder with:', userId);
      }
    }

    if (processedUrl.includes('{contactId}')) {
      if (contactId) {
        processedUrl = processedUrl.replace(/\{contactId\}/g, contactId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced {contactId} placeholder with:', contactId);
      }
    }

    if (processedUrl.includes('{resourceId}')) {
      if (resourceId) {
        processedUrl = processedUrl.replace(/\{resourceId\}/g, resourceId);
        hasPlaceholder = true;
        console.log('[Button Tracking] Replaced {resourceId} placeholder with:', resourceId);
      }
    }

    // STEP 2: If placeholders were found and replaced, we're done!
    if (hasPlaceholder) {
      console.log('[Button Tracking] ✅ URL contained placeholders - processed URL:', processedUrl);
      return processedUrl;
    }

    // STEP 3: No placeholders found - check for special URL formats
    // SPECIAL CASE: thrivewithtwtapp.com/res/ URLs use path segments
    // Format: https://thrivewithtwtapp.com/res/{resourceId}/{userId}/{contactId}?source=web
    if (processedUrl.includes('thrivewithtwtapp.com/res/')) {
      console.log('[Button Tracking] Detected thrivewithtwtapp.com/res/ URL - using path segment format');

      // Extract the base URL (everything up to and including the resourceId)
      // URL is typically: https://thrivewithtwtapp.com/res/66985
      const baseUrl = processedUrl.split('?')[0]; // Remove any existing query params

      if (userId && contactId) {
        // Construct: https://thrivewithtwtapp.com/res/66985/308889/20753827?source=web
        processedUrl = `${baseUrl}/${userId}/${contactId}?source=web`;
        console.log('[Button Tracking] ✅ Constructed path-based URL:', processedUrl);
        return processedUrl;
      } else {
        console.warn('[Button Tracking] Missing userId or contactId for thrivewithtwtapp.com/res/ URL');
        console.warn('[Button Tracking] URL may not work correctly:', processedUrl);
        return processedUrl;
      }
    }

    // STEP 4: Default behavior - append as query parameters
    try {
      const urlObj = new URL(processedUrl);

      if (userId) {
        urlObj.searchParams.set('userId', userId);
      }

      if (contactId) {
        urlObj.searchParams.set('contactId', contactId);
      }

      // Only append resourceId if the URL doesn't already contain a numeric resourceId in the path
      // This prevents adding page's resourceId when button URL has its own resourceId
      const hasResourceIdInPath = /\/\d{4,}\//.test(processedUrl);
      if (resourceId && !hasResourceIdInPath) {
        urlObj.searchParams.set('resourceId', resourceId);
      }

      processedUrl = urlObj.toString();
      console.log('[Button Tracking] ✅ Appended query parameters:', processedUrl);
    } catch (e) {
      console.warn("[Button Tracking] Invalid URL format:", processedUrl, e);
    }

    return processedUrl;
  }

  // Function to update href for each CTA tracking button
  function updateCtaTrackingButtonLinks(button) {
    const $button = $(button);
    const ctaTrackingId = $button.attr('data-cta-tracking-id');
    const buttonId = $button.attr('id');

    if (!ctaTrackingId) {
      console.warn('[Button Tracking] Missing data-cta-tracking-id for button:', buttonId);
      return;
    }

    console.log('[Button Tracking] Fetching URL for button:', buttonId, 'with tracking ID:', ctaTrackingId);

    $.ajax({
      url: `https://app.rapidfunnel.com/api/api/resources/resource-details/`,
      method: 'GET',
      data: {
        userId: userId,
        resourceId: ctaTrackingId,
        contactId: contactId || ''
      },
      success: function (response) {
        console.log('[Button Tracking] API Response for', buttonId, ':', response);

        if (response && response.data) {
          console.log('[Button Tracking] Response data:', response.data);
          console.log('[Button Tracking] Available fields:', Object.keys(response.data));

          // Try to find the actual destination URL
          // Check multiple possible field names
          let destinationUrl = response.data.resourceUrl ||
                              response.data.destinationUrl ||
                              response.data.targetUrl ||
                              response.data.url ||
                              response.data.finalUrl;

          if (destinationUrl) {
            console.log('[Button Tracking] Raw URL from API:', destinationUrl);

            // Check what type of URL processing will happen
            if (destinationUrl.includes('{userId}') || destinationUrl.includes('{contactId}') ||
                destinationUrl.includes('[userId]') || destinationUrl.includes('[contactId]')) {
              console.log('[Button Tracking] ✓ URL contains placeholders - will replace with actual values');
            } else if (destinationUrl.includes('thrivewithtwtapp.com/res/')) {
              console.log('[Button Tracking] ✓ thrivewithtwtapp.com/res/ URL - will use path segment format');
            } else {
              console.log('[Button Tracking] ✓ Regular URL - will append query parameters');
            }

            // Process the URL with parameters (replaces placeholders or constructs URL)
            const formattedTrackingUrl = processUrlWithParams(destinationUrl);
            console.log('[Button Tracking] ✅ Final processed URL:', formattedTrackingUrl);
            $button.attr('href', formattedTrackingUrl);
          } else {
            console.error('[Button Tracking] No URL found in response data:', response.data);
            console.error('[Button Tracking] Full response:', JSON.stringify(response, null, 2));
            $button.attr("href", "#").addClass("disabled");
          }
        } else {
          console.warn('[Button Tracking] Invalid tracking data received for:', ctaTrackingId);
          console.warn('[Button Tracking] Response:', response);
          $button.attr("href", "#").addClass("disabled");
        }
      },
      error: function (xhr, status, error) {
        console.error('[Button Tracking] Error fetching tracking URL:', error, 'Status:', status);
        console.error('[Button Tracking] XHR:', xhr);
        $button.attr("href", "#").addClass("disabled").prop("disabled", true);
      }
    });
  }
  
  // Iterate over each CTA tracking button and update href on load
  $ctaTrackingButtons.each(function () {
    updateCtaTrackingButtonLinks(this);
  });
  
  // Track buttons being processed to prevent duplicates
  const processingButtons = new Set();

  // Function to handle CTA button clicks
  function handleCtaTrackingButtonClick(buttonId) {
    // Prevent multiple simultaneous clicks on the same button
    if (processingButtons.has(buttonId)) {
      console.log('[Button Tracking] Button', buttonId, 'is already being processed');
      return;
    }
    processingButtons.add(buttonId);

    const $button = $('#' + buttonId);
    const ctaTrackingLocation = $button.attr('data-cta-tracking-location');
    const redirectUrl = $button.attr('href');
    const target = $button.attr('target');

    console.log('[Button Tracking] Button clicked:', buttonId);
    console.log('[Button Tracking] Redirect URL from href:', redirectUrl);
    console.log('[Button Tracking] Target:', target);

    // Don't process disabled buttons or ones with # hrefs
    if ($button.hasClass('disabled') || redirectUrl === '#') {
      console.warn('[Button Tracking] Button is disabled or has # href');
      processingButtons.delete(buttonId);
      return;
    }

    // IMPORTANT: For target="_blank", open the window IMMEDIATELY to avoid popup blockers
    // Popup blockers will block windows opened asynchronously (after AJAX completes)
    let newWindow = null;
    if (target === '_blank') {
      console.log('[Button Tracking] Opening new tab immediately (to bypass popup blockers)');
      newWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        console.warn('[Button Tracking] Failed to open new window - popup blocker may be active');
      }
    }
    
    // Helper function to complete the redirect
    function completeRedirect() {
      processingButtons.delete(buttonId);

      if (target === '_blank' && newWindow) {
        // Update the pre-opened window with the actual URL
        console.log('[Button Tracking] Navigating opened tab to:', redirectUrl);
        newWindow.location.href = redirectUrl;
      } else if (target === '_blank' && !newWindow) {
        // Fallback if window was blocked - try opening directly (may still be blocked)
        console.log('[Button Tracking] Attempting direct window.open (may be blocked)');
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Regular navigation for same-tab links
        console.log('[Button Tracking] Navigating same tab to:', redirectUrl);
        window.location.href = redirectUrl;
      }
    }

    if (contactId) {
      $.ajax({
        url: `https://apiv2.rapidfunnel.com/v2/contact-details/${contactId}`,
        type: 'GET',
        dataType: 'json',
        timeout: 5000, // 5 second timeout
        success: function (response) {
          if (response && response.data) {
            const contactData = response.data;

            // Send tracking email (fire and forget - don't block redirect)
            $.ajax({
              url: 'https://app.rapidfunnel.com/api/mail/send-cta-email',
              type: 'POST',
              contentType: 'application/json',
              dataType: "json",
              data: JSON.stringify({
                legacyUserId: userId,
                contactFirstName: contactData.firstName || '',
                contactLastName: contactData.lastName || '',
                contactPhoneNumber: contactData.phone || '',
                contactEmail: contactData.email || '',
                ctaLocation: ctaTrackingLocation || '',
                ctaPageName: pageName
              }),
              success: function (response) {
                console.log('[Button Tracking] Tracking email sent successfully');
              },
              error: function (xhr, status, error) {
                console.warn('[Button Tracking] Failed to send tracking email:', error);
              }
            });

            // Redirect immediately after starting email request (don't wait for it)
            completeRedirect();
          } else {
            console.error('[Button Tracking] Invalid contact data received');
            completeRedirect();
          }
        },
        error: function (xhr, status, error) {
          console.error('[Button Tracking] Failed to fetch contact details:', error);
          completeRedirect();
        }
      });
    } else {
      // No contact tracking needed, redirect immediately
      console.log('[Button Tracking] No contactId, redirecting without tracking');
      completeRedirect();
    }
  }
  
  // Attach event listener for CTA tracking button clicks
  $ctaTrackingButtons.on('click', function (event) {
    event.preventDefault();
    handleCtaTrackingButtonClick(this.id);
  });

  // Expose diagnostic function to window for console debugging
  window.checkButtonTracking = function(trackingId) {
    console.log('=== Button Tracking Diagnostics ===');
    console.log('Checking tracking ID:', trackingId);
    console.log('Current params - userId:', userId, 'contactId:', contactId, 'resourceId:', resourceId);

    $.ajax({
      url: `https://app.rapidfunnel.com/api/api/resources/resource-details/`,
      method: 'GET',
      data: {
        userId: userId,
        resourceId: trackingId,
        contactId: contactId || ''
      },
      success: function (response) {
        console.log('✅ API Response:', response);
        if (response && response.data) {
          console.log('📊 Response Data:', response.data);
          console.log('📋 Available Fields:', Object.keys(response.data));
          const url = response.data.resourceUrl || response.data.url;
          console.log('🔗 resourceUrl:', url);

          if (url) {
            // Check what processing will happen
            if (url.includes('{userId}') || url.includes('{contactId}') ||
                url.includes('[userId]') || url.includes('[contactId]')) {
              console.log('✓ URL contains placeholders');
              console.log('  Example placeholders: {userId}, {contactId}, [userId], [contactId]');
              const processedUrl = processUrlWithParams(url);
              console.log('✓ After placeholder replacement:', processedUrl);
            } else if (url.includes('thrivewithtwtapp.com/res/')) {
              console.log('✓ This is a thrivewithtwtapp.com/res/ tracking URL');
              const processedUrl = processUrlWithParams(url);
              console.log('✓ Will be processed to:', processedUrl);
              console.log('✓ Expected format: https://thrivewithtwtapp.com/res/{resourceId}/{userId}/{contactId}?source=web');
            } else {
              console.log('✓ Regular URL - will append query parameters');
              const processedUrl = processUrlWithParams(url);
              console.log('✓ After adding params:', processedUrl);
            }
          }
        }
        console.log('====================================');
      },
      error: function (xhr, status, error) {
        console.error('❌ API Error:', error, 'Status:', status);
        console.error('Response:', xhr.responseText);
        console.log('====================================');
      }
    });
  };

  console.log('[Button Tracking] 💡 Diagnostic function available: checkButtonTracking(trackingId)');
  console.log('[Button Tracking] Example: checkButtonTracking(66985)');
});