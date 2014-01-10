
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var events = require('event');\n\
var delegate = require('delegate');\n\
\n\
/**\n\
 * Expose `Events`.\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
/**\n\
 * Initialize an `Events` with the given\n\
 * `el` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} el\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function Events(el, obj) {\n\
  if (!(this instanceof Events)) return new Events(el, obj);\n\
  if (!el) throw new Error('element required');\n\
  if (!obj) throw new Error('object required');\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this._events = {};\n\
}\n\
\n\
/**\n\
 * Subscription helper.\n\
 */\n\
\n\
Events.prototype.sub = function(event, method, cb){\n\
  this._events[event] = this._events[event] || {};\n\
  this._events[event][method] = cb;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Direct event handling:\n\
 *\n\
 *    events.bind('click') // implies \"onclick\"\n\
 *    events.bind('click', 'remove')\n\
 *    events.bind('click', 'sort', 'asc')\n\
 *\n\
 *  Delegated event handling:\n\
 *\n\
 *    events.bind('click li > a')\n\
 *    events.bind('click li > a', 'remove')\n\
 *    events.bind('click a.sort-ascending', 'sort', 'asc')\n\
 *    events.bind('click a.sort-descending', 'sort', 'desc')\n\
 *\n\
 * @param {String} event\n\
 * @param {String|function} [method]\n\
 * @return {Function} callback\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.bind = function(event, method){\n\
  var e = parse(event);\n\
  var el = this.el;\n\
  var obj = this.obj;\n\
  var name = e.name;\n\
  var method = method || 'on' + name;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function cb(){\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // bind\n\
  if (e.selector) {\n\
    cb = delegate.bind(el, e.selector, name, cb);\n\
  } else {\n\
    events.bind(el, name, cb);\n\
  }\n\
\n\
  // subscription for unbinding\n\
  this.sub(name, method, cb);\n\
\n\
  return cb;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Unbind direct handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * Unbind delegate handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * @param {String|Function} [event]\n\
 * @param {String|Function} [method]\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
\n\
  // no bindings for this event\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  // no bindings for this method\n\
  var cb = bindings[method];\n\
  if (!cb) return;\n\
\n\
  events.unbind(this.el, event, cb);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAll = function(){\n\
  for (var event in this._events) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAllOf = function(event){\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(event) {\n\
  var parts = event.split(/ +/);\n\
  return {\n\
    name: parts.shift(),\n\
    selector: parts.join(' ')\n\
  }\n\
}\n\
//@ sourceURL=component-events/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? {parentNode: element} : element\n\
\n\
  root = root || document\n\
\n\
  // Make sure `element !== document` and `element != null`\n\
  // otherwise we get an illegal invocation\n\
  while ((element = element.parentNode) && element !== document) {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return  \n\
  }\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("yields-delay/index.js", Function("exports, require, module",
"\n\
/**\n\
 * timeoutid\n\
 */\n\
\n\
var tid;\n\
\n\
/**\n\
 * Delay the given `fn` with `ms`.\n\
 * \n\
 * @param {Number} ms\n\
 * @param {Function} fn\n\
 */\n\
\n\
module.exports = function(ms, fn){\n\
  return function(){\n\
    if (tid) clearTimeout(tid);\n\
    var args = arguments;\n\
    tid = setTimeout(function(){\n\
      clearTimeout(tid);\n\
      fn.apply(null, args);\n\
    }, ms);\n\
  };\n\
};\n\
//@ sourceURL=yields-delay/index.js"
));
require.register("yields-indexof/index.js", Function("exports, require, module",
"\n\
/**\n\
 * indexof\n\
 */\n\
\n\
var indexof = [].indexOf;\n\
\n\
/**\n\
 * Get the index of the given `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Number}\n\
 */\n\
\n\
module.exports = function(el){\n\
  if (!el.parentNode) return -1;\n\
\n\
  var list = el.parentNode.children\n\
    , len = list.length;\n\
\n\
  if (indexof) return indexof.call(list, el);\n\
  for (var i = 0; i < len; ++i) {\n\
    if (el == list[i]) return i;\n\
  }\n\
  return -1;\n\
};\n\
//@ sourceURL=yields-indexof/index.js"
));
require.register("chemzqm-sortable/index.js", Function("exports, require, module",
"/**\n\
 * dependencies\n\
 */\n\
\n\
var matches = require('matches-selector')\n\
  , emitter = require('emitter')\n\
  , classes = require('classes')\n\
  , events = require('events')\n\
  , indexof = require('indexof')\n\
  , closest = require('closest')\n\
  , delay = require('delay');\n\
\n\
var styles = window.getComputedStyle;\n\
/**\n\
 * export `Sortable`\n\
 */\n\
\n\
module.exports = Sortable;\n\
\n\
/**\n\
 * Initialize `Sortable` with `el`.\n\
 *\n\
 * @param {Element} el\n\
 */\n\
\n\
function Sortable(el){\n\
  if (!(this instanceof Sortable)) return new Sortable(el);\n\
  if (!el) throw new TypeError('sortable(): expects an element');\n\
  this.events = events(el, this);\n\
  this.el = el;\n\
}\n\
\n\
/**\n\
 * Mixins.\n\
 */\n\
\n\
emitter(Sortable.prototype);\n\
\n\
/**\n\
 * Ignore items that don't match `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {Sortable}\n\
 * @api public\n\
 */\n\
\n\
Sortable.prototype.ignore = function(selector){\n\
  this.ignored = selector;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set the max item count of this sortable\n\
 *\n\
 * @param {String} count\n\
 * @api public\n\
 */\n\
Sortable.prototype.max = function(count){\n\
  this.maxCount = count;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set handle to `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {Sortable}\n\
 * @api public\n\
 */\n\
\n\
Sortable.prototype.handle = function(selector){\n\
  this._handle = selector;\n\
  return this;\n\
}\n\
\n\
Sortable.prototype.bind = function (selector){\n\
  this.selector = selector || '';\n\
  this.events.bind('mousedown');\n\
  this.events.bind('mouseup');\n\
}\n\
\n\
Sortable.prototype.onmousedown = function(e) {\n\
  if (this._handle) {\n\
    this.match = matches(e.target, this._handle);\n\
  }\n\
  this.reset();\n\
  this.draggable = closest(e.target, this.selector, true, this.el);\n\
  if (!this.draggable) return;\n\
  this.draggable.draggable = true;\n\
  this.bindEvents();\n\
  this.clone = this.draggable.cloneNode(false);\n\
  classes(this.clone).add('sortable-placeholder');\n\
  var h = styles(this.draggable).height;\n\
  var w = styles(this.draggable).width;\n\
  this.clone.style.height = h;\n\
  this.clone.style.width = w;\n\
  return this;\n\
}\n\
\n\
Sortable.prototype.bindEvents = function() {\n\
  this.events.bind('dragstart');\n\
  this.events.bind('dragover');\n\
  this.events.bind('dragenter');\n\
  this.events.bind('dragend');\n\
  this.events.bind('drop');\n\
}\n\
\n\
Sortable.prototype.onmouseup = function(e) {\n\
  this.reset();\n\
}\n\
\n\
Sortable.prototype.remove = function() {\n\
  this.events.unbind();\n\
  this.off();\n\
}\n\
\n\
\n\
/**\n\
 * on-dragstart\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
Sortable.prototype.ondragstart = function(e){\n\
  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();\n\
  if (this._handle && !this.match) return e.preventDefault();\n\
  var target = this.draggable;\n\
  this.display = window.getComputedStyle(target).display;\n\
  this.i = indexof(target);\n\
  e.dataTransfer.setData('text', ' ');\n\
  e.dataTransfer.effectAllowed = 'move';\n\
  classes(target).add('dragging');\n\
  this.emit('start', e);\n\
}\n\
\n\
/**\n\
 * on-dragover\n\
 * on-dragenter\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
Sortable.prototype.ondragenter =\n\
Sortable.prototype.ondragover = function(e){\n\
  var el = e.target\n\
    , next\n\
    , ci\n\
    , i;\n\
\n\
  e.preventDefault();\n\
  var len = this.el.querySelectorAll(this.selector).length;\n\
  if (\n\
    this.connected &&\n\
    !contains(this.el, this.clone) &&\n\
    len == this.maxCount){\n\
    this.emitMax = this.emitMax || delay(200, function() {\n\
      this.emit('max', this.maxCount);\n\
    }.bind(this));\n\
    this.emitMax();\n\
    return;\n\
  }\n\
  //empty target\n\
  if (this.connected && len === 0) {\n\
    return this.el.appendChild(this.clone);\n\
  }\n\
  if (!this.draggable || el == this.el) return;\n\
  e.dataTransfer.dropEffect = 'move';\n\
  this.draggable.style.display = 'none';\n\
  // parent\n\
  while (el && el.parentElement != this.el) el = el.parentElement;\n\
  next = el;\n\
  ci = indexof(this.clone);\n\
  i = indexof(el);\n\
  if (ci < i) next = el.nextElementSibling;\n\
  if (this.ignored && matches(el, this.ignored)) return;\n\
  this.el.insertBefore(this.clone, next);\n\
}\n\
\n\
\n\
/**\n\
 * on-dragend\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
Sortable.prototype.ondragend = function(e){\n\
  if (!this.draggable) return;\n\
  if (this.clone) this.clone.parentNode.removeChild(this.clone);\n\
  this.draggable.style.display = this.display;\n\
  classes(this.draggable).remove('dragging');\n\
  if (this.connected || this.i != indexof(this.draggable)) {\n\
    this.emit('update', this.draggable);\n\
  }\n\
  this.reset();\n\
  this.emit('end');\n\
}\n\
\n\
/**\n\
 * on-drop\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
Sortable.prototype.ondrop = function(e){\n\
  var p = this.clone.parentNode;\n\
  if (p && p == this.el) {\n\
    this.el.insertBefore(this.draggable, this.clone);\n\
  }\n\
  this.ondragend(e);\n\
  this.emit('drop', e);\n\
}\n\
\n\
/**\n\
 * Reset sortable.\n\
 *\n\
 * @api private\n\
 * @return {Sortable}\n\
 * @api private\n\
 */\n\
\n\
Sortable.prototype.reset = function(){\n\
  if (this.draggable) {\n\
    this.draggable.draggable = '';\n\
    this.draggable = null;\n\
  }\n\
  this.display = null;\n\
  this.i = null;\n\
  this.draggable = null;\n\
  this.clone = null;\n\
  this.connected = false;\n\
  this.events.unbind('dragstart');\n\
  this.events.unbind('dragover');\n\
  this.events.unbind('dragenter');\n\
  this.events.unbind('dragend');\n\
  this.events.unbind('drop');\n\
}\n\
\n\
/**\n\
* Connect the given `sortable`.\n\
*\n\
* once connected you can drag elements from\n\
* the given sortable to this sortable.\n\
*\n\
* Example:\n\
*\n\
*      one <> two\n\
*\n\
*      one\n\
*      .connect(two)\n\
*      .connect(one);\n\
*\n\
*      two > one\n\
*\n\
*      one\n\
*      .connect(two)\n\
*\n\
*      one > two > three\n\
*\n\
*      three\n\
*      .connect(two)\n\
*      .connect(one);\n\
*\n\
* @param {Sortable} sortable\n\
* @return {Sortable} the given sortable.\n\
* @api public\n\
*/\n\
Sortable.prototype.connect = function(sortable) {\n\
  var self = this;\n\
  this.on('update', function(el) {\n\
    if (this.connected) {\n\
      sortable.emit('update', el);\n\
    }\n\
  })\n\
  this.on('drop', function() {\n\
    sortable.reset();\n\
  })\n\
  sortable.on('end', function () {\n\
    self.reset();\n\
  });\n\
\n\
  return sortable.on('start', function(){\n\
    self.connected = true;\n\
    self.bindEvents();\n\
    self.draggable = sortable.draggable;\n\
    self.clone = sortable.clone;\n\
    self.display = sortable.display;\n\
    self.i = sortable.i;\n\
  });\n\
}\n\
\n\
/**\n\
 * Check if parent node contains node.\n\
 *\n\
 * @param {String} parent\n\
 * @param {String} node\n\
 * @api public\n\
 */\n\
function contains (parent, node) {\n\
  do {\n\
    node = node.parentNode;\n\
    if (node == parent) {\n\
      return true;\n\
    }\n\
  } while (node && node.parentNode);\n\
  return false;\n\
}\n\
\n\
//@ sourceURL=chemzqm-sortable/index.js"
));
require.register("tabs/index.js", Function("exports, require, module",
"/*!\n\
 *\n\
 * tabs\n\
 *\n\
 * MIT licence\n\
 *\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
var Sortable = require('sortable');\n\
var domify = require('domify');\n\
var events = require ('event');\n\
var classes = require ('classes');\n\
var slice = Array.prototype.slice;\n\
\n\
/**\n\
 * Exports.\n\
 */\n\
\n\
module.exports = Tabs;\n\
\n\
/**\n\
 * Init the dom structor with parent node.\n\
 *\n\
 * @param {Element} parent\n\
 * @api public\n\
 */\n\
function Tabs (parent) {\n\
  if(! this instanceof Tabs) return new Tabs(parent);\n\
  var header = this.header = domify('<ul class=\"tabs-header\"></ul>');\n\
  var body = this.body = domify('<div class=\"tabs-body\"></div>');\n\
  parent.appendChild(header);\n\
  parent.appendChild(body);\n\
  this._onclick = this.onclick.bind(this);\n\
  events.bind(this.header, 'click', this._onclick);\n\
}\n\
\n\
Emitter(Tabs.prototype);\n\
\n\
/**\n\
 * Destroy all the tabs\n\
 * @api public\n\
 */\n\
Tabs.prototype.remove = function() {\n\
  events.unbind(this.header, 'click', this._onclick);\n\
  this.body.parentNode.removeChild(this.body);\n\
  this.header.parentNode.removeChild(this.header);\n\
}\n\
\n\
/**\n\
 * Make tabs closable\n\
 *\n\
 * @api public\n\
 */\n\
Tabs.prototype.closable = function() {\n\
  this._closable = true;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Make tabs sortable\n\
 * @api public\n\
 */\n\
Tabs.prototype.sortable = function() {\n\
  var sortable = Sortable(this.header)\n\
  sortable.bind('li');\n\
  sortable.on('update', function() {\n\
    var lis = this.header.childNodes;\n\
    this.emit('sort', slice.call(lis));\n\
  }.bind(this));\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Add tab with `title` string and related dom node\n\
 *\n\
 * @param {String} title\n\
 * @param {Element} node\n\
 * @api public\n\
 */\n\
Tabs.prototype.add = function(title, node) {\n\
  var tab = domify('<li>' + title + '</li>');\n\
  this.header.appendChild(tab);\n\
  if (this._closable) {\n\
    var close = domify('<a href=\"#\" class=\"close\">×</a>');\n\
    tab.appendChild(close);\n\
  }\n\
  tab.__target = node;\n\
  this.body.appendChild(node);\n\
  this.active(tab);\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Active a tab by selector or tab element\n\
 * @param {String|Element} el\n\
 * @api public\n\
 */\n\
Tabs.prototype.active = function(el) {\n\
  if (typeof el === 'string') {\n\
    el = this.header.querySelector(el);\n\
  }\n\
  if (el === this._active) return;\n\
  var lis = this.header.childNodes;\n\
  for (var i = 0; i < lis.length; i++) {\n\
    classes(lis[i]).remove('active');\n\
  }\n\
  classes(el).add('active');\n\
  var nodes = this.body.childNodes;\n\
  for ( i = 0; i < nodes.length; i++) {\n\
    classes(nodes[i]).add('hide');\n\
  }\n\
  classes(el.__target).remove('hide');\n\
  this._active = el;\n\
  this.emit('active', el);\n\
}\n\
\n\
/**\n\
 * \n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
Tabs.prototype.onclick = function(e) {\n\
  var el = e.target;\n\
  e.preventDefault();\n\
  e.stopPropagation();\n\
  if (classes(el).has('close')) {\n\
    var li = el.parentNode;\n\
    var prev = li.previousSibling;\n\
    var next = li.nextSibling;\n\
    var target = li.__target;\n\
    target.parentNode.removeChild(target);\n\
    li.parentNode.removeChild(li);\n\
    if (this._active !== li) return;\n\
    if (prev) return this.active(prev);\n\
    if (next) return this.active(next);\n\
    this.emit('empty');\n\
  }\n\
  else if (el.parentNode === this.header) {\n\
    this.active(el);\n\
  }\n\
}\n\
//@ sourceURL=tabs/index.js"
));


















require.alias("component-emitter/index.js", "tabs/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("component-domify/index.js", "tabs/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-classes/index.js", "tabs/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "tabs/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("chemzqm-sortable/index.js", "tabs/deps/sortable/index.js");
require.alias("chemzqm-sortable/index.js", "tabs/deps/sortable/index.js");
require.alias("chemzqm-sortable/index.js", "sortable/index.js");
require.alias("component-matches-selector/index.js", "chemzqm-sortable/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-emitter/index.js", "chemzqm-sortable/deps/emitter/index.js");

require.alias("component-events/index.js", "chemzqm-sortable/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-classes/index.js", "chemzqm-sortable/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("discore-closest/index.js", "chemzqm-sortable/deps/closest/index.js");
require.alias("discore-closest/index.js", "chemzqm-sortable/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("yields-delay/index.js", "chemzqm-sortable/deps/delay/index.js");

require.alias("yields-indexof/index.js", "chemzqm-sortable/deps/indexof/index.js");
require.alias("yields-indexof/index.js", "chemzqm-sortable/deps/indexof/index.js");
require.alias("yields-indexof/index.js", "yields-indexof/index.js");
require.alias("chemzqm-sortable/index.js", "chemzqm-sortable/index.js");