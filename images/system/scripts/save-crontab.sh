#!/bin/sh
set -e

USER="$1"
JOB="$2"
TIME_AND_DATE="$3"

FILE=/var/spool/cron/crontabs/"${USER}"
TEMP_FILE=/tmp/"${USER}"

if [ -f "${FILE}" ]; then
    cp "${FILE}" "${TEMP_FILE}"
else
    touch "${TEMP_FILE}"
fi

if [ `grep -E "\./${JOB}$" "${TEMP_FILE}" | wc -l` -eq 0 ]; then
    echo "${TIME_AND_DATE} /scripts/execute-script.sh ./${JOB}" >>"${TEMP_FILE}"
else
    sed -E "s|^([^ ]+ [^ ]+ [^ ]+ [^ ]+ [^ ]+) ([^ ]+) (\./${JOB})$|${TIME_AND_DATE} \2 \3|" -i "${TEMP_FILE}"
fi

chmod og+r "${TEMP_FILE}"
crontab -u "${USER}" "${TEMP_FILE}"
rm "${TEMP_FILE}"
