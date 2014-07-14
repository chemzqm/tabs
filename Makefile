
build: components index.js tabs.css
	@component-build --dev

components: component.json
	@component-install --dev

test:
	@component test phantom

test-browser:
	@component test browser

doc:
	@component build
	@rm -fr .gh-pages
	@mkdir .gh-pages
	@mv build .gh-pages/
	@cp index.html .gh-pages/index.html
	@ghp-import .gh-pages -n -p
	@rm -fr .gh-pages

clean:
	rm -rf components build

.PHONY: clean test test-browser
