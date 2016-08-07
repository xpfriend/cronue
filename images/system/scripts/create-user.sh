#!/bin/sh

USER_NAME="$1"
USER_HOME="/home/${USER_NAME}"
USER_SCRIPTS="${USER_HOME}/scripts"

if [ `grep -E "^${USER_NAME}:" /etc/passwd | wc -l` -eq 1 ]; then
    exit
fi

adduser -h "${USER_HOME}" -s /bin/sh -D "${USER_NAME}"
chmod 700 ${USER_HOME}

if [ ! -d "${USER_SCRIPTS}" ]; then
    mkdir "${USER_SCRIPTS}"
    chown "${USER_NAME}":"${USER_NAME}" "${USER_SCRIPTS}"
fi
