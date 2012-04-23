# HTML5.js <sup>v1.0.0-rc</sup>

The **new** defacto standard HTML5 element support library.

## BestieJS Incubator

HTML5.js still needs a little work to be worthy of the title *"Best in Class"*. Please, feel free to contribute additional unit tests or documentation.

## Documentation

The documentation for HTML5.js can be viewed here: [/doc/README.md](https://github.com/bestiejs/html5.js/blob/master/doc/README.md#readme)

For a list of upcoming features, check out our [roadmap](https://github.com/bestiejs/html5.js/wiki/Roadmap).

## Installation and usage

In a browser:

~~~ html
<script src="html5.js"></script>
~~~

In an AMD loader like [RequireJS](http://requirejs.org/):

~~~ js
require({
  'paths': {
    'html5': 'path/to/html5'
  }
},
['html5'], function(html5) {
  console.log(html5.support);
});
~~~

Usage example:

~~~ js
// create an element
html5.createElement('div');

// or a document fragment that supports parsing/styling HTML5 elements
html5.createDocumentFragment();

// install support extensions with an options object
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

// or with an options string
html5.install('print styles');

// or using a shortcut to install all support extensions
html5.install('all');
~~~

## Cloning this repo

To clone this repository including all submodules, using Git 1.6.5 or later:

~~~ bash
git clone --recursive https://github.com/bestiejs/html5.js.git
cd html5.js
~~~

For older Git versions, just use:

~~~ bash
git clone https://github.com/bestiejs/html5.js.git
cd html5.js
git submodule update --init
~~~

## Author

* [John-David Dalton](http://allyoucanleet.com/)
  [![twitter/jdalton](http://gravatar.com/avatar/299a3d891ff1920b69c364d061007043?s=70)](https://twitter.com/jdalton "Follow @jdalton on Twitter")
