FROM docker:1.12.0
MAINTAINER ototadana@gmail.com

RUN apk add --no-cache busybox-suid nodejs tzdata
RUN npm install -g uuid

COPY ./package.json /ui/
RUN cd /ui/ && npm install

ENTRYPOINT ["/bin/sh", "/scripts/start.sh"]
WORKDIR /ui
CMD ["node", "./server.js"]

COPY ./ui/. /ui/
RUN cd /ui/ && ./node_modules/.bin/gulp

COPY ./scripts/. /scripts/
