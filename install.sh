#!/bin/sh
set -eu
toolkit_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
command -v node >/dev/null 2>&1 || { echo "Node.js 22+ is required." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required." >&2; exit 1; }
(cd "$toolkit_dir" && npm ci --ignore-scripts --no-audit --no-fund)
exec node "$toolkit_dir/bin/agent-skills.mjs" install "$@"
