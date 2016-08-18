function app() {
  var self = {};

  riot.observable(self);

  self.jobs = [];
  self.account = {
    userName: '',
    userPassword: ''
  };

  var update = function(job, remove) {
    $.ajax({
      url: (remove)? '/remove' : '/save',
      type: 'POST',
      dataType: 'json',
      data: {
        job: job,
        userName: self.account.userName,
        userPassword: self.account.userPassword
      }
    }).done(function(data, textStatus){
      self.trigger('updated');
    });
  };

  self.remove = function(job) {
    update(job, true);
  };

  self.save = function(job) {
    update(job, false);
  };

  self.search = function(keyWord) {
    $.ajax({
      url: '/search',
      type: 'POST',
      dataType: 'json',
      data: {
        key: keyWord,
        userName: self.account.userName,
        userPassword: self.account.userPassword
      }
    }).done(function(data, textStatus){
      self.jobs = data.jobs;
      self.unique = data.unique;
      self.trigger('found');
    });
  };

  self.getLog = function(job) {
    $.ajax({
      url: '/log',
      type: 'POST',
      dataType: 'json',
      data: {
        job: job,
        userName: self.account.userName,
        userPassword: self.account.userPassword
      }
    }).done(function(data, textStatus){
      job.stdout = data.stdout;
      job.stderr = data.stderr;
      self.trigger('log_retrieved');
    });
  };

  self.login = function(userName, userPassword) {
    var account = {
      userName: userName,
      userPassword: userPassword
    };

    $.ajax({
      url: '/login',
      type: 'POST',
      dataType: 'json',
      data: account
    }).done(function(data, textStatus){
      self.account = account;
      self.trigger('authenticated');
    }).fail(function(){
      location.reload();
    });

  }

  return self;
}
