#!/bin/sh
set -e

USER="$1"
JOB="$2"

grep -E "\./${JOB}$" /var/spool/cron/crontabs/"${USER}" | sed -E 's|^([^ ]+ [^ ]+ [^ ]+ [^ ]+ [^ ]+)(.+)$|\1|'
