// Parse the URL to extract parameters - SANITIZED to prevent XSS
const parsedUrl = new URL(window.location.href);
const userIdRaw = parsedUrl.searchParams.get('userId') || '';
const contactIdRaw = parsedUrl.searchParams.get('contactId') || '';
const resourceIdRaw = parsedUrl.searchParams.get('resourceId') || '';

// Validate that IDs are numeric only (prevent XSS injection)
const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';
const resourceId = resourceIdRaw.match(/^\d+$/) ? resourceIdRaw : '';

// Allowed redirect domains - SECURITY: Whitelist to prevent open redirects
const ALLOWED_REDIRECT_DOMAINS = [
  'rapidfunnel.com',
  'my.rapidfunnel.com',
  'app.rapidfunnel.com',
  'apiv2.rapidfunnel.com',
  'thrivewithtwtapp.com',
  'kajabi.com',
  'twtmentorship.com'
];

// Helper function to validate URL against whitelist
function isUrlAllowed(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    const hostname = urlObj.hostname;

    const isAllowed = ALLOWED_REDIRECT_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain);
    });

    if (!isAllowed) {
      console.warn('[CTA Notification] Redirect blocked - domain not in whitelist:', hostname);
    }
    return isAllowed;
  } catch (e) {
    console.warn('[CTA Notification] Invalid URL format:', url);
    return false;
  }
}

// Helper function to process URL with parameters
function processUrlWithParams(url) {
  if (!url) return url;

  // SECURITY: Validate URL against whitelist before processing
  if (!isUrlAllowed(url)) {
    console.error('[CTA Notification] URL blocked by security policy:', url);
    return '#';
  }

  console.log('[CTA Notification] Processing URL:', url);
  console.log('[CTA Notification] Available params - userId:', userId, 'contactId:', contactId, 'resourceId:', resourceId);

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

      // SECURITY: Parameters are already validated as numeric at the top of the file
      // URLSearchParams.set() automatically encodes values
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
      console.warn("[CTA Notification] Invalid URL format:", processedUrl, e);
    }
  }

  console.log('[CTA Notification] Processed URL:', processedUrl);
  return processedUrl;
}

// Helper function for redirects
function handleRedirect(url, target) {
  if(url) {
    // Process URL with parameters before redirecting
    const processedUrl = processUrlWithParams(url);

    if (target === "_blank") {
      window.open(processedUrl, '_blank');
    } else {
      window.location.href = processedUrl;
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

// SECURITY: Check if jQuery is loaded before executing
if (typeof jQuery === 'undefined') {
  console.error('[CTA Notification] CRITICAL ERROR: jQuery is required but not loaded');
  console.error('[CTA Notification] This script will not execute. Please ensure jQuery is loaded before this script.');
  // Exit immediately - do not execute the rest of the code
} else {
  jQuery(function ($) {
    $('[id^="ctaButton"]').on('click', function(event) {
      event.preventDefault();

    // Capture redirect properties HERE where 'this' is the button
    var ctaButtonLocation = $(this).attr('data-description');
    const redirectUrl = $(this).attr('href');
    const target = $(this).attr('target');

    console.log('[CTA Notification] Button clicked:', $(this).attr('id'));
    console.log('[CTA Notification] Original href:', redirectUrl);
    console.log('[CTA Notification] Target:', target);

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
}