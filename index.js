var Tabs = require('..');

var p = document.getElementById('tabs');
var tabs = new Tabs(p);
tabs.closable()
tabs.sortable();
var contents = document.querySelectorAll('.contents');
for (var i = 0; i < contents.length; i++) {
  var title = contents[i].getAttribute('data-title');
  tabs.add(title, contents[i]);
}
tabs.on('empty', function() {
  console.log('empty');
})
tabs.on('sort', function(lis) {
  console.log(lis);
})
tabs.on('active', function(el) {
  console.log(el);
})
var btn = document.getElementById('remove');
btn.addEventListener('click', function(){
  tabs.remove();
})
tabs.active(':first-child');
