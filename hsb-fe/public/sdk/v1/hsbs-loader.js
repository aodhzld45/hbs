(function () {
  var currentScript = document.currentScript || document.querySelector('script[src*="hsbs-loader"]');
  if (!currentScript) return;

  var dataset = currentScript.dataset || {};
  var loaderSrc = currentScript.src || '';
  var sdkBase = loaderSrc ? loaderSrc.replace(/\/hsbs-loader\.js(\?.*)?$/, '') : '/sdk/v1';
  var sdkSrc = dataset.sdkSrc || (sdkBase + '/hsbs-chat.js');
  var cssSrc = dataset.cssSrc || (sdkBase + '/hsbs-chat.css');

  function parseBoolean(value) {
    if (value == null || value === '') return false;
    return value === 'true' || value === 'Y' || value === '1';
  }

  function loadStylesheet() {
    if (document.getElementById('hsbs-widget-css')) return;
    var link = document.createElement('link');
    link.id = 'hsbs-widget-css';
    link.rel = 'stylesheet';
    link.href = cssSrc;
    document.head.appendChild(link);
  }

  function buildOptions() {
    var options = {
      siteKey: dataset.siteKey || '',
      apiBase: dataset.apiBase || '/api',
      theme: dataset.theme || 'auto'
    };

    if (dataset.debug != null) options.debug = parseBoolean(dataset.debug);
    if (dataset.autoOpen != null) options.autoOpen = parseBoolean(dataset.autoOpen);
    if (dataset.position) options.position = dataset.position;

    return options;
  }

  function init() {
    if (!window.HSBS || typeof window.HSBS.init !== 'function') {
      if (window.console && console.warn) {
        console.warn('[HSBS] SDK core is not ready.');
      }
      return;
    }
    window.HSBS.init(buildOptions());
  }

  function loadCore() {
    if (window.HSBS && typeof window.HSBS.init === 'function') {
      init();
      return;
    }

    var script = document.createElement('script');
    script.src = sdkSrc;
    script.async = true;
    script.onload = init;
    script.onerror = function () {
      if (window.console && console.warn) {
        console.warn('[HSBS] SDK core load failed:', sdkSrc);
      }
    };
    document.head.appendChild(script);
  }

  loadStylesheet();
  loadCore();
})();
