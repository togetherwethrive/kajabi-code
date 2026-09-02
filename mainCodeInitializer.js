(function() {
  // jQuery CDN URL
  const jQueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';

  // Base URL for all scripts - fetched directly from GitHub raw (no CDN, no propagation delay)
  const baseUrl = 'https://raw.githubusercontent.com/togetherwethrive/kajabi-code/main/';

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
    'nextPageButton.js',
    'backButton.js'
  ];

  // Function to load a regular (CORS/MIME-friendly) script, e.g. jQuery
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

  // Function to load a script directly from GitHub raw.
  // raw.githubusercontent.com serves files as text/plain with X-Content-Type-Options: nosniff,
  // which makes browsers refuse to execute a <script src="..."> pointed at it directly.
  // Fetching the text ourselves and running it via a Blob with an explicit JS MIME type sidesteps that.
  function loadRawScript(url) {
    return fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} fetching ${url}`);
        }
        return response.text();
      })
      .then(code => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
        script.onload = () => resolve(url);
        script.onerror = () => reject(new Error(`Failed to execute script: ${url}`));
        document.head.appendChild(script);
      }));
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

      // Load custom scripts directly from GitHub raw - cache-busted so every pageview gets the latest version
      console.log('Starting to load custom scripts...');
      for (const scriptName of scripts) {
        try {
          const fullUrl = baseUrl + scriptName + '?cb=' + Date.now();
          await loadRawScript(fullUrl);
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
