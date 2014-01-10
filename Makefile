
build: components index.js tabs.css
	@component-build

components: component.json
	@component-install

clean:
	rm -rf components build

.PHONY: clean
