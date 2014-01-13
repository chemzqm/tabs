/*global describe,it*/

var Tabs = require('tabs');
var parentNode = document.createElement('div');
var assert = require('assert');
var domify = require('domify');
var create = require('create-event');

describe('Tabs', function() {
  describe('Tabs()', function() {
    it('should initial the tab', function() {
      var tabs = new Tabs(parentNode);
      var nodes = parentNode.childNodes;
      assert(nodes[0].classList.contains('tabs-header'));
      assert(nodes[1].classList.contains('tabs-body'));
      tabs.remove();
    })
  })

  describe('#add()', function() {
    it('should create a new tab', function() {
      var tabs = new Tabs(parentNode);
      var nodes = parentNode.childNodes;
      tabs.add('new tab', '<div>content</div>');
      var tab = tabs.header.childNodes[0];
      var body = tabs.body.childNodes[0];
      assert(tab !== null);
      assert(body !== null);
      assert(tab.classList.contains('active'));
      assert(body.classList.contains('hide') === false);
      tabs.remove();
    })
  })

  describe('#active()', function() {
    it('should active a tab by element', function() {
      var tabs = new Tabs(parentNode);
      var body = domify('<div>content</div>');
      var obody = domify('<div>content of other tab</div>');
      tabs.add('<span class="tab">one tab</span>', body);
      tabs.add('other tab', obody);
      var tab = tabs.header.childNodes[0];
      tabs.active(tab);
      assert(tab.classList.contains('active'));
      assert(obody.classList.contains('hide'));
      tabs.remove();
    })

    it('should active a tab by query selector', function() {
      var tabs = new Tabs(parentNode);
      var body = domify('<div>content</div>');
      var obody = domify('<div>content of other tab</div>');
      tabs.add('one tab', body);
      tabs.add('other tab', obody);
      var tab = tabs.header.childNodes[0];
      tabs.active(':first-child');
      assert(tab.classList.contains('active'));
      assert(obody.classList.contains('hide'));
      tabs.remove();
    })
  })

  describe('close', function() {
    it('should be closable', function() {
      var tabs = new Tabs(parentNode);
      tabs.closable();
      tabs.add('tab', '<div>body</div>');
      var called;
      tabs.on('empty', function() {
        called = true;
      })
      var e = create('click');
      var a = tabs.header.querySelector('.close');
      Object.defineProperty(e, 'target', {
        get: function () { return a; }
      });
      tabs.onclick(e);
      assert(called === true);
      assert(tabs.header.childNodes.length === 0);
      assert(tabs.body.childNodes.length === 0);
      tabs.remove();
    })
  })

})

