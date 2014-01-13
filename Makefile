
build: components index.js tabs.css
	@component-build

components: component.json
	@component-install

test:
	@component test phantom

test-browser:
	@component test browser

clean:
	rm -rf components build

.PHONY: clean test test-browser
