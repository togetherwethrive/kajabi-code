// SECURITY: Check if jQuery is loaded before executing
if (typeof jQuery === 'undefined') {
  console.error('[Footer Automation] CRITICAL ERROR: jQuery is required but not loaded');
  console.error('[Footer Automation] This script will not execute. Please ensure jQuery is loaded before this script.');
} else {
  jQuery(function ($) {
    $(document).ready(function () {
      // Parse the URL to extract userId, resourceID, and contactId - SANITIZED to prevent XSS
      const parsedUrl = new URL(window.location.href);
      const userIdRaw = parsedUrl.searchParams.get('userId') || '';
      const resourceIdRaw = parsedUrl.searchParams.get('resourceId') || '';
      const contactIdRaw = parsedUrl.searchParams.get('contactId') || '';

      // Validate that IDs are numeric only (prevent XSS injection)
      const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
      const resourceId = resourceIdRaw.match(/^\d+$/) ? resourceIdRaw : '';
      const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';

      const emailIcon = document.querySelector('span.fa.fa-envelope.fa-lg');
      const phoneIcon = document.querySelector('span.fa.fa-phone.fa-lg');

      if (emailIcon) {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(
          'span.fa.fa-envelope.fa-lg::before { content: ""; }',
          styleSheet.cssRules.length
        );
      }

      if (phoneIcon) {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(
          'span.fa.fa-phone.fa-lg::before { content: ""; }',
          styleSheet.cssRules.length
        );
      }

      if (userId) {
        $.get(
          'https://apiv2.rapidfunnel.com/v2/users-details/' + userId,
          function (data) {
            const userData = data.data[0];

            window.sharedData = window.sharedData || {};
            window.sharedData.customBookingLink = userData.customBookingLink;

            // Loop over the userData keys
            for (const key of Object.keys(userData)) {
              const value = userData[key];
              const $element = $('#' + key);

              if ($element.length) {
                // If it's not the customBookingLink, set the text for the element (replace the placeholder text)
                if (key !== 'customBookingLink' && !$element.hasClass('footer-btn-socials')) {
                  $element.text(value);
                }

                if (key === 'profileImage') {
                  const imgSrc =
                    value !== ''
                      ? value
                      : 'https://rfres.com/assets/img/icon-user-default.png';
                  $element.attr('src', imgSrc);
                } else if (key === 'email') {
                  $element.attr('href', 'mailto:' + value).text(value);
                } else if (key === 'phoneNumber') {
                  if (value !== '') {
                    $element.attr('href', 'tel:' + value).text(value);
                  } else {
                    $element.parent().hide();
                  }
                } else if (key === 'customBookingLink') {
                  if (value !== '') {
                    $element.attr('href', value);
                    $element.find('span').text('');
                    $('.custom_custombookinglink').attr('href', value);
                    $('.alternate-text').hide();

                    // Trigger the custom event now that the href has been updated
                    $(document).trigger('customBookingLinkUpdated');
                  } else {
                    $element.hide();
                    $('.custom_custombookinglink').hide();
                  }
                }
              }

              $('.firstName').text(userData.firstName);
              $('.lastName').text(userData.lastName);
              $('.custom_custombookinglink').find('span').text('');

              // Ensure booking link navigates properly (override any external handlers)
              $('#customBookingLink, .custom_custombookinglink').on('click', function(e) {
                e.stopPropagation();
                var href = $(this).attr('href');
                if (href && href !== '#' && href !== window.location.href) {
                  window.location.href = href;
                }
              });

              // Handle social links (replace href if available, otherwise hide the element)
              $('.footer-social-links a').each(function () {
                const socialId = $(this).attr('id');

                if (
                  userData.hasOwnProperty(socialId) &&
                  userData[socialId] &&
                  userData[socialId].trim() !== ''
                ) {
                  $(this)
                    .attr('href', userData[socialId]);
                  $(this).find('span').text('');
                } else {
                  $(this).hide();
                }
              });
            }
          }
        ).fail(function () {
          console.error('Failed to fetch user details.');
        });
      }
    });
  });
}
