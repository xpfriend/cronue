#!/bin/sh
set -e

cd /usr/lib
node -p 'require("uuid").v4()'
