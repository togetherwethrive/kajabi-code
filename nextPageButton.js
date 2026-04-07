(function() {
  'use strict';

  console.log('[Next Page Button] Script loaded');

  const ALLOWED_REDIRECT_DOMAINS = [
    'rapidfunnel.com',
    'my.rapidfunnel.com',
    'app.rapidfunnel.com',
    'apiv2.rapidfunnel.com',
    'thrivewithtwtapp.com',
    'kajabi.com',
    'twtmentorship.com'
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const resourceIdRaw = urlParams.get('resourceId') || '';
  const userIdRaw = urlParams.get('userId') || '';
  const contactIdRaw = urlParams.get('contactId') || '';

  const userId = userIdRaw.match(/^\d+$/) ? userIdRaw : '';
  const contactId = contactIdRaw.match(/^\d+$/) ? contactIdRaw : '';
  const resourceId = resourceIdRaw.match(/^\d+$/) ? resourceIdRaw : window.location.pathname;

  function isUrlAllowed(url) {
    if (!url) return false;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      const hostname = urlObj.hostname;
      return ALLOWED_REDIRECT_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    } catch (e) {
      return false;
    }
  }

  function processUrlWithParams(url) {
    if (!url) return url;
    let processedUrl = url;
    let hasPlaceholder = false;

    if (userId) {
      if (processedUrl.includes('{userId}') || processedUrl.includes('[userId]') || processedUrl.includes('[user-id]')) {
        processedUrl = processedUrl.replace(/\{userId\}/g, userId);
        processedUrl = processedUrl.replace(/\[userId\]/g, userId);
        processedUrl = processedUrl.replace(/\[user-id\]/g, userId);
        hasPlaceholder = true;
      }
    }

    if (contactId) {
      if (processedUrl.includes('{contactId}') || processedUrl.includes('[contactId]')) {
        processedUrl = processedUrl.replace(/\{contactId\}/g, contactId);
        processedUrl = processedUrl.replace(/\[contactId\]/g, contactId);
        hasPlaceholder = true;
      }
    }

    if (resourceId) {
      if (processedUrl.includes('{resourceId}') || processedUrl.includes('[resourceId]')) {
        processedUrl = processedUrl.replace(/\{resourceId\}/g, resourceId);
        processedUrl = processedUrl.replace(/\[resourceId\]/g, resourceId);
        hasPlaceholder = true;
      }
    }

    if (!hasPlaceholder) {
      try {
        const urlObj = new URL(processedUrl);
        if (userId) urlObj.searchParams.set('userId', userId);
        if (contactId) urlObj.searchParams.set('contactId', contactId);
        if (resourceId) urlObj.searchParams.set('resourceId', resourceId);
        processedUrl = urlObj.toString();
      } catch (e) {
        console.warn('[Next Page Button] Invalid URL format:', processedUrl, e);
      }
    }

    return processedUrl;
  }

  function setupNextPageButton() {
    const button = document.getElementById('nextPageButton');
    if (!button) {
      console.log('[Next Page Button] Button not found');
      return;
    }

    console.log('[Next Page Button] Button found');

    const buttonUrl = button.getAttribute('href') || button.getAttribute('data-url');
    if (!buttonUrl) {
      console.warn('[Next Page Button] No href or data-url found');
      return;
    }

    const processedUrl = processUrlWithParams(buttonUrl);

    if (isUrlAllowed(processedUrl)) {
      button.setAttribute('href', processedUrl);
      console.log('[Next Page Button] Parameters injected:', processedUrl);
    } else {
      console.error('[Next Page Button] URL blocked by security policy');
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupNextPageButton);
    } else {
      setupNextPageButton();
    }
  }

  init();
})();
