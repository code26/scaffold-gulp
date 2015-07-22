var gulp = require('gulp');

// Include Plugins
var $ = require('gulp-load-plugins')({
  camelize: true,
  pattern: [
    'gulp-*',
    'gulp.*',
    'glob',
    'del',
    'run-sequence',
    'main-bower-files'
  ],
  replaceString: /\bgulp[\-.]/
});

var appvars = {
  includes: ['**/*', '!./node_modules/**'],
  excludes: ['!./.*/', '!./_*/**', '!.*', '!*.rb', '!./node_modules/**', '!./sass/**', '!./js/source/**', '!package.json', '!gulpfile.js','!./bower_components/**', '!bower.json'],
  xfolders: ['./.*/', './_*', './node_modules', './sass','./bower_components'],
  css: 'css',
  js: 'js',
  dist: '../dist',
  cache: '_cache/',
  port: 41710,
  host: '0.0.0.0',
  bower: 'bower_components/'
};

var onError = function (err) {
  console.log(err);
};

function makeHashKey(file) {
  return [file.contents.toString('utf8')].join('');
}

// statics
gulp.task('statics', function () {
  return gulp.src(['*.html', '*.php'])
      .pipe($.connect.reload());
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
  var jsFiles = ['js/source/_*.js'];
  return gulp.src($.mainBowerFiles({
      filter:'**/*.js'
    }).concat(jsFiles))
      .pipe($.plumber(onError))
      //.pipe($.filter('*.js'))
      .pipe($.stripComments({
        block: true
      }))
      .pipe($.concat('scripts.js'))
      .pipe(gulp.dest('js'))
      .pipe($.size({
        showFiles: true
      }))
      .pipe($.rename('scripts.min.js'))
      .pipe($.uglify())
      .pipe($.size({
        showFiles: true
      }))
      .pipe(gulp.dest('js'))
      .pipe($.connect.reload())
});

// Concatenate & Minify CSS
gulp.task('styles', function () {
  gulp.src('sass/*.scss')
      .pipe($.sass({
        outputStyle: 'compressed'
        })
        .on('error', $.sass.logError))
      .pipe($.autoprefixer(["last 2 versions", "> 1%", "ie 9"], {
        cascade: true
      }))
      .pipe($.combineMediaQueries({
        //log: true
      }))
      .pipe($.size({
        showFiles: true
      }))
      .pipe(gulp.dest('css'))
      .pipe($.rename('style.min.css')) // create minified version
      .pipe($.csso())
      .pipe($.size({
        showFiles: true
      }))
      .pipe(gulp.dest('css'))
      .pipe($.connect.reload())
});

gulp.task('images', function () { //process files in /_img folder and move to /img
  return gulp.src('_img/**/*')
      .pipe($.cache($.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeEmptyAttrs: true}, {removeMetadata: true}],
      }), {
        fileCache: new $.cache.Cache({cacheDirName: appvars.cache}),
        key: makeHashKey,
      }))
      .pipe(gulp.dest('img'))
      .pipe($.connect.reload())
});

gulp.task('connect', function () {

  $.connect.server({
    root: require('path').resolve(''),
    host: appvars.host,
    port: appvars.port,
    livereload: true
  });

  require('opn')('http://' + appvars.host + ':' + appvars.port);
});

// Build
gulp.task('build', ['statics', 'styles', 'scripts', 'images']);

gulp.task('deploy', function () {
  $.runSequence('prep:safe', 'cleandist', function(){
    console.log('\x1b[32m%s\x1b[0m','Tasks completed. Distribution files at:', appvars.dist);
  });
});

gulp.task('deploy:clean', function () {
  $.runSequence('prep', 'cleandist', function(){
    console.log('\x1b[32m%s\x1b[0m','Tasks completed. Distribution files at:', appvars.dist);
  });
});

gulp.task('watch', ['build', 'connect'], function () {
  gulp.watch(['*.html'], ['statics']);
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('js/source/*.js', ['scripts']);
  gulp.watch(['img/**/*', '_img/**/*'], ['images']);
});

gulp.task('wipe', function () {
  $.del(appvars.dist, {force: true}, function (err, paths) {
    if (paths) {
      console.log('Deleted files/folders:\n', paths.join('\n'))
    }
  })
});

gulp.task('cleandist', function () {
  $.del(appvars.xfolders, {cwd: appvars.dist})
});

gulp.task('prep', ['build', 'wipe'], function () {
  return gulp.src(appvars.includes.concat(appvars.excludes))
      .pipe(gulp.dest(appvars.dist))
});

gulp.task('prep:safe', ['build'], function () {
  return gulp.src(appvars.includes.concat(appvars.excludes))
      .pipe(gulp.dest(appvars.dist))
});

gulp.task('prep:quick', ['wipe'], function () {
  return gulp.src(appvars.includes.concat(appvars.excludes))
      .pipe(gulp.dest(appvars.dist))
});

gulp.task('prep:statics', ['statics'], function () {
  gulp.src(['*.html', '*.php'])
      .pipe(gulp.dest(appvars.dist))
});

gulp.task('prep:styles', ['styles'], function () {
  gulp.src(appvars.css + '/**')
      .pipe(gulp.dest(appvars.dist + appvars.css))
});

gulp.task('prep:scripts', ['scripts'], function () {
  gulp.src([appvars.js + '/**', '!' + appvars.js + '/source/**'])
      .pipe(gulp.dest(appvars.dist + appvars.js))
});

gulp.task('watch:live', function () {
  gulp.watch(['*.html', '*.php'], ['prep:statics']);
  gulp.watch('sass/**/*.scss', ['prep:styles']);
  gulp.watch('js/source/*.js', ['prep:scripts']);
  //gulp.watch(['img/**/*', '_img/**/*'], ['images']);
});

// Default task
gulp.task('default', function () {
  gulp.start('deploy');
});


//SPECIAL TASKS
// - not included in the default automation
// - experimental features

//  UNCSS - removes unecessary CSS files based on the listed HTML files. use with caution
gulp.task('uncss', function () {
  return gulp.src('css/style.css')
      .pipe($.size({
        showFiles: true
      }))
      .pipe($.rename('style.stripped.css')) //uncss
      .pipe($.uncss({
        html: $.glob.sync('*.html')
      }))
      .pipe($.size({
        showFiles: true
      }))
      .pipe(gulp.dest('css'))
      .pipe($.rename('style.stripped.min.css'))
      .pipe($.csso())
      .pipe($.size({
        showFiles: true
      }))
      .pipe(gulp.dest('css'))
});
