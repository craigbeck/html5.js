(function(window) {

  /** The `html5` object to test */
  var html5 = window.html5;

  /** Used for iframe names */
  var uid = 0;

  /*--------------------------------------------------------------------------*/

  /**
   * An iteration utility.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(array, callback) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      callback(array[index], index, array);
    }
  }

  /**
   * Executes a code snippet from inside an iframe and passes the result to the callback.
   * @private
   * @param {String} code The code to execute.
   * @param {callback} callback The callback.
   */
  function executeInIframe(code, callback) {
    var doc,
        body = document.body,
        iframe = document.createElement('iframe');

    iframe.name = 't' + uid++;
    iframe.frameBorder = iframe.height = iframe.width = 0;
    body.insertBefore(iframe, body.firstChild);
    doc = (doc = iframe.contentWindow || iframe.contentDocument || frames[iframe.name]).document || doc;
    doc.write('<!doctype html><title></title><body><script>var doc=document,html5=parent.html5;doc.result=' + code + '<\/script>');
    doc.close();
    callback(doc.result);
    body.removeChild(iframe);
  }

  /**
   * Uses implementation dependent `Function#toString` behavior in an attempt
   * to detect native functions by comparing the `toString` signature of a native
   * function against that of the given function. Note: This function is not
   * foolproof and will return `false` in environments that return empty string
   * values or unmatchable signatures.
   * @private
   * @param {Object} object The object that the function is accessible from.
   * @param {String} method The property name of the function.
   * @returns {Boolean} Returns true if the signatures match, else false.
   * @see https://github.com/dperini/nwmatcher/blob/master/src/nwmatcher.js#L183-190
   */
  var isNative = (function() {
    // resolve the native function `toString` signature from a builtin and a host object
    // e.g. `function (){ [native code] }`, `[function]` or `[ecmascript code]`
    var signatures = [{}.valueOf + '', document.appendChild + ''];

    // remove identical or unresolvable signatures
    signatures[0] ? (signatures[0] = signatures[0].replace(/valueOf/g, '')) : signatures.shift();
    signatures[1] ? (signatures[1] = signatures[1].replace(/appendChild/g, '')) : signatures.pop();
    signatures[1] == signatures[0] && signatures.pop();

    return function(object, method) {
      var signature,
          index = -1,
          length = signatures.length,
          fn = object && object[method];

      if (!!fn && typeof fn != 'string') {
        signature = (fn + '').replace(RegExp(method, 'g'), '');
        while (++index < length) {
          if (signature == signatures[index]) {
            return true;
          }
        }
      }
      return false;
    }
  }());

  /**
   * Skips a given number of tests with a passing result.
   * @private
   * @param {Number} count The number of tests to skip.
   */
  function skipTest(count) {
    while (count--) {
      ok(true, 'test skipped');
    }
  }

  /*--------------------------------------------------------------------------*/

  QUnit.module('html5');

  test('html5.createElement', function() {
    var nav = html5.createElement('nav'),
        reUnclonable = /^<:/;

    equal(nav.nodeName.toLowerCase(), 'nav', 'element created');
    ok(!reUnclonable.test(nav.outerHTML), 'element created without IE < 9 cloneNode bug');
    executeInIframe('html5.createElement(doc,"nav")', function(nav) {
      ok(nav.nodeName.toLowerCase() == 'nav' && !reUnclonable.test(nav.outerHTML) && nav.ownerDocument != document, 'element created in iframe');
    });
  });

  test('html5.createDocumentFragment', function() {
    equal(html5.createDocumentFragment().nodeType, 11, 'fragment created');
    executeInIframe('html5.createDocumentFragment(doc)', function(frag) {
      ok(frag.nodeType == 11 && frag.ownerDocument != document, 'fragment created in iframe');
    });
  });

  test('html.install / html5.uninstall', function() {
    var support = html5.support;
    var sheets = document.getElementsByTagName('style');
    var sheetCount = sheets.length;

    executeInIframe('html5.install(doc)<\/script><div><nav></nav></div><script>doc.result=doc.getElementsByTagName("div")[0]', function(div) {
      ok(div.childNodes.length == 1, 'basic HTML5 element parsing');
    })

    each(['string', 'object'], function(optionType) {
      html5.install(optionType == 'string' ? 'methods styles' : { 'methods': true, 'styles': true });

      if (support.unknownElements) {
        skipTest(4);
      }
      else {
        ok(!isNative(document, 'createElement') &&
           !isNative(document, 'createDocumentFragment'), 'native methods overwritten with ' + optionType + ' options');

        html5.uninstall(optionType == 'string' ? 'methods' : { 'methods': true });

        ok(isNative(document, 'createElement') &&
           isNative(document, 'createDocumentFragment'), 'native methods restored with ' + optionType + ' options');

        executeInIframe('html5.install(doc,' + (optionType == 'string' ? '"methods")' : '{"methods":true})'), function(document) {
          ok(!isNative(document, 'createElement') &&
             !isNative(document, 'createDocumentFragment'), 'native methods overwritten in iframe with ' + optionType + ' options');
        });

        executeInIframe('html5.uninstall(html5.install(doc,' + (optionType == 'string' ? '"methods"),"methods")' : '{"methods":true}),{"methods":true})'), function(document) {
          ok(isNative(document, 'createElement') &&
             isNative(document, 'createDocumentFragment'), 'native methods restored in iframe with ' + optionType + ' options');
        });
      }

      if (support.html5Styles) {
        skipTest(4);
      }
      else {
        ok(sheetCount < sheets.length, 'style sheet added with ' + optionType + ' options');
        html5.uninstall(optionType == 'string' ? 'styles' : { 'styles': true });
        ok(sheetCount == sheets.length, 'style sheet removed with ' + optionType + ' options');

        executeInIframe('[doc.styleSheets.length,html5.install(doc,' + (optionType == 'string' ? '"styles"' : '{"styles":true}') + ').styleSheets.length]', function(pair) {
          ok(pair[0] < pair[1], 'style sheet added in iframe with ' + optionType + ' options');
        });

        executeInIframe('[doc.styleSheets.length,html5.uninstall(html5.install(doc,' + (optionType == 'string' ? '"styles"),"styles"' : '{"styles":true}),{"styles":true}') + ').styleSheets.length]', function(pair) {
          ok(pair[0] === pair[1], 'style sheet removed in iframe with ' + optionType + ' options');
        });
      }
    });
  });

}(this));