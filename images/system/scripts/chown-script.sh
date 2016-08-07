#!/bin/sh
set -e

USER="$1"
FILE="$2"

chown "${USER}" "${FILE}"
