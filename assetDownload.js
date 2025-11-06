// Parse URL parameters
const urlParams = new URL(window.location.href);
const userId = urlParams.searchParams.get('userId');
const resourceId = urlParams.searchParams.get('resourceId');
const contactId = urlParams.searchParams.get('contactId');
const pageName = document.title || "Unknown Page";

// Send download tracking notification
function sendDownloadNotification(user, firstName, lastName, phone, email, downloadLocation) {
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
      ctaLocation: downloadLocation,
      ctaPageName: pageName
    }),
    success: function (response) {
      console.log('Download tracking notification sent successfully', response);
    },
    error: function (xhr, status, error) {
      console.error('Download tracking notification failed', error);
    }
  });
}

function downloadAsset(url, filename) {
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';

  // Append to body (required for Firefox)
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  document.body.removeChild(link);
}

/**
 * Alternative method using fetch for more control
 * Useful for CORS-enabled resources or same-origin assets
 */
async function downloadAssetWithFetch(url, filename) {
  try {
    // Show loading state (optional)
    console.log('Downloading asset...');

    // Fetch the asset
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the blob data
    const blob = await response.blob();

    // Create a URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);

    console.log('Download completed!');
  } catch (error) {
    console.error('Download failed with fetch, attempting fallback:', error);

    // Fallback to simple method (will open in new tab for cross-origin URLs)
    console.warn('Using fallback method - cross-origin URLs may open in a new tab instead of downloading');
    downloadAsset(url, filename);
  }
}

/**
 * Handle button click and trigger download
 */
function handleDownloadClick(event) {
  event.preventDefault(); // Prevent default button behavior

  const button = event.currentTarget;

  // Read configuration from data attributes
  const assetUrl = button.dataset.url;
  const fileName = button.dataset.fileName || 'download';
  const downloadMethod = button.dataset.downloadMethod || 'fetch'; // Changed default to 'fetch' for better cross-origin support
  const downloadLocation = button.dataset.downloadLocation || button.id || 'Unknown Location';

  // Validate required attributes
  if (!assetUrl) {
    console.error('Missing required data-url attribute on button');
    alert('Download configuration error: Missing URL');
    return;
  }

  // Optional: Add loading state
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Downloading...';

  // Function to proceed with download after tracking
  const proceedWithDownload = () => {
    if (downloadMethod === 'fetch') {
      downloadAssetWithFetch(assetUrl, fileName).finally(() => {
        button.disabled = false;
        button.textContent = originalText;
      });
    } else {
      downloadAsset(assetUrl, fileName);
      button.disabled = false;
      button.textContent = originalText;
    }
  };

  // Track download with contact details if contactId is available
  if (contactId) {
    $.get('https://apiv2.rapidfunnel.com/v2/contact-details/' + contactId)
      .done(function (response) {
        sendDownloadNotification(
          Number(userId),
          response.data.firstName,
          response.data.lastName,
          response.data.phone,
          response.data.email,
          downloadLocation
        );
        proceedWithDownload();
      })
      .fail(function () {
        sendDownloadNotification(
          Number(userId),
          "System failed to answer",
          contactId,
          "N/A",
          "N/A",
          downloadLocation
        );
        proceedWithDownload();
      });
  } else {
    // No contact ID, send notification with placeholder data
    sendDownloadNotification(
      Number(userId),
      "No contact ID found",
      "N/A",
      "N/A",
      "N/A",
      downloadLocation
    );
    proceedWithDownload();
  }
}

/**
 * Initialize the download functionality for all download buttons
 */
function initDownload() {
  // Find all buttons with either:
  // 1. ID starting with "downloadButton"
  // 2. data-url attribute
  const downloadButtons = document.querySelectorAll('[id^="downloadButton"], [data-url]');
  
  if (downloadButtons.length === 0) {
    console.warn('No download buttons found. Add data-url attribute or use ID starting with "downloadButton".');
    return;
  }
  
  // Add click event listener to each button
  downloadButtons.forEach(button => {
    button.addEventListener('click', handleDownloadClick);
  });
  
  console.log(`Download script initialized successfully! Found ${downloadButtons.length} download button(s).`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDownload);
} else {
  // DOM is already loaded
  initDownload();
}

// Export functions if using as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    downloadAsset,
    downloadAssetWithFetch,
    initDownload
  };
}