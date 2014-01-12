# tabs

[demo](http://chemzqm.github.io/tabs/test/)

Dynamic tabs component with add, remove and order support.

If you just want to convert tabs from static html, consider use [stagas/tabify](https://github.com/stagas/tabify).

## Install

    component install chemzqm/tabs

## Usage

```js
var Tabs = require('tabs')

var parent = document.getElementById('tabs');
var tabs = new Tabs(parent);
tabs.closable();
tabs.sortable();
var contents = document.querySelectorAll('.tabs');
for (var i = 0; i < contents.length; i++) {
  var title = contents[i].getAttribute('data-title');
  tabs.add(title, contents[i]);
}
```
## events

* `active` emitted with activated nav element
* `sort` emitted when the tabs get reordered
* `empty` emitted when all tabs removed

## API

### new Tabs(parent)

Init tabs inside parent node.

### .closable()

Add close icon to the tab navs to make the tabs closable.

### .sortable()

Make the tab navs sortable

### .add(title, node)

Add a tab with title string and associate dom node.

### .active(el | selector)

Active the tab by css query(querySelector inside) or tab element.

### .remove()

Destroy this tabs instance.

## License

The MIT License (MIT)

Copyright (c) 2013 Qiming Zhao <chemzqm@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
