'use strict';
var LdapClient = require('promised-ldap');
var fs = require('fs');
var path = require('path');
var spawn = require('co-child-process');

var executeScript = function*(args) {
  return yield spawn('/bin/sh', args, {stdio: 'inherit'});
};

var bind = function*(cn, userPassword) {
  var dn = 'cn=' + cn + ',' + process.env.LDAP_BASE_DN;
  var client = new LdapClient({url: process.env.LDAP_URL});
  try {
    yield client.bind(dn, userPassword);
    yield client.unbind();
  } catch(e) {
    var error = new Error();
    error.status = 401;
    throw error;
  }
};

var getCommand = function(jobName) {
  return "/scripts/execute-script.sh ./" + jobName;
};

var getScriptPath = function(userName) {
  return path.join('/home', userName, 'scripts');
};

var getTimeAndDate = function*(userName, jobName) {
  var timeAndDate = yield spawn('/bin/sh', ['/scripts/get-time-and-date.sh', userName, jobName]);
  if(timeAndDate) {
    timeAndDate = timeAndDate.trim();
  }
  return timeAndDate;
};

var isValidJobName = function(name) {
  return name && name.match(/^[0-9a-zA-Z_\-\.]+$/);
};

var isValidScript = function(script) {
  return script && script.trim().length > 0;
};

var isValidTimeAndDate = function(timeAndDate) {
  return timeAndDate && timeAndDate.match(/^((\d{1,2}|\*)\s){4}(\d{1,2}|\*)$/);
};

var saveScript = function*(userName, jobName, script) {
  var file = path.join(getScriptPath(userName), jobName);
  fs.writeFileSync(file, script, 'utf8');
  yield executeScript(['/scripts/chown-script.sh', userName, file]);
};

var saveCrontab = function*(userName, jobName, timeAndDate) {
  yield executeScript(['/scripts/save-crontab.sh', userName, jobName, timeAndDate]);
};

var saveJob = function*(body, response) {
  var job = body.job;
  if(!isValidJobName(job.jobName) || 
      !isValidScript(job.script) || 
      !isValidTimeAndDate(job.timeAndDate)) {
    response.status = 400;
  }
  yield saveScript(body.userName, job.jobName, job.script);
  yield saveCrontab(body.userName, job.jobName, job.timeAndDate);
};

var removeScript = function(userName, jobName) {
  var file = path.join(getScriptPath(userName), jobName);
  try {
    fs.unlinkSync(file);
  } catch(e) {
    console.log('removeScript: ' + userName + ':' + jobName + ':' + e);
  }
};

var removeCrontab = function*(userName, jobName) {
  yield executeScript(['/scripts/remove-crontab.sh', userName, jobName]);
};

var removeJob = function*(body) {
  var job = body.job;
  removeScript(body.userName, job.jobName);
  yield removeCrontab(body.userName, job.jobName);
};

var searchJobs = function*(body) {
  var userName = body.userName;
  var scriptPath = getScriptPath(userName);
  var files = fs.readdirSync(scriptPath);
  var jobs = [];
  var key = (body.key)? new RegExp('^' + body.key) : null;
  var max = 10;

  for(var i = 0; i < files.length; i++) {
    var name = files[i];
    if(!key || name.match(key)) {
      jobs.push({
        jobName: name,
        timeAndDate: yield getTimeAndDate(userName, name),
        script: fs.readFileSync(path.join(scriptPath, name), 'utf8')
      });

      if(jobs.length === max) {
        break;
      }
    }
  }

  return {
    jobs: jobs,
    unique: (key && jobs.length === 0 && isValidJobName(body.key))
  };
};

var execute = function*(http, func) {
  var body = http.request.body;
  if(process.env.AUTH_TYPE !== 'NO_AUTH') {
    yield bind(body.userName, body.userPassword);
  }
  yield executeScript(['/scripts/create-user.sh', body.userName]);
  return yield func(body, http.response);
};

module.exports.search = function*() {
  this.body = yield execute(this, searchJobs);
};

module.exports.login = function*() {
  this.body = yield execute(this, function*(){
    return {result: 'OK'};
  });
};

module.exports.save = function*() {
  console.log(this.response);
  this.body = yield execute(this, saveJob);
};

module.exports.remove = function*() {
  this.body = yield execute(this, removeJob);
};
