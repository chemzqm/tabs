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
  node = (typeof node === 'string') ? domify(node) : node;
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
    if (this.body.childNodes.length === 0) return this.emit('empty');
    if (this._active !== li) return;
    if (prev) return this.active(prev);
    if (next) return this.active(next);
  }
  else if (el.parentNode === this.header) {
    this.active(el);
  }
}
