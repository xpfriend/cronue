#!/bin/sh
set -ex

BASE_DIR=$(cd $(dirname $0); pwd)

build_image() {
  cd ${BASE_DIR}/images/$1
  docker build -t xpfriend/cronue-$1:latest .
}

build_image sandbox
build_image system
