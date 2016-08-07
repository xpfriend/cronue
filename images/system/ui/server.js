'use strict';
var koa = require('koa');

var logger = require('koa-logger');
var serve = require('koa-static');
var router = require('koa-router')();
var scheduler = require('./controllers/scheduler');
var bodyParser = require('koa-body-parser');

var app = module.exports = koa();

router
  .post('/search', scheduler.search)
  .post('/login', scheduler.login)
  .post('/save', scheduler.save)
  .post('/remove', scheduler.remove);

app
  .use(logger())
  .use(bodyParser())
  .use(serve('public'))
  .use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(process.env.USER_APP_PORT || 9899);
}
