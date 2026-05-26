(function () {
  var script = document.currentScript || document.querySelector('script[src*="/sdk/v1/latest.js"]');
  if (!script) return;

  var loader = document.createElement('script');
  loader.src = (script.src || '/sdk/v1/latest.js').replace(/\/latest\.js(\?.*)?$/, '/hsbs-loader.js');
  loader.defer = true;

  Array.prototype.forEach.call(script.attributes, function (attr) {
    if (attr.name.indexOf('data-') === 0) {
      loader.setAttribute(attr.name, attr.value);
    }
  });

  document.head.appendChild(loader);
})();
