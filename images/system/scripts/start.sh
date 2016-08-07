#!/bin/sh
set -e

if [ -n "${DOCKER_HOST}" ]; then
    echo "export DOCKER_HOST=${DOCKER_HOST}" > /etc/profile.d/cron.sh
fi

if [ -n "${TZ}" ]; then
    INFO="/usr/share/zoneinfo/${TZ}"
    if [ -f "${INFO}" ]; then
        cp "${INFO}" /etc/localtime
        echo "${TZ}" > /etc/timezone
    fi
fi

crond -L /var/log/crond.log
exec "$@"
