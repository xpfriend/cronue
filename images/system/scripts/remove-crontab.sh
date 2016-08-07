#!/bin/sh
set -e

USER="$1"
JOB="$2"

FILE=/var/spool/cron/crontabs/"${USER}"
TEMP_FILE=/tmp/"${USER}"

if [ -f "${FILE}" ]; then
    cp "${FILE}" "${TEMP_FILE}"
else
    exit
fi

if [ `grep -E "\./${JOB}$" "${TEMP_FILE}" | wc -l` -eq 0 ]; then
    rm "${TEMP_FILE}"
    exit
fi

sed -E "/\.\/${JOB}$/d" -i "${TEMP_FILE}"

chmod og+r "${TEMP_FILE}"
crontab -u "${USER}" "${TEMP_FILE}"
rm "${TEMP_FILE}"
