
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
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("yields-delay/index.js", function(exports, require, module){

/**
 * timeoutid
 */

var tid;

/**
 * Delay the given `fn` with `ms`.
 * 
 * @param {Number} ms
 * @param {Function} fn
 */

module.exports = function(ms, fn){
  return function(){
    if (tid) clearTimeout(tid);
    var args = arguments;
    tid = setTimeout(function(){
      clearTimeout(tid);
      fn.apply(null, args);
    }, ms);
  };
};

});
require.register("yields-indexof/index.js", function(exports, require, module){

/**
 * indexof
 */

var indexof = [].indexOf;

/**
 * Get the index of the given `el`.
 *
 * @param {Element} el
 * @return {Number}
 */

module.exports = function(el){
  if (!el.parentNode) return -1;

  var list = el.parentNode.children
    , len = list.length;

  if (indexof) return indexof.call(list, el);
  for (var i = 0; i < len; ++i) {
    if (el == list[i]) return i;
  }
  return -1;
};

});
require.register("chemzqm-sortable/index.js", function(exports, require, module){
/**
 * dependencies
 */

var matches = require('matches-selector')
  , emitter = require('emitter')
  , classes = require('classes')
  , events = require('events')
  , indexof = require('indexof')
  , closest = require('closest')
  , delay = require('delay');

var styles = window.getComputedStyle;
/**
 * export `Sortable`
 */

module.exports = Sortable;

/**
 * Initialize `Sortable` with `el`.
 *
 * @param {Element} el
 */

function Sortable(el){
  if (!(this instanceof Sortable)) return new Sortable(el);
  if (!el) throw new TypeError('sortable(): expects an element');
  this.events = events(el, this);
  this.el = el;
}

/**
 * Mixins.
 */

emitter(Sortable.prototype);

/**
 * Ignore items that don't match `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.ignore = function(selector){
  this.ignored = selector;
  return this;
}

/**
 * Set the max item count of this sortable
 *
 * @param {String} count
 * @api public
 */
Sortable.prototype.max = function(count){
  this.maxCount = count;
  return this;
}

/**
 * Set handle to `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.handle = function(selector){
  this._handle = selector;
  return this;
}

Sortable.prototype.bind = function (selector){
  this.selector = selector || '';
  this.events.bind('mousedown');
  this.events.bind('mouseup');
}

Sortable.prototype.onmousedown = function(e) {
  if (this._handle) {
    this.match = matches(e.target, this._handle);
  }
  this.reset();
  this.draggable = closest(e.target, this.selector, true, this.el);
  if (!this.draggable) return;
  this.draggable.draggable = true;
  this.bindEvents();
  this.clone = this.draggable.cloneNode(false);
  classes(this.clone).add('sortable-placeholder');
  var h = styles(this.draggable).height;
  var w = styles(this.draggable).width;
  this.clone.style.height = h;
  this.clone.style.width = w;
  return this;
}

Sortable.prototype.bindEvents = function() {
  this.events.bind('dragstart');
  this.events.bind('dragover');
  this.events.bind('dragenter');
  this.events.bind('dragend');
  this.events.bind('drop');
}

Sortable.prototype.onmouseup = function(e) {
  this.reset();
}

Sortable.prototype.remove = function() {
  this.events.unbind();
  this.off();
}


/**
 * on-dragstart
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragstart = function(e){
  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();
  if (this._handle && !this.match) return e.preventDefault();
  var target = this.draggable;
  this.display = window.getComputedStyle(target).display;
  this.i = indexof(target);
  e.dataTransfer.setData('text', ' ');
  e.dataTransfer.effectAllowed = 'move';
  classes(target).add('dragging');
  this.emit('start', e);
}

/**
 * on-dragover
 * on-dragenter
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragenter =
Sortable.prototype.ondragover = function(e){
  var el = e.target
    , next
    , ci
    , i;

  e.preventDefault();
  var len = this.el.querySelectorAll(this.selector).length;
  if (
    this.connected &&
    !contains(this.el, this.clone) &&
    len == this.maxCount){
    this.emitMax = this.emitMax || delay(200, function() {
      this.emit('max', this.maxCount);
    }.bind(this));
    this.emitMax();
    return;
  }
  //empty target
  if (this.connected && len === 0) {
    return this.el.appendChild(this.clone);
  }
  if (!this.draggable || el == this.el) return;
  e.dataTransfer.dropEffect = 'move';
  this.draggable.style.display = 'none';
  // parent
  while (el && el.parentElement != this.el) el = el.parentElement;
  next = el;
  ci = indexof(this.clone);
  i = indexof(el);
  if (ci < i) next = el.nextElementSibling;
  if (this.ignored && matches(el, this.ignored)) return;
  this.el.insertBefore(this.clone, next);
}


/**
 * on-dragend
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragend = function(e){
  if (!this.draggable) return;
  if (this.clone) this.clone.parentNode.removeChild(this.clone);
  this.draggable.style.display = this.display;
  classes(this.draggable).remove('dragging');
  if (this.connected || this.i != indexof(this.draggable)) {
    this.emit('update', this.draggable);
  }
  this.reset();
  this.emit('end');
}

/**
 * on-drop
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondrop = function(e){
  var p = this.clone.parentNode;
  if (p && p == this.el) {
    this.el.insertBefore(this.draggable, this.clone);
  }
  this.ondragend(e);
  this.emit('drop', e);
}

/**
 * Reset sortable.
 *
 * @api private
 * @return {Sortable}
 * @api private
 */

Sortable.prototype.reset = function(){
  if (this.draggable) {
    this.draggable.draggable = '';
    this.draggable = null;
  }
  this.display = null;
  this.i = null;
  this.draggable = null;
  this.clone = null;
  this.connected = false;
  this.events.unbind('dragstart');
  this.events.unbind('dragover');
  this.events.unbind('dragenter');
  this.events.unbind('dragend');
  this.events.unbind('drop');
}

/**
* Connect the given `sortable`.
*
* once connected you can drag elements from
* the given sortable to this sortable.
*
* Example:
*
*      one <> two
*
*      one
*      .connect(two)
*      .connect(one);
*
*      two > one
*
*      one
*      .connect(two)
*
*      one > two > three
*
*      three
*      .connect(two)
*      .connect(one);
*
* @param {Sortable} sortable
* @return {Sortable} the given sortable.
* @api public
*/
Sortable.prototype.connect = function(sortable) {
  var self = this;
  this.on('update', function(el) {
    if (this.connected) {
      sortable.emit('update', el);
    }
  })
  this.on('drop', function() {
    sortable.reset();
  })
  sortable.on('end', function () {
    self.reset();
  });

  return sortable.on('start', function(){
    self.connected = true;
    self.bindEvents();
    self.draggable = sortable.draggable;
    self.clone = sortable.clone;
    self.display = sortable.display;
    self.i = sortable.i;
  });
}

/**
 * Check if parent node contains node.
 *
 * @param {String} parent
 * @param {String} node
 * @api public
 */
function contains (parent, node) {
  do {
    node = node.parentNode;
    if (node == parent) {
      return true;
    }
  } while (node && node.parentNode);
  return false;
}


});
require.register("tabs/index.js", function(exports, require, module){
/*!
 *
 * tabs
 *
 * MIT licence
 *
 */

var Emitter = require('emitter')
var Sortable = require('sortable');
var domify = require('domify');
var events = require ('event');
var classes = require ('classes');
var slice = Array.prototype.slice;

/**
 * Exports.
 */

module.exports = Tabs;

/**
 * Init the dom structor with parent node.
 *
 * @param {Element} parent
 * @api public
 */
function Tabs (parent) {
  if(! this instanceof Tabs) return new Tabs(parent);
  var header = this.header = domify('<ul class="tabs-header"></ul>');
  var body = this.body = domify('<div class="tabs-body"></div>');
  parent.appendChild(header);
  parent.appendChild(body);
  this._onclick = this.onclick.bind(this);
  events.bind(this.header, 'click', this._onclick);
}

Emitter(Tabs.prototype);

/**
 * Destroy all the tabs
 * @api public
 */
Tabs.prototype.remove = function() {
  events.unbind(this.header, 'click', this._onclick);
  this.body.parentNode.removeChild(this.body);
  this.header.parentNode.removeChild(this.header);
}

/**
 * Make tabs closable
 *
 * @api public
 */
Tabs.prototype.closable = function() {
  this._closable = true;
  return this;
}

/**
 * Make tabs sortable
 * @api public
 */
Tabs.prototype.sortable = function() {
  var sortable = Sortable(this.header)
  sortable.bind('li');
  sortable.on('update', function() {
    var lis = this.header.childNodes;
    this.emit('sort', slice.call(lis));
  }.bind(this));
  return this;
}

/**
 * Add tab with `title` string and related dom node
 *
 * @param {String} title
 * @param {Element} node
 * @api public
 */
Tabs.prototype.add = function(title, node) {
  var tab = domify('<li>' + title + '</li>');
  this.header.appendChild(tab);
  if (this._closable) {
    var close = domify('<a href="#" class="close">×</a>');
    tab.appendChild(close);
  }
  tab.__target = node;
  this.body.appendChild(node);
  this.active(tab);
  return this;
}

/**
 * Active a tab by selector or tab element
 * @param {String|Element} el
 * @api public
 */
Tabs.prototype.active = function(el) {
  if (typeof el === 'string') {
    el = this.header.querySelector(el);
  }
  if (el === this._active) return;
  var lis = this.header.childNodes;
  for (var i = 0; i < lis.length; i++) {
    classes(lis[i]).remove('active');
  }
  classes(el).add('active');
  var nodes = this.body.childNodes;
  for ( i = 0; i < nodes.length; i++) {
    classes(nodes[i]).add('hide');
  }
  classes(el.__target).remove('hide');
  this._active = el;
  this.emit('active', el);
}

/**
 * 
 * @param {Event} e
 * @api private
 */
Tabs.prototype.onclick = function(e) {
  var el = e.target;
  e.preventDefault();
  e.stopPropagation();
  if (classes(el).has('close')) {
    var li = el.parentNode;
    var prev = li.previousSibling;
    var next = li.nextSibling;
    var target = li.__target;
    target.parentNode.removeChild(target);
    li.parentNode.removeChild(li);
    if (this._active !== li) return;
    if (prev) return this.active(prev);
    if (next) return this.active(next);
    this.emit('empty');
  }
  else if (el.parentNode === this.header) {
    this.active(el);
  }
}

});


















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