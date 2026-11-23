.PHONY: setup check test audit dist-check resume map sync-main
setup:
	npm ci --ignore-scripts
check:
	npm run check
test:
	npm test
audit:
	npm run audit:deps
dist-check:
	npm run pack:check
resume:
	node bin/agent-skills.mjs context resume
map:
	node bin/agent-skills.mjs context map
sync-main:
	node bin/agent-skills.mjs git-sync sync
