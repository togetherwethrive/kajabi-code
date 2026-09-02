(function() {
  // jQuery CDN URL
  const jQueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';

  // Font Awesome CDN URL - required for icon classes used by footerAutomation.js
  // (e.g. .fab.fa-facebook-f, .fa.fa-envelope) and any other icon markup on the site.
  // Kajabi's theme CSS never includes this on its own, so it's injected here.
  const fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

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

  // Function to load a stylesheet, skipping if it's already on the page
  // (e.g. loaded by a previous run, or added directly to the site's header code).
  function loadStylesheet(url) {
    return new Promise((resolve, reject) => {
      const alreadyPresent = Array.from(document.styleSheets).some(sheet => sheet.href === url)
        || Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(link => link.href === url);
      if (alreadyPresent) {
        resolve(url);
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve(url);
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
      document.head.appendChild(link);
    });
  }

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
      // Load Font Awesome in parallel - it doesn't block or depend on jQuery/scripts,
      // and icons should be ready as soon as the DOM elements that use them render.
      loadStylesheet(fontAwesomeUrl)
        .then(() => console.log('✓ Loaded: Font Awesome'))
        .catch(error => console.error('✗ Error loading Font Awesome:', error));

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
