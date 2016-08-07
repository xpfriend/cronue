var gulp = require('gulp');
var eslint = require('gulp-eslint');
var nodemon = require('gulp-nodemon');
var remoteSrc = require('gulp-remote-src');

gulp.task('default', function() {
  remoteSrc('cron-ui.min.js', {
      base: 'https://raw.githubusercontent.com/snird/CronUI/master/dist/'
    })
    .pipe(gulp.dest("public/js"));

  gulp
    .src("node_modules/materialize-css/dist/**/*")
    .pipe(gulp.dest("public"));

  gulp
    .src(["node_modules/jquery/dist/*", "node_modules/riot/riot+compiler.min.js"])
    .pipe(gulp.dest("public/js"));

  gulp
    .src("node_modules/material-design-icons-iconfont/dist/**/*")
    .pipe(gulp.dest("public/icons"));

  gulp
    .src(['server.js', 'controllers/*.js'])
    .pipe(eslint({
      envs: ['node', 'es6'],
      extends: 'eslint:recommended',
      rules: {
        "eqeqeq": 2
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('serve', function () {
  nodemon({
    script: 'server.js',
    ext: 'js html css',
    env: { 
      'AUTH_TYPE': 'NO_AUTH'
    }
  })
})
