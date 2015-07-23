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
    'main-bower-files',
    'browser-sync'
  ],
  replaceString: /\bgulp[\-.]/
});

var app = {
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

var reload = $.browserSync.reload;

var onError = function (err) {
  console.log(err);
};

function makeHashKey(file) {
  return [file.contents.toString('utf8')].join('');
}

function watch() {
  gulp.watch(['*.html'], ['statics',reload]);
  gulp.watch('sass/**/*.scss', ['styles',reload]);
  gulp.watch('js/source/*.js', ['scripts',reload]);
  gulp.watch(['img/**/*', '_img/**/*'], ['images',reload]);
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
  return gulp.src('sass/*.scss')
      .pipe($.sass({
        outputStyle: 'compressed',
        includePaths: [app.bower + 'bootstrap-sass/assets/stylesheets/'],
        onError: console.error.bind(console, 'Sass error:')
      }))
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
        fileCache: new $.cache.Cache({cacheDirName: app.cache}),
        key: makeHashKey,
      }))
      .pipe(gulp.dest('img'))
      .pipe($.connect.reload())
});

gulp.task('connect', function () {

  $.connect.server({
    root: require('path').resolve(''),
    host: app.host,
    port: app.port,
    livereload: true
  });

  require('opn')('http://' + app.host + ':' + app.port);
});

// Build
gulp.task('build', ['statics', 'styles', 'scripts', 'images']);

gulp.task('deploy', function () {
  $.runSequence('prep:safe', 'cleandist', function(){
    console.log('\x1b[32m%s\x1b[0m','Tasks completed. Distribution files at:', app.dist);
  });
});

gulp.task('deploy:clean', function () {
  $.runSequence('prep', 'cleandist', function(){
    console.log('\x1b[32m%s\x1b[0m','Tasks completed. Distribution files at:', app.dist);
  });
});

gulp.task('watch', function () {
  $.browserSync({
    notify: false,
    port: app.port,
    server: {}
  });

  watch();
});

gulp.task('watch:lr', ['build', 'connect'], function () {
  watch();
});

gulp.task('wipe', function () {
  $.del(app.dist, {force: true}, function (err, paths) {
    if (paths) {
      console.log('Deleted files/folders:\n', paths.join('\n'))
    }
  })
});

gulp.task('cleandist', function () {
  $.del(app.xfolders, {cwd: app.dist})
});

gulp.task('prep', ['build', 'wipe'], function () {
  return gulp.src(app.includes.concat(app.excludes))
      .pipe(gulp.dest(app.dist))
});

gulp.task('prep:safe', ['build'], function () {
  return gulp.src(app.includes.concat(app.excludes))
      .pipe(gulp.dest(app.dist))
});

gulp.task('prep:quick', ['wipe'], function () {
  return gulp.src(app.includes.concat(app.excludes))
      .pipe(gulp.dest(app.dist))
});

gulp.task('prep:statics', ['statics'], function () {
  gulp.src(['*.html', '*.php'])
      .pipe(gulp.dest(app.dist))
});

gulp.task('prep:styles', ['styles'], function () {
  gulp.src(app.css + '/**')
      .pipe(gulp.dest(app.dist + app.css))
});

gulp.task('prep:scripts', ['scripts'], function () {
  gulp.src([app.js + '/**', '!' + app.js + '/source/**'])
      .pipe(gulp.dest(app.dist + app.js))
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
