(function() {
  // jQuery CDN URL
  const jQueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';

  // Base URL for all scripts - using jsDelivr CDN which provides proper headers
  const baseUrl = 'https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/';

  // Array of script filenames to load
  const scripts = [
    'showButtonOnVideoCompletion.js',
    'formValidation.js',
    'assetDownload.js',
    'buttonTracking.js',
    'ctaButtonNotification.js',
    'footerAutomation.js',
    'multipleVideoTracking.js',
    'videoLocking.js',
    'backButton.js'
  ];
  
  // Function to load a script
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = false; // Ensures scripts load in order
      script.onload = () => resolve(url);
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }
  
  // Load all scripts sequentially
  async function loadAllScripts() {
    try {
      // Load jQuery first if not already loaded
      if (typeof jQuery === 'undefined') {
        console.log('Loading jQuery...');
        await loadScript(jQueryUrl);
        console.log('✓ jQuery loaded successfully');
      } else {
        console.log('jQuery already loaded (version ' + jQuery.fn.jquery + ')');
      }

      // Load custom scripts
      console.log('Starting to load custom scripts...');
      for (const scriptName of scripts) {
        try {
          const fullUrl = baseUrl + scriptName;
          await loadScript(fullUrl);
          console.log(`✓ Loaded: ${scriptName}`);
        } catch (error) {
          console.error(`✗ Error loading ${scriptName}:`, error);
        }
      }
      console.log('All scripts loaded!');
    } catch (error) {
      console.error('Error loading jQuery:', error);
    }
  }
  
  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllScripts);
  } else {
    loadAllScripts();
  }
})();