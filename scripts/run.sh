#!/bin/sh
# Portable shell entrypoint. Only Node.js is required; no package install in the project.
set -eu
toolkit_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
exec node "$toolkit_dir/lib/runtime.mjs" "$@"
