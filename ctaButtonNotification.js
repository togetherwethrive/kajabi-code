// Helper function for redirects
function handleRedirect(url, target) {
  if(url) { 
    if (target === "_blank") {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }
}

// Get page name from document title
const pageName = document.title || "Unknown Page";

// Modified function to accept redirect parameters
function sendNotification(user, firstName, lastName, phone, email, btnLocation, redirectUrl, target) {
  // Make a POST request to notify the user via email
  $.ajax({
    url: 'https://app.rapidfunnel.com/api/mail/send-cta-email',
    type: 'POST',
    contentType: 'application/json',
    dataType: "json",
    data: JSON.stringify({
      legacyUserId: user,
      contactFirstName: firstName,
      contactLastName: lastName,
      contactPhoneNumber: phone,
      contactEmail: email,
      ctaLocation: btnLocation,
      ctaPageName: pageName
    }),
    success: function (response) {
      handleRedirect(redirectUrl, target);
    },
    error: function (xhr, status, error) {
      handleRedirect(redirectUrl, target);
    }
  });
}

jQuery(function ($) {
  // Parse the current URL to get query parameters
  const url = window.location.href;
  const parsedUrl = new URL(url);
  var userId = parsedUrl.searchParams.get('userId');
  var resourceId = parsedUrl.searchParams.get('resourceId');
  var contactId = parsedUrl.searchParams.get('contactId');
  
  $('[id^="ctaButton"]').on('click', function(event) {
    event.preventDefault();

    // Capture redirect properties HERE where 'this' is the button
    var ctaButtonLocation = $(this).attr('data-description');
    const redirectUrl = $(this).attr('href');
    const target = $(this).attr('target');
    
    if(!ctaButtonLocation) {
      ctaButtonLocation = $(this).attr('id');
    }
    if(contactId) {
      $.get('https://apiv2.rapidfunnel.com/v2/contact-details/' + contactId)
        .done(function (response) {
          sendNotification(
            Number(userId), 
            response.data.firstName, 
            response.data.lastName, 
            response.data.phone, 
            response.data.email, 
            ctaButtonLocation,
            redirectUrl,
            target
          );
        })
        .fail(function () {
          sendNotification(
            Number(userId), 
            "System failed to answer", 
            contactId, 
            "N/A", 
            "N/A", 
            ctaButtonLocation,
            redirectUrl,
            target
          );
        });
    } else {
      sendNotification(
        Number(userId), 
        "No contact ID found", 
        "N/A", 
        "N/A", 
        "N/A", 
        ctaButtonLocation,
        redirectUrl,
        target
      );                
    }
  });
});