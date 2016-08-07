#!/bin/sh
set -e

TIMEOUT=300
LOG_DIR=~/logs/`date -I | sed 's|-|/|g'`/$1
TMP_DIR=~/tmp
mkdir -p "${LOG_DIR}"

if [ -d "${TMP_DIR}" ]; then
  rm -fr "${TMP_DIR}"
fi
mkdir -p "${TMP_DIR}"

cd ~/scripts
cp ~/scripts/* "${TMP_DIR}"
chmod 777 "${TMP_DIR}"/*

set +e
VOLUME=`docker volume create`
CONTAINER_NAME=`/scripts/uuid.sh`
docker run -v "${VOLUME}":/scripts/. --name "${CONTAINER_NAME}" xpfriend/cronue-sandbox:latest /bin/true
docker cp "${TMP_DIR}"/. "${CONTAINER_NAME}":/scripts
docker rm "${CONTAINER_NAME}"

echo "----" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
echo "Date: `date`" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
echo "Exec: $*" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
echo "--"  | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
docker run -w /scripts -v "${VOLUME}":/scripts --rm xpfriend/cronue-sandbox:latest timeout -t "${TIMEOUT}" -s KILL $* 1>>"${LOG_DIR}"/stdout.txt 2>>"${LOG_DIR}"/stderr.txt
echo "-" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
echo "Exit: $?" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt
echo "" | tee -a "${LOG_DIR}"/stdout.txt >>"${LOG_DIR}"/stderr.txt

docker volume rm "${VOLUME}"
