# HTML5.js <sup>v1.0.0-rc</sup>

<!-- div -->


<!-- div -->

## `html5`
* [`html5`](#html5)
* [`html5.version`](#html5.version)
* [`html5.createDocumentFragment`](#html5.createDocumentFragment)
* [`html5.createElement`](#html5.createElement)
* [`html5.install`](#html5.install)
* [`html5.noConflict`](#html5.noConflict)
* [`html5.uninstall`](#html5.uninstall)

<!-- /div -->


<!-- div -->

## `html5.support`
* [`html5.support`](#html5.support)
* [`html5.support.html5Printing`](#html5.support.html5Printing)
* [`html5.support.html5Styles`](#html5.support.html5Styles)
* [`html5.support.unknownElements`](#html5.support.unknownElements)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `html5`

<!-- div -->

### <a id="html5" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L724" title="View in source">`html5`</a>
*(Object)*: The `html5` object.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="html5.version" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L732" title="View in source">`html5.version`</a>
*(String)*: The semantic version number.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="html5.createDocumentFragment" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L568" title="View in source">`html5.createDocumentFragment([ownerDocument=document])`</a>
Creates a shimmed document fragment.
[&#9650;][1]

#### Arguments
1. `[ownerDocument=document]` *(Document)*: The context document.

#### Returns
*(Fragment)*: The created document fragment.

#### Example
~~~ js
// basic usage
html5.createDocumentFragment();

// from a child iframe
parent.html5.createDocumentFragment(document);
~~~

<!-- /div -->


<!-- div -->

### <a id="html5.createElement" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L525" title="View in source">`html5.createElement([ownerDocument=document], nodeName)`</a>
Creates a shimmed element of the given node name.
[&#9650;][1]

#### Arguments
1. `[ownerDocument=document]` *(Document)*: The context document.
2. `nodeName` *(String)*: The node name of the element to create.

#### Returns
*(Element)*: The created element.

#### Example
~~~ js
// basic usage
html5.createElement('div');

// from a child iframe
parent.html5.createElement(document, 'div');
~~~

<!-- /div -->


<!-- div -->

### <a id="html5.install" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L626" title="View in source">`html5.install([ownerDocument=document, options={}])`</a>
Installs shims according to the specified options.
[&#9650;][1]

#### Arguments
1. `[ownerDocument=document]` *(Document)*: The document.
2. `[options={}]` *(Object)*: Options object.

#### Returns
*(Document)*: The document.

#### Example
~~~ js
// basic usage
// autmatically called on the primary document to allow IE < 9 to
// parse HTML5 elements correctly
html5.install();

// from a child iframe
parent.html5.install(document);

// with an options object
html5.install({

  // allow IE6 to use CSS expressions to support `[hidden]`
  // and `audio[controls]` styles
  'expressions': true,

  // overwrite the document's `createElement` and `createDocumentFragment`
  // methods with `html5.createElement` and `html5.createDocumentFragment` equivalents.
  'methods': true,

  // add support for printing HTML5 elements
  'print': true,

  // add default HTML5 element styles
  // (optional if `expressions` option is truthy)
  'styles': true
});

// with an options string
html5.install('print styles');

// from a child iframe with options
parent.html5.install(document, options);

// using a shortcut to install all support extensions
html5.install('all');

// special note:
// the `expressions` options may also be a selector to limit the number of
// elements the CSS expression applies to
html5.install({
  'expressions': 'article, section'
});
~~~

<!-- /div -->


<!-- div -->

### <a id="html5.noConflict" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L660" title="View in source">`html5.noConflict()`</a>
Restores a previously overwritten `html5` object.
[&#9650;][1]

#### Returns
*(Object)*: The current `html5` object.

<!-- /div -->


<!-- div -->

### <a id="html5.uninstall" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L699" title="View in source">`html5.uninstall([ownerDocument=document, options={}])`</a>
Uninstalls shims according to the specified options.
[&#9650;][1]

#### Arguments
1. `[ownerDocument=document]` *(Document)*: The document.
2. `[options={}]` *(Object)*: Options object.

#### Returns
*(Document)*: The document.

#### Example
~~~ js
// basic usage with an options object
html5.uninstall({

  // remove CSS expression use
  'expressions': true,

  // restore the document's original `createElement`
  // and `createDocumentFragment` methods.
  'methods': true,

  // remove support for printing HTML5 elements
  'print': true,

  // remove default HTML5 element styles
  'styles': true
});

// with an options string
html5.uninstall('print styles');

// from a child iframe with options
parent.html5.uninstall(document, options);

// using a shortcut to uninstall all support extensions
html5.uninstall('all');
~~~

<!-- /div -->


<!-- /div -->


<!-- div -->

## `html5.support`

<!-- div -->

### <a id="html5.support" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L49" title="View in source">`html5.support`</a>
*(Object)*: An object used to flag features.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="html5.support.html5Printing" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L107" title="View in source">`html5.support.html5Printing`</a>
*(Boolean)*: Detect whether the browser supports printing html5 elements.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="html5.support.html5Styles" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L80" title="View in source">`html5.support.html5Styles`</a>
*(Boolean)*: Detect whether the browser supports default html5 styles.
[&#9650;][1]

<!-- /div -->


<!-- div -->

### <a id="html5.support.unknownElements" href="https://github.com/bestiejs/html5.js/blob/master/html5.js#L88" title="View in source">`html5.support.unknownElements`</a>
*(Boolean)*: Detect whether the browser supports unknown elements.
[&#9650;][1]

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #readme "Jump back to the TOC."