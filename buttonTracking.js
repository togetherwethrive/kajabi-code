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

    // Check and replace square bracket placeholders [user-id], [userId], [contactId], [resourceId]
    if (userId) {
      if (processedUrl.includes('[user-id]') || processedUrl.includes('[userId]')) {
        processedUrl = processedUrl.replace(/\[user-id\]/g, userId);
        processedUrl = processedUrl.replace(/\[userId\]/g, userId);
        hasPlaceholder = true;
      }
    }

    if (contactId) {
      if (processedUrl.includes('[contactId]')) {
        processedUrl = processedUrl.replace(/\[contactId\]/g, contactId);
        hasPlaceholder = true;
      }
    }

    if (resourceId) {
      if (processedUrl.includes('[resourceId]')) {
        processedUrl = processedUrl.replace(/\[resourceId\]/g, resourceId);
        hasPlaceholder = true;
      }
    }

    // Check and replace curly brace placeholders {userId}, {contactId}, {resourceId}
    if (userId && processedUrl.includes('{userId}')) {
      processedUrl = processedUrl.replace(/\{userId\}/g, userId);
      hasPlaceholder = true;
    }

    if (contactId && processedUrl.includes('{contactId}')) {
      processedUrl = processedUrl.replace(/\{contactId\}/g, contactId);
      hasPlaceholder = true;
    }

    if (resourceId && processedUrl.includes('{resourceId}')) {
      processedUrl = processedUrl.replace(/\{resourceId\}/g, resourceId);
      hasPlaceholder = true;
    }

    // If no placeholders were found, append as query parameters
    if (!hasPlaceholder) {
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
      } catch (e) {
        console.warn("[Button Tracking] Invalid URL format:", processedUrl, e);
      }
    }

    console.log('[Button Tracking] Processed URL:', processedUrl);
    return processedUrl;
  }

  // Helper function for redirects
  function handleRedirect(url, target) {
    if (!url) return;

    if (target === "_blank") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  }
  
  // Function to update href for each CTA tracking button
  function updateCtaTrackingButtonLinks(button) {
    const $button = $(button);
    const ctaTrackingId = $button.attr('data-cta-tracking-id');
    
    if (!ctaTrackingId) {
      console.warn("Missing data-cta-tracking-id for button:", $button.attr('id'));
      return;
    }
    
    $.ajax({
      url: `https://app.rapidfunnel.com/api/api/resources/resource-details/`,
      method: 'GET',
      data: {
        userId: userId,
        resourceId: ctaTrackingId,
        contactId: contactId || ''
      },
      success: function (response) {
        if (response && response.data && response.data.resourceUrl) {
          // Process the URL with parameters (replaces placeholders or appends query params)
          const formattedTrackingUrl = processUrlWithParams(response.data.resourceUrl);
          $button.attr('href', formattedTrackingUrl);
        } else {
          console.warn("Invalid tracking data received for:", ctaTrackingId);
          $button.attr("href", "#").addClass("disabled");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error fetching tracking URL:", error, "Status:", status);
        $button.attr("href", "#").addClass("disabled").prop("disabled", true);
      }
    });
  }
  
  // Iterate over each CTA tracking button and update href on load
  $ctaTrackingButtons.each(function () {
    updateCtaTrackingButtonLinks(this);
  });
  
  // Flag to prevent duplicate submissions
  let isProcessing = false;
  
  // Function to handle CTA button clicks
  function handleCtaTrackingButtonClick(buttonId) {
    // Prevent multiple simultaneous clicks
    if (isProcessing) return;
    isProcessing = true;

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
      isProcessing = false;
      return;
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
                isProcessing = false;
                handleRedirect(redirectUrl, target);
              },
              error: function (xhr, status, error) {
                isProcessing = false;
                handleRedirect(redirectUrl, target);
              }
            });
          } else {
            console.error("Invalid contact data received");
            isProcessing = false;
            handleRedirect(redirectUrl, target);
          }
        },
        error: function (xhr, status, error) {
          console.error("Failed to fetch contact details:", error);
          isProcessing = false;
          handleRedirect(redirectUrl, target);
        }
      });
    } else {
      isProcessing = false;
      handleRedirect(redirectUrl, target);
    }
  }
  
  // Attach event listener for CTA tracking button clicks
  $ctaTrackingButtons.on('click', function (event) {
    event.preventDefault();
    handleCtaTrackingButtonClick(this.id);
  });
});