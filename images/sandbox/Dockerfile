FROM alpine:3.4
MAINTAINER ototadana@gmail.com

RUN apk add --no-cache bash curl jq mailx

RUN adduser -h /home/owner -u 60000 -s /bin/bash -D owner
USER owner
