/*!
 * HTML5.js v1.0
 * Copyright 2012 John-David Dalton <http://allyoucanleet.com/>
 * Based on HTML5 Shiv vpre3.3 | @afarkas @jon_neal @rem | MIT/GPL2 Licensed
 * Available under MIT/GPL2 license
 */
;(function(window, document) {

  /** Preset for the install/uninstall methods */
  var allOptions = { 'expressions': true, 'methods': true, 'print': true, 'styles': true };

  /** Cache of created elements, document methods, and install state */
  var html5Cache = {};

  /** List of HTML5 node names to install support for */
  var nodeNames = 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video'.split(' ');

  /** Used to namespace printable elements and define `expando` */
  var namespace = 'html5js';

  /** Used to store an elements `uid` if `element.uniqueNumber` is not supported */
  var expando = namespace + /\d+$/.exec(Math.random());

  /** Used to filter media types */
  var reMedia = /^$|\b(?:all|print)\b/;

  /** Used to skip problem elements */
  var reSkip = /^<|^(?:button|form|map|select|textarea)$/i;

  /** Used to detect elements that cannot be cloned correctly */
  var reUnclonable = /^<\?/;

  /** Used to prevent a `removeChild` memory leak in IE < 9 */
  var trash = document.createElement('div');

  /** Used as a fallback for `element.uniqueNumber` */
  var uid = 1;

  /** Cache of unclonable element node names */
  var unclonables = {};

  /**
   * An object used to flag features.
   * @static
   * @memberOf html5
   * @type Object
   */
  var support = {};

  (function() {
    var p,
        parent,
        sandbox;

    // create a new document used to get untainted styles
    try {
      // avoid https: protocol issues with IE
      sandbox = new ActiveXObject(location.protocol == 'https:' && 'htmlfile');
    } catch(e) {
      // http://xkr.us/articles/dom/iframe-document/
      (sandbox = document.createElement('iframe')).name = expando;
      sandbox.frameBorder = sandbox.height = sandbox.width = 0;
      parent = document.body || document.documentElement;
      parent.insertBefore(sandbox, parent.firstChild);
      sandbox = (sandbox = sandbox.contentWindow || sandbox.contentDocument || frames[expando]).document || sandbox;
    }
    sandbox.write('<!doctype html><title></title><body><script>document.w=this<\/script>');
    sandbox.close();

    p = sandbox.body.appendChild(sandbox.createElement('p'));
    p.innerHTML = '<xyz></xyz>';
    p.hidden = true;

    /**
     * Detect whether the browser supports default html5 styles.
     * @memberOf html5.support
     * @type Boolean
     */
    support.html5Styles = (p.currentStyle ||
      sandbox.w.getComputedStyle(p, null)).display == 'none';

    /**
     * Detect whether the browser supports unknown elements.
     * @memberOf html5.support
     * @type Boolean
     */
    support.unknownElements = p.childNodes.length == 1 || (function() {
      // assign a false positive if unable to install
      try {
        (document.createElement)('p');
      } catch(e) {
        return true;
      }
      var frag = document.createDocumentFragment();
      return (
        typeof frag.createElement == 'undefined' ||
        typeof p.uniqueNumber == 'undefined'
      );
    }());

    /**
     * Detect whether the browser supports printing html5 elements.
     * @memberOf html5.support
     * @type Boolean
     */
    support.html5Printing = support.unknownElements || (
      // assign a false positive if unable to install
      typeof document.namespaces == 'undefined' ||
      typeof document.parentWindow == 'undefined' ||
      typeof p.applyElement == 'undefined' ||
      typeof p.removeNode == 'undefined' ||
      typeof window.attachEvent == 'undefined'
    );

    parent && destroyElement(sandbox.w.frameElement);
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet of modified CSS rules to style the print wrappers.
   * (eg. the CSS rule "header{}" becomes "html5js\:header{}")
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  function addPrintSheet(ownerDocument, cssText) {
    var pair,
        parts = cssText.split('{'),
        index = parts.length,
        reElements = RegExp('(^|[\\s,>+~])(' + nodeNames.join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
        replacement = '$1' + namespace + '\\:$2';

    while (index--) {
      pair = parts[index] = parts[index].split('}');
      pair[pair.length - 1] = pair[pair.length - 1].replace(reElements, replacement);
      parts[index] = pair.join('}');
    }
    return addStyleSheet(ownerDocument, parts.join('{'));
  }

  /**
   * Wraps all HTML5 elements in the given document with printable elements.
   * (eg. the "header" element is wrapped with the "html5js:header" element)
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Array} An array of added wrappers.
   */
  function addPrintWrappers(ownerDocument) {
    var node,
        nodes = ownerDocument.getElementsByTagName('*'),
        index = nodes.length,
        reElements = RegExp('^(?:' + nodeNames.join('|') + ')$', 'i'),
        result = [];

    while (index--) {
      node = nodes[index];
      if (reElements.test(node.nodeName)) {
        result.push(node.applyElement(createPrintWrapper(node)));
      }
    }
    return result;
  }

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style sheet.
   */
  function addStyleSheet(ownerDocument, cssText) {
    // IE7 only respects `[hidden]` rules when created with `document.createStyleSheet`
    if (document.createStyleSheet && !/\\:/.test(cssText)) {
      var sheet = ownerDocument.createStyleSheet();
      sheet.cssText = cssText;
      return sheet.owningElement;
    }
    // IE8 only respects namespace prefixs when created with `innerHTML`
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  /**
   * Computes an IE6 CSS expression.
   * @private
   * @returns {String} The expression result.
   */
  function computeExpression() {
    // to avoid circular memory leaks the `this` binding is set to the matched element
    function onPropertyChange(event) {
      var node = event.srcElement,
          prop = event.propertyName;

      if (prop == 'hidden' || prop == 'controls' && node.nodeName.toLowerCase() == 'audio') {
        var specified = node[prop] === '' || node[prop],
            style = node.style;

        style.display = prop == 'hidden'
          ? (specified ? 'none' : '')
          : (specified ? (style.zoom = 1, 'inline') : (style.zoom = 'normal', ''));
      }
    }
    // overwrite the CSS expression and hookup event handlers
    setTimeout(function(node) {
      return function() {
        node.style.setExpression('display', 0);
        node.removeAttribute(expando);
        node.attachEvent('onpropertychange', onPropertyChange);
      };
    }(this), 0);

    // set a flag to avoid processing the element again
    // use a non-primitive value for the property to hide it from `outerHTML`
    this[expando] = {};

    // simulate `audio[controls]` and `[hidden]` support
    return (this.controls === '' || this.controls) && this.nodeName.toLowerCase() == 'audio'
      ? (this.style.zoom = 1, 'inline')
      : (this.hidden === '' || this.hidden ? 'none' : '');
  }

  /**
   * Creates HTML5 elements using the given document enabling the document to
   * parse them correctly.
   * @private
   * @param {Document|Fragment} ownerDocument The document.
   * @returns {Document|Fragment} The document.
   */
  function createElements(ownerDocument) {
    var create = ownerDocument.createElement,
        index = nodeNames.length;

    while (index--) {
      create(nodeNames[index]);
    }
    return ownerDocument;
  }

  /**
   * Creates a printable wrapper for the given element.
   * @private
   * @param {Element} element The element.
   * @returns {Element} The wrapper.
   */
  function createPrintWrapper(element) {
    var node,
        nodes = element.attributes,
        index = nodes.length,
        wrapper = element.ownerDocument.createElement(namespace + ':' + element.nodeName);

    // copy element attributes to the wrapper
    while (index--) {
      node = nodes[index];
      node.specified && wrapper.setAttribute(node.nodeName, node.nodeValue);
    }
    // copy element styles to the wrapper
    wrapper.style.cssText = element.style.cssText;
    return wrapper;
  }

  /**
   * Destroys the given element.
   * @private
   * @param {Element} element The element to destroy.
   */
  function destroyElement(element) {
    trash.appendChild(element);
    trash.innerHTML = '';
  }

  /**
   * Gets the cache object for the given document.
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} The cache object.
   */
  function getCache(ownerDocument) {
    var docEl = ownerDocument.documentElement,
        id = docEl.uniqueNumber || docEl[expando] || (docEl[expando] = uid++),
        skip = support.unknownElements;

    return html5Cache[id] || (html5Cache[id] = {
      'createElement': skip ? false : createElements(ownerDocument).createElement,
      'createDocumentFragment': skip ? false : ownerDocument.createDocumentFragment,
      'frag': skip ? false : createElements(ownerDocument.createDocumentFragment()),
      'nodes': {}
    });
  }

  /**
   * Resolves an options object from the given value.
   * @private
   * @param {Mixed} value The value to convert to an options object.
   * @returns {Object} The options object.
   */
  function resolveOptions(value) {
    value = value ? (value === 'all' || value.all ? allOptions : value) : {};
    if (typeof value == 'string') {
      var object = {};
      value = value.split(/[, ]+/);
      while ((key = value.pop())) {
        object[key] = true;
      }
      value = object;
    }
    return value;
  }

  /**
   * Overwrites the document's `createElement` and `createDocumentFragment` methods
   * with `html5.createElement` and `html5.createDocumentFragment` equivalents.
   * @private
   * @param {Document} ownerDocument The document.
   */
  function setMethods(ownerDocument) {
    var cache = getCache(ownerDocument),
        create = cache.createElement,
        frag = cache.frag,
        nodes = cache.nodes;

    // allow a small amount of repeated code for better performance
    ownerDocument.createElement = function(nodeName) {
      var cached = nodes[nodeName],
          node = cached ? cache.cloneNode() : create(nodeName);

      if (!cached && !unclonables[nodeName] &&
          !(unclonables[nodeName] = reUnclonable.test(node.outerHTML))) {
        node = (nodes[nodeName] = node).cloneNode();
      }
      return node.canHaveChildren && !reSkip.test(nodeName) ? frag.appendChild(node) : node;
    };

    // compile unrolled `createElement` calls for better performance
    ownerDocument.createDocumentFragment = Function('f',
      'return function(){var n=f.cloneNode(),c=n.createElement;' +
      ('' + nodeNames).replace(/\w+/g, 'c("$&")') +
      ';return n}'
    )(frag);
  }

  /**
   * Adds support for printing HTML5 elements.
   * @private
   * @param {Document} ownerDocument The document.
   */
  function setPrintSupport(ownerDocument) {
    var printSheet,
        wrappers,
        cache = getCache(ownerDocument),
        namespaces = ownerDocument.namespaces,
        ownerWindow = ownerDocument.parentWindow;

    ownerWindow.attachEvent('onbeforeprint', cache.onbeforeprint = function() {
      var imports,
          length,
          sheet,
          collection = ownerDocument.styleSheets,
          cssText = [],
          index = collection.length,
          sheets = Array(index);

      // convert styleSheets collection to an array
      while (index--) {
        sheets[index] = collection[index];
      }
      // concat all style sheet CSS text
      while ((sheet = sheets.pop())) {
        // IE does not enforce a same origin policy for external style sheets...
        if (!sheet.disabled && reMedia.test(sheet.media)) {
          // but will throw an "access denied" error when attempting to read the
          // CSS text of a style sheet added by a script from a different origin
          try {
            cssText.push(sheet.cssText);
            for (imports = sheet.imports, index = 0, length = imports.length; index < length; index++) {
              sheets.push(imports[index]);
            }
          } catch(e) { }
        }
      }
      // wrap all HTML5 elements with printable elements and add print style sheet
      wrappers = addPrintWrappers(ownerDocument);
      printSheet = addPrintSheet(ownerDocument, cssText.reverse().join(''));
    });

    ownerWindow.attachEvent('onafterprint', cache.onafterprint = function() {
      // remove wrappers, leaving the original elements, and remove print style sheet
      removePrintWrappers(wrappers);
      destroyElement(printSheet);
    });

    if (typeof namespaces[namespace] == 'undefined') {
      namespaces.add(namespace);
    }
  }

  /**
   * Adds default HTML5 element styles to the given document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {Object} options Options object.
   */
  function setStyles(ownerDocument, options) {
    // http://mathiasbynens.be/notes/safe-css-hacks#css-hacks
    var expressions = options.expressions;
    getCache(ownerDocument).sheet = addStyleSheet(ownerDocument,
      // corrects block display not defined in IE6/7/8/9
      'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
      // corrects audio display not defined in IE6/7/8/9
      'audio{display:none}' +
      // corrects canvas and video display not defined in IE6/7/8/9
      'canvas,video{display:inline-block;*display:inline;*zoom:1}' +
      // adds styling not present in IE6/7/8/9
      'mark{background:#ff0;color:#000}' +
      // corrects 'hidden' attribute and audio[controls] display not present in IE7/8/9
      '[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}' +
      // use CSS expressions to simulate attribute selectors in IE6
      // avoid CSS hacks like the underscore prefix because IE7 will still eval the expression
      (window.XMLHttpRequest || !expressions ? '' :
        (typeof expressions == 'string'
          ? expressions
          : 'a,abbr,acronym,address,applet,b,bdo,big,blockquote,body,br,button,' +
            'caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,fieldset,form,' +
            'h1,h2,h3,h4,h5,h6,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,' +
            'object,ol,optgroup,option,p,pre,q,samp,select,small,span,strong,sub,' +
            'sup,table,tbody,td,textarea,tfoot,th,thead,tr,tt,ul,var,' + nodeNames
        ) +
        '{display:expression(this.' + expando + '||html5._computeExpression.call(this))}'
    ));
  }

  /**
   * Removes the given print wrappers, leaving the original elements.
   * @private
   * @params {Array} wrappers An array of wrappers.
   */
  function removePrintWrappers(wrappers) {
    var index = wrappers.length;
    while (index--) {
      destroyElement(wrappers[index].removeNode());
    }
  }

  /**
   * Restores the document's original `createElement` and `createDocumentFragment` methods.
   * @private
   * @param {Document} ownerDocument The document.
   */
  function unsetMethods(ownerDocument) {
    var cache = getCache(ownerDocument),
        fn = cache.createElement;

    if (ownerDocument.createElement != fn) {
      ownerDocument.createElement = fn;
    }
    if (ownerDocument.createDocumentFragment != (fn = cache.createDocumentFragment)) {
      ownerDocument.createDocumentFragment = fn;
    }
  }

  /**
   * Removes support for printing HTML5 elements.
   * @private
   * @param {Document} ownerDocument The document.
   */
  function unsetPrintSupport(ownerDocument) {
    var cache = getCache(ownerDocument),
        ownerWindow = ownerDocument.parentWindow;

    ownerWindow.detachEvent('onbeforeprint', cache.onbeforeprint || unsetPrintSupport);
    ownerWindow.detachEvent('onafterprint', cache.onafterprint || unsetPrintSupport);
  }

  /**
   * Removes default HTML5 element styles.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {Object} options Options object.
   */
  function unsetStyles(ownerDocument, options) {
    var cache = getCache(ownerDocument),
        sheet = cache.sheet;

    if (sheet) {
      cache.sheet = !destroyElement(sheet);
      if (options.expressions && !options.styles) {
        // add styles minus CSS expressions
        setStyles(ownerDocument, {});
      }
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a shimmed element of the given node name.
   * @memberOf html5
   * @param {Document} [ownerDocument=document] The context document.
   * @param {String} nodeName The node name of the element to create.
   * @returns {Element} The created element.
   * @example
   *
   * // basic usage
   * html5.createElement('div');
   *
   * // from a child iframe
   * parent.html5.createElement(document, 'div');
   */
  function createElement(ownerDocument, nodeName) {
    // juggle arguments
    ownerDocument || (ownerDocument = document);
    if (ownerDocument && !ownerDocument.nodeType) {
      nodeName = ownerDocument;
      ownerDocument = document;
    }
    if (support.unknownElements) {
      return ownerDocument.createElement(nodeName);
    }
    // Avoid adding some elements to fragments in IE < 9 because
    // * attributes like `name` or `type` cannot be set/changed once an element
    //   is inserted into a document/fragment
    // * link elements with `src` attributes that are inaccessible, as with
    //   a 403 response, will cause the tab/window to crash
    // * script elements appended to fragments will execute when their `src`
    //   or `text` property is set
    var cache = getCache(ownerDocument),
        nodes = cache.nodes,
        cached = nodes[nodeName],
        node = cached ? cached.cloneNode() : cache.createElement(nodeName);

    // IE < 9 doesn't clone unknown elements correctly
    if (!cached && !unclonables[nodeName] &&
        !(unclonables[nodeName] = reUnclonable.test(node.outerHTML))) {
      node = (nodes[nodeName] = node).cloneNode();
    }
    return node.canHaveChildren && !reSkip.test(nodeName) ? cache.frag.appendChild(node) : node;
  }

  /**
   * Creates a shimmed document fragment.
   * @memberOf html5
   * @param {Document} [ownerDocument=document] The context document.
   * @returns {Fragment} The created document fragment.
   * @example
   *
   * // basic usage
   * html5.createDocumentFragment();
   *
   * // from a child iframe
   * parent.html5.createDocumentFragment(document);
   */
  function createDocumentFragment(ownerDocument) {
    ownerDocument || (ownerDocument = document);
    return support.unknownElements
      ? ownerDocument.createDocumentFragment()
      : createElements(getCache(ownerDocument).frag.cloneNode());
  }

  /**
   * Installs shims according to the specified options.
   * @memberOf html5
   * @param {Document} [ownerDocument=document] The document.
   * @param {Object} [options={}] Options object.
   * @returns {Document} The document.
   * @example
   *
   * // basic usage
   * // autmatically called on the primary document to allow IE < 9 to
   * // parse HTML5 elements correctly
   * html5.install();
   *
   * // from a child iframe
   * parent.html5.install(document);
   *
   * // with an options object
   * html5.install({
   *
   *   // allow IE6 to use CSS expressions to support `[hidden]`
   *   // and `audio[controls]` styles
   *   'expressions': true,
   *
   *   // overwrite the document's `createElement` and `createDocumentFragment`
   *   // methods with `html5.createElement` and `html5.createDocumentFragment` equivalents.
   *   'methods': true,
   *
   *   // add support for printing HTML5 elements
   *   'print': true,
   *
   *   // add default HTML5 element styles
   *   // (optional if `expressions` option is truthy)
   *   'styles': true
   * });
   *
   * // with an options string
   * html5.install('print styles');
   *
   * // from a child iframe with options
   * parent.html5.install(document, options);
   *
   * // using a shortcut to install all support
   * html5.install('all');
   *
   * // special note:
   * // the `expressions` options may also be a selector to limit the number of
   * // elements the CSS expression applies to
   * html5.install({
   *   'expressions': 'article, section'
   * });
   */
  function install(ownerDocument, options) {
    ownerDocument || (ownerDocument = document);
    if (ownerDocument && !ownerDocument.nodeType) {
      options = ownerDocument;
      ownerDocument = document;
    }
    // uninstall all `styles` when installing `expressions` to avoid
    // extra work by `unsetStyles()`
    options = resolveOptions(options);
    uninstall(ownerDocument, {
      'methods': options.methods,
      'print': options.print,
      'styles': options.styles || options.expressions
    });

    if (!support.html5Styles && options.styles) {
      getCache(ownerDocument);
      setStyles(ownerDocument, options);
    }
    if (!support.html5Printing && options.print) {
      setPrintSupport(ownerDocument);
    }
    if (!support.unknownElements) {
      // if not installing methods then init cache and install support
      // for basic HTML5 element parsing
      options.methods ? setMethods(ownerDocument) : getCache(ownerDocument);
    }
    return ownerDocument;
  }

  /**
   * Uninstalls shims according to the specified options.
   * @memberOf html5
   * @param {Document} [ownerDocument=document] The document.
   * @param {Object} [options={}] Options object.
   * @returns {Document} The document.
   * @example
   *
   * // basic usage with an options object
   * html5.uninstall({
   *
   *   // remove CSS expression use
   *   'expressions': true,
   *
   *   // restore the document's original `createElement`
   *   // and `createDocumentFragment` methods.
   *   'methods': true,
   *
   *   // remove support for printing HTML5 elements
   *   'print': true,
   *
   *   // remove default HTML5 element styles
   *   'styles': true
   * });
   *
   * // with an options string
   * html5.uninstall('print styles');
   *
   * // from a child iframe with options
   * parent.html5.uninstall(document, options);
   *
   * // using a shortcut to uninstall all support
   * html5.uninstall('all');
   */
  function uninstall(ownerDocument, options) {
    ownerDocument || (ownerDocument = document);
    if (ownerDocument && !ownerDocument.nodeType) {
      options = ownerDocument;
      ownerDocument = document;
    }
    options = resolveOptions(options);
    if (!support.unknownElements && options.methods) {
      unsetMethods(ownerDocument);
    }
    if (!support.html5Printing && options.print) {
      unsetPrintSupport(ownerDocument);
    }
    if (!support.html5Styles && (options.expressions || options.styles)) {
      unsetStyles(ownerDocument, options);
    }
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `html5` object.
   * @type Object
   */
  var html5 = {

    // an object of feature detection flags
    'support': support,

    // pseudo private method used by IE6 CSS expressions
    '_computeExpression': computeExpression,

    // creates shimmed document fragments
    'createDocumentFragment': createDocumentFragment,

    // creates shimmed elements
    'createElement': createElement,

    // installs shims
    'install': install,

    // uninstalls shims
    'uninstall': uninstall
  };

  /*--------------------------------------------------------------------------*/

  // install support for basic HTML5 element parsing
  install();

  // expose html5
  // via an AMD loader
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define('html5', function() {
      return html5;
    });
  }
  // in a browser
  else {
    // use square bracket notation so Closure Compiler won't munge `html5`
    // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
    window['html5'] = html5;
  }
}(this, document));