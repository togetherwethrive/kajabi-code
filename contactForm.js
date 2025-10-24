jQuery(function ($) {
  // Parse the URL to extract userId and contactId
  const parsedUrl = new URL(window.location.href);
  const userId = parsedUrl.searchParams.get('userId');
  const contactId = parsedUrl.searchParams.get('contactId');
  const pageName = document.title || "Unknown Page";
  
  // Cache selector results to improve performance
  const $ctaTrackingButtons = $('[id^="ctaTrackingButton"]');
  
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
          // Use URL construction that's less prone to errors
          let formattedTrackingUrl = new URL(response.data.resourceUrl);
          formattedTrackingUrl.pathname += formattedTrackingUrl.pathname.endsWith('/') ? '' : '/';
          formattedTrackingUrl.pathname += userId;
          
          if (contactId) {
            formattedTrackingUrl.pathname += '/' + contactId;
          }
          
          $button.attr('href', formattedTrackingUrl.toString());
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
    
    // Don't process disabled buttons or ones with # hrefs
    if ($button.hasClass('disabled') || redirectUrl === '#') {
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
                console.log("CTA Tracking email sent successfully");
                isProcessing = false;
                handleRedirect(redirectUrl, target);
              },
              error: function (xhr, status, error) {
                console.error("CTA Tracking email failed:", error);
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